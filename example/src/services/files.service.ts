

import { IgnisignPrivateFileDto } from "@ignisign/public";
import { generateBearerToken } from "../commons/authorization.middleware";
import { saveFileToFolder } from "../utils/files.util";
import { MyFile, MyFileModel } from "../models/file.db.model";
import { MyUser } from "../models/user.db.model";

const buildFileAccessPath = (documentId: string) => {
  return `${process.env.MY_SERVER_URL}/uploads/${documentId}`
}

const getPrivateFileUrl = (documentId) : Promise<IgnisignPrivateFileDto> => {
  return new Promise((resolve, reject) => {
    MyFileModel.findOne({documentId}, (error, found: MyFile) => {
      if (error) {
        reject(error);
      } else {
        const url = buildFileAccessPath(documentId)
        resolve({
          fileUrl  : url,
          mimeType : found.mimeType,
          fileName : found.fileName,
          bearer   : generateBearerToken()
        });
      }
    });
  });
}

const saveFile = (fileHash, file, documentId) => {
  return new Promise(async (resolve, reject) => {

    const path = await saveFileToFolder(file.path, 'uploads', documentId)
    const data = {
      filePath: path, 
      fileHash,
      mimeType: file.mimetype,
      fileName: file.originalname,
      documentId
    }    
    MyFileModel.insert(data, async (error, found: MyUser[]) => {
      if (error) {
        reject(error);
      } else {
        resolve(found);
      }
    });
  });
}

export const FileService = {
  getPrivateFileUrl,
  saveFile
}