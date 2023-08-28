const fs     = require('fs');
const Engine = require('tingodb')();

const envDir = `./data/${process.env.IGNISIGN_APP_ENV}`
const dir    = `${envDir}/${process.env.IGNISIGN_APP_ID}`

if (!fs.existsSync(envDir)) 
  fs.mkdirSync(envDir);

if (!fs.existsSync(dir))
  fs.mkdirSync(dir);

const db = new Engine.Db(dir, {});

export type MyFile = {
  filePath : string;
  fileHash : string;
  mimeType : string;
  fileName : string;
}

export const MyFileModel = db.collection("files");
