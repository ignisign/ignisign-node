
import {
  IGNISIGN_APPLICATION_ENV, IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST, IGNISIGN_SIGNER_CREATION_INPUT_REF, IGNISIGN_WEBHOOK_MESSAGE_NATURE, IGNISIGN_WEBHOOK_TOPICS, IgnisignDocument_InitializationDto, IgnisignSignatureProfile, IgnisignSignatureRequest_Context, IgnisignSignatureRequest_UpdateDto, IgnisignSigner_CreationRequestDto, IgnisignSigner_CreationResponseDto, IgnisignWebhook_ActionDto
} from '@ignisign/public';
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
      IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST.LAUNCHED, 
      IGNISIGN_WEBHOOK_MESSAGE_NATURE.SUCCESS);
      

  } catch (e){
    console.error("Error while initializing Ignisign Nameger Service", e)
  }
}

async function createNewSigner(signatureProfileId, inputs: { [key in IGNISIGN_SIGNER_CREATION_INPUT_REF] ?: string } = {}, externalId: string = null): Promise<IgnisignSigner_CreationResponseDto> {  

  const dto : IgnisignSigner_CreationRequestDto = {
    signatureProfileId,
    ...inputs,
    ...(externalId && {externalId})
  }

  try {
    return await ignisignSdkInstance.createSigner(dto);
  } catch (error) {
    console.error(error.toString());
    throw error
  }
}

async function revokeSigner(signerId: string) : Promise<{signerId : string}> {
  return await ignisignSdkInstance.revokeSigner(signerId);
}

async function uploadHashDocument(signatureRequestId, fileHash, label): Promise<string> {

  const dto : IgnisignDocument_InitializationDto = {
    signatureRequestId,
    label,
  }

  const { documentId } = await ignisignSdkInstance.initializeDocument(dto)
  await ignisignSdkInstance.provideDocumentContent_PrivateContent(documentId, fileHash)
  return documentId 
}

async function uploadDocument(signatureRequestId, uploadDto : IgnisignSdkFileContentUploadDto): Promise<string>{

  const dto : IgnisignDocument_InitializationDto = {
    signatureRequestId,
  }
  const { documentId } = await ignisignSdkInstance.initializeDocument(dto)
  await ignisignSdkInstance.provideDocumentContent_File(documentId, uploadDto)
  return documentId
}

async function getSignatureProfiles(): Promise<IgnisignSignatureProfile[]> {  
  return await ignisignSdkInstance.getSignatureProfiles()
}

async function initSignatureRequest(signatureProfileId: string): Promise<string>{
  const {signatureRequestId} = await ignisignSdkInstance.initSignatureRequest({ signatureProfileId })
  return signatureRequestId
}

async function updateSignatureRequest(signatureRequestId : string, dto: IgnisignSignatureRequest_UpdateDto): Promise<IgnisignSignatureRequest_Context> {
  try {
    const data = await ignisignSdkInstance.updateSignatureRequest(signatureRequestId, dto);
    return data
  } catch (error) {
    throw error;
  }
}

async function publishSignatureRequest(signatureRequestId : string){
  try {
    const data = await ignisignSdkInstance.publishSignatureRequest(signatureRequestId);
    return data
  } catch (error) {
    throw error;
    
  }
}

async function consumeWebhook(actionDto: IgnisignWebhook_ActionDto) {
  return await ignisignSdkInstance.consumeWebhook(actionDto);
}





