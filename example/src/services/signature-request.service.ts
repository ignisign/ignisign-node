import * as FormData from "form-data";
import * as fs from 'fs';

import { IgnisignSignatureRequestIdContainer, Ignisign_SignatureRequest_UpdateDto } from "@ignisign/public";
import { getFileHash } from "../utils/files.util";
import { FileService } from "./files.service";
import { IgnisignSdkManagerService } from "./ignisign-sdk-manager.service";

import { IgnisignSdkFileContentUploadDto } from "@ignisign/sdk";
import { MySignatureRequest, MySignatureRequestModel, MySignatureRequestSignersModel } from "../models/signature-request.db.model";
import { MyUser, MyUserModel } from "../models/user.db.model";

const addSignatureRequest = async (signatureProfileId, signatureRequest: MySignatureRequest) => {
  return new Promise((resolve, reject) => {
    MySignatureRequestModel.insert({...signatureRequest, signatureProfileId}, async (error, found)=>{
      if (error) {
        console.error("addSignatureRequest ERROR : ", error);
        reject(error);
      } else {
        resolve(found);
      }
    });
  });
}

const getSignatureRequests = async (signatureProfileId) => {
  return new Promise((resolve, reject) => {
    MySignatureRequestModel.find({signatureProfileId}).toArray((error, found) => {
      if (error) {
        console.error("getSignatureRequests ERROR : ", error);
        reject(error);
      } else {
        resolve(found);
      }
    });
  });
}

const getSignatureRequestsSigners = async (signatureRequestId) => {
  return new Promise((resolve, reject) => {
    MySignatureRequestSignersModel.findOne({signatureRequestId}, (error, found) => {
      if (error) {
        console.error("getSignatureRequestsSigners ERROR : ", error);
        reject(error);
      } else {
        resolve(found);
      }
    });
  });
}

const getUsers = (usersIds): Promise<MyUser[]> => {
  return new Promise((resolve, reject) => {
    MyUserModel.find({_id: {$in: usersIds}}).toArray(async (error, found: MyUser[]) => {
      if (error) {
        reject(error);
      } else {
        resolve(found);
      }
    });
  });
}

const createNewSignatureRequest = async (signatureProfileId, title, files: {file, fullPrivacy: boolean}[], usersIds) => {
 
  const users: MyUser[]     = await getUsers(usersIds)
  
  
  const signatureRequestId = await IgnisignSdkManagerService.initSignatureRequest(signatureProfileId)
  const documentIds = []

  for (const {file, fullPrivacy} of files) {
    let documentId = null;

    if(fullPrivacy){
      const fileHash = await getFileHash(fs.createReadStream(file.path))
      documentId = await IgnisignSdkManagerService.uploadHashDocument(signatureRequestId, fileHash, file.originalname)
      await FileService.saveFile(fileHash, file, documentId)

    } else {
      const formData = new FormData();
      formData.append('file', await fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype
      });

      const uploadDto : IgnisignSdkFileContentUploadDto = {
        fileStream  : await fs.createReadStream(file.path),
        filename    : file.originalname,
        contentType : file.mimetype
      }

      documentId = await IgnisignSdkManagerService.uploadDocument(signatureRequestId, uploadDto)
    }
    documentIds.push(documentId)
  }

  const dto : Ignisign_SignatureRequest_UpdateDto = {
    title, 
    documentIds,
    signerIds : users.map(e => e.signerId),
  };

  await IgnisignSdkManagerService.updateSignatureRequest(signatureRequestId, dto);
  
  const signatureRequestResult: IgnisignSignatureRequestIdContainer = await IgnisignSdkManagerService.publishSignatureRequest(signatureRequestId);

  addSignatureRequest(
    signatureProfileId,
    { title, signatureRequestId: signatureRequestResult.signatureRequestId }
  );

}

const handleSignatureRequestWebhookSigners = async (webhookContext: any): Promise<any> => {
  const {signers, signatureRequestId} = webhookContext;

  const formatedSigners = signers.map(({signerId, externalId, token})=>({
    signerId,
    token,
    myUserId: externalId,
  }))

  MySignatureRequestSignersModel.insert({signatureRequestId, signers: formatedSigners}, async (error, found)=>{
    console.info('Done');
  });
}

export const SignatureRequestService = {
  createNewSignatureRequest,
  handleSignatureRequestWebhookSigners,
  getSignatureRequests,
  getSignatureRequestsSigners
}