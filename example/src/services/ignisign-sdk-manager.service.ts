
import { IGNISIGN_APPLICATION_ENV, IGNISIGN_WEBHOOK_MESSAGE_NATURE, IGNISIGN_WEBHOOK_TOPICS, IgnisignWebhookActionDto, IgnisignSigner_Creation_RequestDto, IgnisignSigner_Creation_InputMap, IgnisignSigner_Creation_ResponseDto, IGNISIGN_SIGNATURE_REQUEST_WEBHOOK_ACTION, IGNISIGN_SIGNER_ENTITY_TYPE, IgnisignDocumentInitializationDto, Ignisign_SignatureProfile, Ignisign_SignatureRequest_UpdateDto, IgnisignSignatureRequestContext } from '@ignisign/public';
import { IgnisignSdk, IgnisignSdkFileContentUploadDto } from '@ignisign/sdk';
import { SignatureRequestService } from './signature-request.service';

let ignisignSdkInstance: IgnisignSdk = null;

export const IgnisignSdkManagerService = {
  init,
  createNewSigner,
  revokeSigner,
  consumeWebhook,
  updateSignatureRequest,
  publishSignatureRequest,
  getSignatureProfiles,
  initSignatureRequest,
  uploadHashDocument,
  uploadDocument,
}

const IGNISIGN_APP_ID     = process.env.IGNISIGN_APP_ID
const IGNISIGN_APP_ENV: IGNISIGN_APPLICATION_ENV = IGNISIGN_APPLICATION_ENV[process.env.IGNISIGN_APP_ENV]
const IGNISIGN_APP_SECRET = process.env.IGNISIGN_APP_SECRET

const exampleConsumeWebhook = async ( webhookContext: any, topic : IGNISIGN_WEBHOOK_TOPICS, action : string, msgNature : IGNISIGN_WEBHOOK_MESSAGE_NATURE): Promise<boolean> => {
  return true;
}

async function init() {
  if(!IGNISIGN_APP_ID || !IGNISIGN_APP_ENV || !IGNISIGN_APP_SECRET)
    throw new Error(`IGNISIGN_APP_ID, IGNISIGN_APP_ENV and IGNISIGN_APP_SECRET are mandatory to init IgnisignSdkManagerService`);
    
  try {
    ignisignSdkInstance = new IgnisignSdk({
      appId           : IGNISIGN_APP_ID,
      appEnv          : (<IGNISIGN_APPLICATION_ENV>IGNISIGN_APP_ENV),
      appSecret       : IGNISIGN_APP_SECRET,
      displayWarning  : true,
    })

    await ignisignSdkInstance.registerWebhookCallback(exampleConsumeWebhook, IGNISIGN_WEBHOOK_TOPICS.APP,               "CREATED", IGNISIGN_WEBHOOK_MESSAGE_NATURE.SUCCESS);
    await ignisignSdkInstance.registerWebhookCallback(exampleConsumeWebhook, IGNISIGN_WEBHOOK_TOPICS.SIGNATURE,         "CREATED", IGNISIGN_WEBHOOK_MESSAGE_NATURE.SUCCESS);
    await ignisignSdkInstance.registerWebhookCallback(exampleConsumeWebhook, IGNISIGN_WEBHOOK_TOPICS.SIGNER,            "CREATED", IGNISIGN_WEBHOOK_MESSAGE_NATURE.SUCCESS);
    await ignisignSdkInstance.registerWebhookCallback(exampleConsumeWebhook, IGNISIGN_WEBHOOK_TOPICS.DOCUMENT_REQUEST,  "CREATED", IGNISIGN_WEBHOOK_MESSAGE_NATURE.SUCCESS);
    await ignisignSdkInstance.registerWebhookCallback(exampleConsumeWebhook, IGNISIGN_WEBHOOK_TOPICS.SIGNER_KEY,        "CREATED", IGNISIGN_WEBHOOK_MESSAGE_NATURE.SUCCESS);

    await ignisignSdkInstance.registerWebhookCallback(
      SignatureRequestService.handleSignatureRequestWebhookSigners,  
      IGNISIGN_WEBHOOK_TOPICS.SIGNER, 
      IGNISIGN_SIGNATURE_REQUEST_WEBHOOK_ACTION.LAUNCHED, 
      IGNISIGN_WEBHOOK_MESSAGE_NATURE.SUCCESS);
      

  } catch (e){
    console.error("Error while initializing Ignisign Nameger Service", e)
  }
}

async function createNewSigner(signatureProfileId, inputs: IgnisignSigner_Creation_InputMap = {}, externalId: string = null): Promise<IgnisignSigner_Creation_ResponseDto> {  

  const dto : IgnisignSigner_Creation_RequestDto = {
    signatureProfileId,
    ...inputs,
    ...(externalId && {externalId})
  }

  try {
    return await ignisignSdkInstance.createSigner(dto);
    
  } catch (error) {
    console.log(error.toString());
    
  }
}

async function revokeSigner(signerId: string) : Promise<{signerId : string}> {
  return await ignisignSdkInstance.revokeSigner(signerId);
}

async function uploadHashDocument(signatureRequestId, fileHash, label): Promise<string> {

  const dto : IgnisignDocumentInitializationDto = {
    signatureRequestId,
    label,
  }


  const { documentId } = await ignisignSdkInstance.initializeDocument(dto)
  await ignisignSdkInstance.provideDocumentContent_PrivateContent(documentId, fileHash)
  return documentId 
}

async function uploadDocument(signatureRequestId, uploadDto : IgnisignSdkFileContentUploadDto): Promise<string>{

  const dto : IgnisignDocumentInitializationDto = {
    signatureRequestId,
  }
  const { documentId } = await ignisignSdkInstance.initializeDocument(dto)
  await ignisignSdkInstance.provideDocumentContent_File(documentId, uploadDto)
  return documentId 

}

async function getSignatureProfiles(): Promise<Ignisign_SignatureProfile[]> {  
  return await ignisignSdkInstance.getSignatureProfiles()
}

async function initSignatureRequest(signatureProfileId: string): Promise<string>{
  const {signatureRequestId} = await ignisignSdkInstance.initSignatureRequest({ signatureProfileId })
  return signatureRequestId
}

async function updateSignatureRequest(signatureRequestId : string, dto: Ignisign_SignatureRequest_UpdateDto): Promise<IgnisignSignatureRequestContext> {
  return await ignisignSdkInstance.updateSignatureRequest(signatureRequestId, dto);
}

async function publishSignatureRequest(signatureRequestId : string){
  return await ignisignSdkInstance.publishSignatureRequest(signatureRequestId);
}

async function consumeWebhook(actionDto: IgnisignWebhookActionDto) {
  return await ignisignSdkInstance.consumeWebhook(actionDto);
}





