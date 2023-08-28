import _ = require("lodash");

const fs = require('fs');
const crypto: any = require('crypto');

const saveFileToFolder = (filePath, folderPath, fileName = null) => {
  return new Promise((resolve, reject) => {
    const name = filePath.split('/').pop(); // Extract the file name from the file path
    const destinationPath = `${folderPath}/${fileName ?? name}`;

    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(destinationPath);

    readStream.on('error', reject);
    writeStream.on('error', reject);

    writeStream.on('finish', () => {
      resolve(destinationPath);
    });

    readStream.pipe(writeStream);
  });
}

const algorithm = 'sha256'
const encoding = 'base64'
 
type HashDataInput = string | NodeJS.ReadableStream;

async function getFileHash(input: HashDataInput) : Promise<string>{
  if(_.isString(input))
    return getHashFromString(<string>input)

  return getHashFromStream(<NodeJS.ReadableStream>input);
}

async function getHashFromString(input : string): Promise<string>{
  return crypto.createHash('sha256').update(input).digest('base64');
}

async function getHashFromStream(input: any): Promise<string>{
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash("sha256");
      input.on('error', err => reject(err));
      input.on('data', chunk => hash.update(chunk));
      input.on('end', () => resolve(hash.digest('base64')));
    } catch (e) {
      reject(e);
    }
  });
}

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return;
    }
  });
}

export {
  getFileHash,
  saveFileToFolder,
  deleteFile,
}