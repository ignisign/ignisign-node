import * as path from 'path';

// @ts-ignore
global['appRoot'] = path.join(__dirname, '..');

import { NextFunction, Request, Response } from 'express';

import 'dotenv/config';

import { App } from './commons/app';
import { errorMiddleware } from './commons/error.middleware';
import { jsonSuccess } from './commons/utils';
import { IgnisignManagerService } from './services/ignisign-webhook.manager';

import { SignerService } from './services/signer.service';
import { SignatureRequestService } from './services/signature-request.service';
import { SignatureProfileService } from './services/signature-profile.service';
import { deleteFile } from './utils/files.util';
import { FileService } from './services/files.service';

const UPLOAD_TMP = 'uploads_tmp/'
const multer = require('multer');
const upload = multer({ dest: UPLOAD_TMP });


const initExampleApp = async () =>{
  try {
    const app     = new App();
    const router  = app.router;
    await IgnisignManagerService.init();

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

        console.log('TEST_1 : ', signatureProfileId);

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
        await IgnisignManagerService.revokeSigner(found.signerId);
        return jsonSuccess(res, found);
      } catch(e) { next(e) }
    })

    router.post('/v1/ignisign-webhook', async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log('CONSUME_WEBHOOK');
        const result = await IgnisignManagerService.consumeWebhook(req.body);
        jsonSuccess(res, result);
      } catch(e) { next(e) }
    })

    app.app.use(router);
    app.app.use(errorMiddleware);
    app.listen();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  
}


initExampleApp();

