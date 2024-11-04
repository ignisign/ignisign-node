
import * as crypto from "crypto";

export const IgnisignSdkUtilsService = {

  parsePrivateKeyFromEnv,

  sealM2M_doSignPayload,
  bareSignature_GenerateCodeVerifier,
  bareSiganture_GenerateCodeChallenge,

  generateECDSAKey,

}

function parsePrivateKeyFromEnv(envKey: string) : string{
  if(!envKey)
    throw new Error('key not set: mandatory to init IgnisignSdkManagerSignatureService');

  return envKey
    .replace(/\|/g    ,'\n')
    .replace(/\\n/gm  ,'\n');
}


function sealM2M_doSignPayload(privateKeyPem: string, documentHash: string): { signature: string } {
    
  const hashBuffer  = Buffer.from(documentHash, 'hex');//base64 ?
  const privateKey  = crypto.createPrivateKey(privateKeyPem);
  const signature   = crypto.sign(null, hashBuffer, privateKey);
  return { signature : signature.toString('hex') }; //.toString('base64');
}


function bareSignature_GenerateCodeVerifier(length = 128) : string{
  const codeVerifier = crypto.randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return codeVerifier;
}

function bareSiganture_GenerateCodeChallenge(codeVerifier: string) : string{
  return crypto.createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
}

function generateECDSAKey() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', 
  {
    namedCurve: 'P-256',
    publicKeyEncoding: {
      type: 'spki',      // Public key standard
      format: 'pem'       // Encoding format
    },
    privateKeyEncoding: {
      type: 'pkcs8',  // Use 'pkcs8' for private key encoding
      format: 'pem'
    }
  });
  return { publicKey, privateKey }
}



