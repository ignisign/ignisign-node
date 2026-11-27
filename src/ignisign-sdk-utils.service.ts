
import * as crypto from "crypto";
import { IGNISIGN_APPLICATION_ENV } from "@ignisign/public";

export const IgnisignSdkUtilsService = {

  parsePrivateKeyFromEnv,

  sealM2M_doSignPayload,
  bareSignature_GenerateCodeVerifier,
  bareSiganture_GenerateCodeChallenge,

  generateECDSAKey,

  exportAppIdAndEnv,

}


function exportAppIdAndEnv(apiKey: string) : { appId: string, appEnv: IGNISIGN_APPLICATION_ENV }{
  const [sk, appEnvLowerCase, appIdWithoutPrefix, secretEnd] = apiKey.split('_');

  const appEnv = appEnvLowerCase.toUpperCase() as IGNISIGN_APPLICATION_ENV;

  const appId = `appId_${appIdWithoutPrefix}`;

  return { appId, appEnv }
}

function parsePrivateKeyFromEnv(envKey: string) : string{
  if(!envKey)
    throw new Error('key not set: mandatory to init IgnisignSdk');

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
  // RFC 7636 §4.1: 43..128 chars from the unreserved set. Clamp instead of throwing so
  // existing callers passing other values keep working (non-breaking for SDK users).
  length = Math.min(128, Math.max(43, Math.floor(Number(length) || 128)));

  const randomBytes = crypto.randomBytes(length);
  const codeVerifier = randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, length);
  
  if (codeVerifier.length < 43) {
    throw new Error('Generated code verifier is too short');
  }
  
  return codeVerifier;
}

function bareSiganture_GenerateCodeChallenge(codeVerifier: string) : string{
  if (!codeVerifier || codeVerifier.length < 43) {
    throw new Error('Code verifier must be at least 43 characters');
  }
  
  return crypto.createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
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



