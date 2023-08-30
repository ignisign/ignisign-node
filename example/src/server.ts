import * as path from 'path';

// @ts-ignore
global['appRoot'] = path.join(__dirname, '..');

import * as moment from "moment";
import * as express from 'express';
import cookieParser = require('cookie-parser');
import cors = require('cors');

import { NextFunction, Request, Response } from 'express';

import 'dotenv/config';

import { IgnisignSdkManagerService } from './services/ignisign-sdk-manager.service';

import { SignerService } from './services/signer.service';
import { SignatureRequestService } from './services/signature-request.service';
import { SignatureProfileService } from './services/signature-profile.service';
import { deleteFile } from './utils/files.util';
import { FileService } from './services/files.service';


import { checkBearerToken } from './utils/authorization.middleware';



const UPLOAD_TMP = 'uploads_tmp/'
const multer    = require('multer');
const upload    = multer({ dest: UPLOAD_TMP });
const port      = process.env.PORT || 4242;

const jsonSuccess = <T = any>(res : Response, obj : T) => {
  res.status(200).json(obj);
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

    router.post('/v1/signature-profiles/:signatureProfileId/signature-requests', upload.array('file'), async (req: any, res) => {      
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
        console.error(error);
         
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

    const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {

      let status = 500;
      let message = error.message || 'Something went wrong';
    
      const timestamp = `${moment().utc().format('YYYY-MM-DD HH:mm:ss ZZ')}`;
    
      let result :any = { message, timestamp };
    
      const errorHeaderMessage = `[ERROR] [ ${timestamp} | ${status} ]`;
    
      console.error(errorHeaderMessage)
    
      if(error?.name)
        console.error("* Name: ", error?.name);
    
      if(error?.message)
        console.error("* Message: ", error?.message);
    
      if(error?.stack)
        console.error("* Stack: ", error?.stack);
    
      console.error(`------------------------- END ERROR -------------------------`);
      res.status(status).json(result);
    }

    app.use(errorMiddleware);
    app.listen(port, () => console.info(`🚀 App listening on the port ${port}`));

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}


initExampleApp();

