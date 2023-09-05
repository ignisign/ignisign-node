import * as path from 'path';

// @ts-ignore
global['appRoot'] = path.join(__dirname, '..');


import * as express from 'express';
import cookieParser = require('cookie-parser');
import cors = require('cors');

import validateEnv from './utils/validate-env';

import { NextFunction, Request, Response } from 'express';
  
import 'dotenv/config'; 
import { IgnisignSdkManagerService } from './services/ignisign-sdk-manager.service';
import { SignerService } from './services/signer.service';
import { SignatureRequestService } from './services/signature-request.service';
import { SignatureProfileService } from './services/signature-profile.service';
import { deleteFile } from './utils/files.util';
import { FileService } from './services/files.service';
import { errorMiddleware } from './utils/error.middleware';
import { checkBearerToken } from './utils/authorization.middleware';

validateEnv()

const UPLOAD_TMP = 'uploads_tmp/'
const multer    = require('multer');
const upload    = multer({ dest: UPLOAD_TMP });
const port      = process.env.PORT || 4242;

const jsonSuccess = <T = any>(res : Response, obj : T) => {
  res.status(200).json(obj);
}

const jsonError = (res : Response, error : any) => {
  res.status(400).json({message: error?.context?.message});
}
 
const initExampleApp = async () =>{
  try {

    const app     : express.Application = express();
    const router  : express.Router      = express.Router();

    app.use(express.json({limit: "15mb"}));
    app.use(express.urlencoded({ extended: true , limit: "15mb"}));
    app.use(cookieParser());
    app.use(cors({ origin: true, credentials: true }));
    app.use('/uploads', checkBearerToken, express.static('uploads'));
    

    await IgnisignSdkManagerService.init();

    router.get('/v1/healthcheck', (req, res) => jsonSuccess(res, {status: 'ok'} ));

    router.get('/v1/signature-profiles', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const found = await SignatureProfileService.getSignatureProfiles()
        return jsonSuccess(res, found)
      } catch(e) { next(e) }
    })


    router.get('/v1/signature-profiles/:signatureProfileId/signature-requests', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {signatureProfileId} = req.params
        const found = await SignatureRequestService.getSignatureRequests(signatureProfileId)
        return jsonSuccess(res, found)
      } catch(e) { next(e) }
    })

    router.get('/v1/signature-requests/:signatureRequestId', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { signatureRequestId } = req.params
        console.log('getSignatureRequest : ', signatureRequestId);
        const found = await SignatureRequestService.getSignatureRequestsSigners(signatureRequestId)
        return jsonSuccess(res, found)
      } catch(e) { next(e) }
    })

    router.get('/v1/files/:fileHash', async (req: Request, res: Response, next: NextFunction) => {
      try {        
        const {fileHash} = req.params
        const found = await FileService.getPrivateFileUrl(fileHash)
        return jsonSuccess(res, found)
      } catch(e) { next(e) }
    })

    router.post('/v1/signature-profiles/:signatureProfileId/signature-requests', upload.array('file'), async (req: any, res, next) => {      
      let pathsToDelete = []
      try {
        const {title, usersIds, fullPrivacy} = req.body
        const {signatureProfileId} = req.params
        const files = req.files.map((e, i)=>{          
          pathsToDelete.push(`${e.path}`)
          return {file: e, fullPrivacy: JSON.parse(fullPrivacy[i])}
        })        

        await SignatureRequestService.createNewSignatureRequest(signatureProfileId, title, files, usersIds.split(','))
        jsonSuccess(res, {status: 'ok'} )
      } catch (error) {
        jsonError(res, error)
      }
      finally {
        for (const pathToDelete of pathsToDelete) {
          deleteFile(pathToDelete)
        }
      }
    });

    router.post('/v1/signature-profiles/:signatureProfileId/users', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {signatureProfileId} = req.params
        await SignerService.addSigner(signatureProfileId, req.body)
        return jsonSuccess(res, {status: 'ok'} )
      } catch(e) { next(e) }
    })

    router.get('/v1/users/', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const found = await SignerService.getUsers();
        return jsonSuccess(res, found)
      } catch(e) { next(e) }
    })

    router.delete('/v1/users/:userId', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const found = await SignerService.deleteUser(req.params.userId);
        await IgnisignSdkManagerService.revokeSigner(found.signerId);
        return jsonSuccess(res, found);
      } catch(e) { next(e) }
    })

    router.post('/v1/ignisign-webhook', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await IgnisignSdkManagerService.consumeWebhook(req.body);
        jsonSuccess(res, result);
      } catch(e) { next(e) }
    })

    app.use(router);
    app.use(errorMiddleware);
    app.listen(port, () => console.info(`🚀 App listening on the port ${port}`));

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}


initExampleApp();

