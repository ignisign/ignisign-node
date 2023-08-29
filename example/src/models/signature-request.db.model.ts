import * as fs from 'fs';

const Engine = require('tingodb')();

const envDir = `./data/${process.env.IGNISIGN_APP_ENV}`
const dir    = `${envDir}/${process.env.IGNISIGN_APP_ID}`

if (!fs.existsSync(envDir)) 
  fs.mkdirSync(envDir);

if (!fs.existsSync(dir))
  fs.mkdirSync(dir);

const db = new Engine.Db(dir, {});

export type MySignatureRequest = {
  _id                   ?: string;
  title                 ?: string;
  signatureRequestId    ?: string;
}

export type MySignatureRequestSigners = {
  _id                 ?: string;
  signatureRequestId  ?: string;
  signers ?: {
    signerId   ?: string;
    myUserId   ?: string;
    token      ?: string;
  }[]
}

export const MySignatureRequestModel   = db.collection("signature-requests");
export const MySignatureRequestSignersModel = db.collection("signature-requests-signers");