import { ResponseType } from "axios";
import * as FormData from "form-data";
import * as uuid from "uuid";


import {
  IGNISIGN_APPLICATION_TYPE,
  IGNISIGN_ERROR_CODES,
  IGNISIGN_SIGNER_CREATION_INPUT_REF,
  IGNISIGN_WEBHOOK_ACTION_ALL,
  IGNISIGN_WEBHOOK_ACTION_APPLICATION,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_IMAGE,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROOF,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_SESSION,
  IGNISIGN_WEBHOOK_ACTION_SIGNER,
  IGNISIGN_WEBHOOK_EVENT_FILTER,
  IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  IGNISIGN_WEBHOOK_TOPICS,
  IgniSign_SignM2MRequestDto,
  IgniSign_SignM2MResponseDto,
  IgnisignApplication_Context,
  IgnisignDocument,
  IgnisignDocument_AuthenticityValidationContainer,
  IgnisignDocument_ContentCreation_DataJsonDto,
  IgnisignDocument_ContentCreation_PrivateContentDto,
  IgnisignDocument_Context,
  IgnisignDocument_InitializationDto,
  IgnisignInputNeedsDto,
  IgnisignSignature,
  IgnisignSignatureImages_Dto,
  IgnisignSignatureRequest_Context,
  IgnisignSignatureRequest_IdContainer,
  IgnisignSignatureRequest_Publish_ResponseDTO,
  IgnisignSignatureRequest_UpdateDto,
  IgnisignSignatureRequests_Paginate,
  IgnisignSignatureRequests_StatusContainer,
  IgnisignSignerProfile,
  IgnisignSigner_Context,
  IgnisignSigner_CreationRequestDto,
  IgnisignSigner_CreationResponseDto,
  IgnisignSigner_Summary,
  IgnisignSigner_UpdateRequestDto,
  IgnisignSigners_SearchResultDto,
  IgnisignTechnicalToken_CheckAndConsumeDto,
  IgnisignWebhook,
  IgnisignWebhookDto_Application,
  IgnisignWebhookDto_Signature,
  IgnisignWebhookDto_SignatureAdvancedProof,
  IgnisignWebhookDto_SignatureImage,
  IgnisignWebhookDto_SignatureProof_Error,
  IgnisignWebhookDto_SignatureProof_Success,
  IgnisignWebhookDto_SignatureRequest,
  IgnisignWebhookDto_SignatureSession,
  IgnisignWebhookDto_Signer,
  IgnisignWebhookEvent,
  IgnisignWebhookEvent_ListingDto,
  IgnisignWebhook_Action,
  IgnisignWebhook_ActionDto,
  IgnisignWebhook_Callback,
  IgnisignWebhook_EndpointDto,
  IgnisignWebhook_SettingsDescription,
  Ignisign_BareSignature_GetAuthrozationUrlResponse,
  Ignisign_BareSignature_GetAuthrozationUrlRequest,
  Ignisign_BareSignature_ProofAccessTokenRequest,
  Ignisign_BareSignature_ProofAccessToken,
  IgnisignLogCapsule_ResponseDto,
  IgnisignLogCapsule_RequestDto,
  IgnisignApplication_BareSignatureEnvSettings,
} from "@ignisign/public";

import { Readable } from "stream";
import { IgnisignHttpApi } from "./ignisign-http.service";
import { createIgnisignSdkError } from "./ignisign-sdk-error.service";
import { DEFAULT_IGNISIGN_SIGN_URL, ignisignRemoteServiceUrls } from "./ignisign-sdk.constant";
import { Ignisign_BareSignature_SdkProofAccessTokenRequest, IgnisignSdkFileContentUploadDto, IgnisignSdkInitializer, IgnisignSignM2mSignatureRequestPayload, IgnisignWebhook_CallbackMapper } from "./ignisign-sdk.models";
import { IgnisignSdkUtilsService } from "./ignisign-sdk-utils.service";


const LOG_ACTIVATED = false;
const _logIfActivated = (...args) => {
  if(LOG_ACTIVATED){
    console.info(...args)
  }
}

const CONSOLE_YELLOW_COLOR = '\x1b[33m%s\x1b[0m';
const IGNISIGN_SIGN_URL = process.env.IGNISIGN_SIGN_URL || DEFAULT_IGNISIGN_SIGN_URL;


export class IgnisignSdk extends IgnisignHttpApi {

  private callbacks: IgnisignWebhook_CallbackMapper<any>[] = [];
  private appType : IGNISIGN_APPLICATION_TYPE;
  private appContext : IgnisignApplication_Context;

  constructor(init: IgnisignSdkInitializer){
    super(init);
  }
  
  public async init(){
    await super.init();
    
    await this._checkConfiguration();
  }

  private _consoleYellow (message : string, isFirstLine = false){
    if(this._init?.displayWarning){
      if(isFirstLine)
        console.log("\n")
      
      console.log(CONSOLE_YELLOW_COLOR, `[IGNISIGN SDK] ${message}`)
    }
      
  };

  private async _checkConfiguration(){

    await this.getApplicationContext();

    this.appType = this.appContext.appType;

    this._assertIsAppType([...Object.values(IGNISIGN_APPLICATION_TYPE)]); // check if the app type is valid (not IGNISIGN_RIGHT_DELEGATION or WEB3_PROOF)
    
    if(this.appType === IGNISIGN_APPLICATION_TYPE.SIGNATURE){
      // TODO check signer profiles to see if they need warnings
      await this._checkWebhookPresence();

    }

    if(this.appType === IGNISIGN_APPLICATION_TYPE.SEAL){
      await this._checkWebhookPresence();

    }

    if(this.appType === IGNISIGN_APPLICATION_TYPE.BARE_SIGNATURE){
      const bareSignAppEnvSettings : IgnisignApplication_BareSignatureEnvSettings = await this.getBareSignatureConfiguration();

      if(bareSignAppEnvSettings.authorizedOrigins.length === 0){
        
        this._consoleYellow("You are receiving this warning as you have not set any authorized origins for your Bare Signature application.", true);
        this._consoleYellow("Please set at least one authorized origin in your Ignisign application settings.");
      }

      if(bareSignAppEnvSettings.redirectUris.length === 0){
        this._consoleYellow("You are receiving this warning as you have not set any redirect uri for your Bare Signature application.", true);
        this._consoleYellow("Please set at least one redirect uri in your Ignisign application settings.");
      }

    }

    if(this.appType === IGNISIGN_APPLICATION_TYPE.LOG_CAPSULE){
    
    }

  }

  private async _checkWebhookPresence () {
    const webhooks = await this.getWebhookEndpoints()

    if (!this._init?.disableWebhookWarning && webhooks?.length === 0) {

      this._consoleYellow("You are receiving this warning as you have not set any webhook endpoint.");
      this._consoleYellow("You will not be able to receive any webhook from Ignisign.");
      this._consoleYellow("Please set at least one webhook endpoint in your Ignisign application settings.");
      this._consoleYellow("If you want to disable this warning, please set the disableWebhookWarning property to true in the IgnisignSdkInitializer object.");
    }
  } 

  private async _assertIsAppType(types : IGNISIGN_APPLICATION_TYPE[], functionName? : string){
    if(!this.appContext)
      await this.getApplicationContext();
    

    if (!this.appType){
      this.appType = this.appContext.appType;
    }

    if(this.appType === IGNISIGN_APPLICATION_TYPE.IGNISIGN_RIGHT_DELEGATION)
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.BAD_REQUEST, 
          { customMessage : "[IGNISIGN SDK] Access to a right delegation application is forbidden by SDK",}, 
          null, this.execContext)

    if(this.appType === IGNISIGN_APPLICATION_TYPE.WEB3_PROOF)
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.NOT_YET_IMPLEMENTED, 
        { customMessage : "[IGNISIGN SDK] Web3 Proof application type is not yet implemented"},
        null, this.execContext)


    const isInAppType = types.includes(this.appType);

    if(!isInAppType){
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.BAD_REQUEST, {
        customMessage : "[IGNISIGN SDK] You are trying to use a feature that is not available for your application type",
        appType : this.appType,
        expectedTypes : types,
        functionName : functionName,
      }, null, this.execContext)
    }
  }

  private async _assertIsAppTypeSignature(functionName? : string){
    await this._assertIsAppType([IGNISIGN_APPLICATION_TYPE.SIGNATURE], functionName);
  }

  private async _assertIsAppTypeSeal(functionName? : string){
    await this._assertIsAppType([IGNISIGN_APPLICATION_TYPE.SEAL], functionName);
  }

  private async _assertIsAppTypeBareSignature(functionName? : string){
    await this._assertIsAppType([IGNISIGN_APPLICATION_TYPE.BARE_SIGNATURE], functionName);
  }

  private async _assertIsAppTypeLogCapsule(functionName? : string){
    await this._assertIsAppType([IGNISIGN_APPLICATION_TYPE.LOG_CAPSULE], functionName);
  }

  private async _assertIsAppTypeSignatureOrSeal(functionName? : string){
    await this._assertIsAppType([IGNISIGN_APPLICATION_TYPE.SIGNATURE, IGNISIGN_APPLICATION_TYPE.SEAL], functionName);
  }

  private async _assertIsAppTypeSignatureOrSealOrBareSignature(functionName? : string){
    await this._assertIsAppType([IGNISIGN_APPLICATION_TYPE.SIGNATURE, IGNISIGN_APPLICATION_TYPE.SEAL, IGNISIGN_APPLICATION_TYPE.BARE_SIGNATURE], functionName);
  }

  

   /************** APPLICATION *************/

   public async getApplicationContext(refresh = false): Promise<IgnisignApplication_Context> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    
    if(this.appContext && !refresh)
      return this.appContext;

    const { appId }  = this.execContext;
    const appContext = await ignisignConnectedApi.get<IgnisignApplication_Context>(ignisignRemoteServiceUrls.getApplicationContext, {urlParams: { appId }});
    this.appContext  = appContext;

    return appContext;
   }

  /************** SIGNER PROFILE *************/

  public async getSignerProfile(signerProfileId): Promise<IgnisignSignerProfile> {
    await this._assertIsAppTypeSignatureOrSeal("getSignerProfile")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }          = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignerProfile>(ignisignRemoteServiceUrls.getSignerProfile, {urlParams: { appId, appEnv, signerProfileId}});
   }

   public async getSignerProfiles(): Promise<IgnisignSignerProfile[]> {
    await this._assertIsAppTypeSignatureOrSeal("getSignerProfiles")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }          = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignerProfile[]>(ignisignRemoteServiceUrls.getSignerProfiles, {urlParams: { appId, appEnv}});
   }

  /************** SIGNERS *************/

  public async regenerateSignerAuthSecret(signerId: string): Promise<{authSecret: string}> {
    await this._assertIsAppTypeSignatureOrSeal("regenerateSignerAuthSecret")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }          = this.execContext;
    return await ignisignConnectedApi.put<{authSecret: string}>(ignisignRemoteServiceUrls.regenerateSignerAuthSecret, {}, { urlParams: { appId, appEnv, signerId } });
  }

  public async getSignerInputsConstraintsFromSignerProfileId(signerProfileId : string) : Promise<IgnisignInputNeedsDto> {
    await this._assertIsAppTypeSignatureOrSeal("getSignerInputsConstraintsFromSignerProfileId")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignInputNeedsDto>(ignisignRemoteServiceUrls.getSignerInputsConstraintsFromSignerProfileId, { urlParams: { appId, appEnv, signerProfileId } });
  }

  public async getSignerWithDetails(signerId : string): Promise<IgnisignSigner_Context> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getSignerWithDetails")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigner_Context>(ignisignRemoteServiceUrls.getSignerWithDetails,  { urlParams: { appId, appEnv, signerId } });
  }
  public async getSignerSummary(signerId : string): Promise<IgnisignSigner_Summary> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getSignerSummary")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigner_Summary>(ignisignRemoteServiceUrls.getSignerSummary,  { urlParams: { appId, appEnv, signerId } });
  }

  public async searchApplicationSigners(filter: string): Promise<IgnisignSigners_SearchResultDto> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("searchApplicationSigners")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigners_SearchResultDto>(ignisignRemoteServiceUrls.searchApplicationSigners, { urlParams: { appId, appEnv }, params: { filter } });
  }

  public async getPaginateApplicationSigners(page: number): Promise<IgnisignSigners_SearchResultDto> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getPaginateApplicationSigners")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigners_SearchResultDto>(ignisignRemoteServiceUrls.getPaginateApplicationSigners, { urlParams: {  appId, appEnv}, params: { page : page.toString() } });
  }

  public async createSigner(dto: IgnisignSigner_CreationRequestDto) {
    await this._assertIsAppTypeSignatureOrSeal("createSigner")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post<IgnisignSigner_CreationResponseDto>(ignisignRemoteServiceUrls.createSigner, dto, { urlParams: { appId, appEnv } });
  }
  
  public async updateSigner(signerId: string, dto: IgnisignSigner_UpdateRequestDto) {
    await this._assertIsAppTypeSignatureOrSeal("updateSigner")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.put<IgnisignSigner_CreationResponseDto>(ignisignRemoteServiceUrls.updateSigner, dto, { urlParams: { appId, appEnv, signerId } });
  }
  
  public async revokeSigner(signerId: string): Promise<{signerId : string}> {
    await this._assertIsAppTypeSignatureOrSeal("revokeSigner")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.delete<{signerId : string}>(ignisignRemoteServiceUrls.revokeSigner, { urlParams: { appId, appEnv, signerId } });
  }

  /************** DOCUMENT FILES *************/

  public async initializeDocument(dto: IgnisignDocument_InitializationDto): Promise<{documentId : string}> {
    await this._assertIsAppTypeSignatureOrSeal("initializeDocument")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post<{documentId : string}>(ignisignRemoteServiceUrls.initializeDocument, dto, { urlParams: { appId, appEnv } });
  }

  public async getDocumentById(documentId: string): Promise<IgnisignDocument> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getDocumentById")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignDocument>(ignisignRemoteServiceUrls.getDocumentById, { urlParams: { documentId } });
  }

  public async getDocumentContext(documentId: string): Promise<IgnisignDocument_Context> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getDocumentContext")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignDocument_Context>(ignisignRemoteServiceUrls.getDocumentContext, { urlParams: { documentId } });
  }

  public async updateDocument(documentId: string, dto: IgnisignDocument_InitializationDto): Promise<IgnisignDocument> {
    await this._assertIsAppTypeSignatureOrSeal("updateDocument")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.put<IgnisignDocument>(ignisignRemoteServiceUrls.updateDocument, dto, { urlParams: { documentId } });
  }

  public async removeDocument(documentId: string): Promise<{documentId : string}> {
    await this._assertIsAppTypeSignatureOrSeal("removeDocument")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.delete<{documentId : string}>(ignisignRemoteServiceUrls.removeDocument, { urlParams: { documentId } });
  }

  public async removeDocumentContent(documentId: string): Promise<IgnisignDocument> {
    await this._assertIsAppTypeSignatureOrSeal("removeDocumentContent")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.delete<IgnisignDocument>(ignisignRemoteServiceUrls.removeDocumentContent, { urlParams: { documentId } });
  }

  public async provideDocumentContent_DataJson(documentId: string, content : any): Promise<IgnisignDocument> {
    await this._assertIsAppTypeSignatureOrSeal("provideDocumentContent_DataJson")
    const dto: IgnisignDocument_ContentCreation_DataJsonDto = { jsonContent : content};

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_DataJson, dto , { urlParams: { documentId } });
  }

  public async provideDocumentContent_PrivateContent(documentId: string, documentHash: string): Promise<IgnisignDocument> {
    await this._assertIsAppTypeSignatureOrSeal("provideDocumentContent_PrivateContent")
    const dto: IgnisignDocument_ContentCreation_PrivateContentDto = { documentHash };
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_PrivateContent, dto, { urlParams: { documentId } });
  }

  public async provideDocumentContent_File(documentId: string, uploadDto : IgnisignSdkFileContentUploadDto): Promise<IgnisignDocument> {
    await this._assertIsAppTypeSignatureOrSeal("provideDocumentContent_File")
    const formData = new FormData();

    formData.append('file', uploadDto.fileStream, {
      filename    : uploadDto.fileName,
      contentType : uploadDto.contentType
    });

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_File, formData, { urlParams: { documentId } , headers: {...formData.getHeaders()} });
  }

  public async downloadOriginalDoc(documentId : string): Promise<Readable> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("downloadOriginalDoc")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadOriginalDoc, { urlParams: { documentId }, responseType:<ResponseType>('stream') });
  }

  public async downloadDocumentSignatureXades(documentId : string, signatureId : string): Promise<Readable> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("downloadDocumentSignatureXades")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadDocumentSignatureXades,  { urlParams: { documentId, signatureId }, responseType:<ResponseType>('stream') });
  }

  public async downloadAsicFile(documentId : string): Promise<Readable> {
    await this._assertIsAppTypeSignatureOrSeal("downloadAsicFile")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadAsicFile, { urlParams: { documentId }, responseType:<ResponseType>('stream')});
  }

  public async getSignaturesImages(documentId : string): Promise<IgnisignSignatureImages_Dto> {
    await this._assertIsAppTypeSignature("getSignaturesImages")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.getSignatureImg, { urlParams: {documentId } });
  }

  public async checkDocumentAuthenticity(documentId : string, file: File): Promise<IgnisignDocument_AuthenticityValidationContainer> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("checkDocumentAuthenticity")
    const formData = new FormData();
    formData.append('file', file);

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.checkDocumentAuthenticity, formData, { urlParams: { documentId } });
  }

  /************** DOCUMENTS *************/

  public async getDocumentSignatures(documentId): Promise<IgnisignSignature[]> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getDocumentSignatures")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignSignature[]>(ignisignRemoteServiceUrls.getDocumentSignatures,  { urlParams: {documentId  } });
  }


  public async getDocumentSignature(documentId, signatureId): Promise<IgnisignSignature> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getDocumentSignature")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignSignature>(ignisignRemoteServiceUrls.getDocumentSignature, { urlParams: { documentId, signatureId } });
  }
  
  /**************  SIGNATURE REQUESTS *************/

  public async initSignatureRequest(): Promise<IgnisignSignatureRequest_IdContainer> {
    await this._assertIsAppTypeSignatureOrSeal("initSignatureRequest")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.initSignatureRequest, null, { urlParams: { appId, appEnv } });
  }

  public async updateSignatureRequest(signatureRequestId : string, dto: IgnisignSignatureRequest_UpdateDto): Promise<IgnisignSignatureRequest_Context> {
    await this._assertIsAppTypeSignatureOrSeal("updateSignatureRequest")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.put<IgnisignSignatureRequest_Context>(ignisignRemoteServiceUrls.updateSignatureRequest, dto, { urlParams: { signatureRequestId } });
  }

  public async publishSignatureRequest(signatureRequestId : string): Promise<IgnisignSignatureRequest_Publish_ResponseDTO> {
    await this._assertIsAppTypeSignatureOrSeal("publishSignatureRequest")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.publishSignatureRequest, {}, { urlParams: { signatureRequestId } });
  }

  public async closeSignatureRequest(signatureRequestId : string): Promise<IgnisignSignatureRequest_IdContainer> {
    await this._assertIsAppTypeSignatureOrSeal("closeSignatureRequest")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.closeSignatureRequest, {}, { urlParams: {  signatureRequestId} });
  }

  public async getSignatureRequestsByAppIdAndAppEnv(page: Number = 1): Promise<IgnisignSignatureRequests_Paginate> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getSignatureRequestsByAppIdAndAppEnv")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignatureRequests_Paginate>(ignisignRemoteServiceUrls.getSignatureRequestsByAppIdAndAppEnv, { urlParams: { appId, appEnv }, params: { page : page.toString() } });
  }

  public async getSignatureRequestContext(signatureRequestId : string): Promise<IgnisignSignatureRequest_Context> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getSignatureRequestContext")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.getSignatureRequestContext, { urlParams: {  signatureRequestId } });
  }

  public async getSignatureRequestsStatus(signatureRequestIds : string[]): Promise<IgnisignSignatureRequests_StatusContainer> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("getSignatureRequestsStatus")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;

    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.getSignatureRequestsStatus, { signatureRequestIds }, { urlParams: { appId, appEnv } });
  }

  /*************** SIGNATURE PROOF **************/

  public async downloadSignatureProofDocument(documentId: string): Promise<Readable> {
    await this._assertIsAppTypeSignatureOrSealOrBareSignature("downloadSignatureProofDocument")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadSignatureProofDocument, { urlParams: { documentId }, responseType:<ResponseType>('stream') });
  }


  /************** SEAL *************/

  public async signM2M(dto: IgniSign_SignM2MRequestDto): Promise<IgniSign_SignM2MResponseDto> {
    await this._assertIsAppTypeSeal("signM2M")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.signM2M, dto, { urlParams: { appId, appEnv, m2mId : dto.m2mId} });
  }


  /************** LOG_CAPSULE *************/

  public async logCapsuleCreate(hashSha256_b64 : string) : Promise<IgnisignLogCapsule_ResponseDto> {
    await this._assertIsAppTypeLogCapsule("logCapsuleCreate")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    const dto : IgnisignLogCapsule_RequestDto = { hashSha256_b64 };
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.logCapsuleCreate, dto, { urlParams: { appId, appEnv } });
  }


  

  /************** BARE-SIGNATURE *************/

  private _getBareSignatureClientBaseUrl() : string {
    return `${IGNISIGN_SIGN_URL}/envs/${this.execContext.appEnv}/oauth2`
  }

  public async getBareSignatureAuthorizationUrl(
    { redirectUri, hashes, externalId, nonce, codeChallenge} : Ignisign_BareSignature_GetAuthrozationUrlRequest
  ) : Promise<Ignisign_BareSignature_GetAuthrozationUrlResponse> {

    await this._assertIsAppTypeBareSignature("getBareSignatureAuthorizationUrl")

    const nonceValue = nonce || uuid.v4();
    let codeVerfier = null;

    if(!codeChallenge){
      codeVerfier   = IgnisignSdkUtilsService.bareSignature_GenerateCodeVerifier();
      codeChallenge = IgnisignSdkUtilsService.bareSiganture_GenerateCodeChallenge(codeVerfier);
    }

    const state = {
      hashes,
      nonce: nonceValue,
    };

    if(externalId)
      state['externalId'] = externalId;

    const params = {
      redirect_uri: redirectUri,
      response_type: 'code',
      client_id: this.execContext.appId,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: JSON.stringify(state),
    };

    const paramString  = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
    const authorizationUrl = `${this._getBareSignatureClientBaseUrl()}/authorize?${paramString}`;

    const result : Ignisign_BareSignature_GetAuthrozationUrlResponse =  {
      authorizationUrl,
      nonce: nonceValue,
      codeChallenge
    }

    if(codeVerfier)
      result.codeVerifier = codeVerfier;

    return result;
  }

  public async getBareSignatureProofToken(
    {
      code,
      code_verifier, 
      redirect_uri
    } : Ignisign_BareSignature_SdkProofAccessTokenRequest

  ): Promise<Ignisign_BareSignature_ProofAccessToken> {

    await this._assertIsAppTypeBareSignature("getBareSignatureProofToken")

    const dto : Ignisign_BareSignature_ProofAccessTokenRequest = {
      client_id      : this.execContext.appId,
      client_secret  : this.execContext.appSecret,
      code_verifier,
      redirect_uri,
      grant_type      : 'authorization_code',
      code
    };

    const ignisignPublicApi  = await this.getIgnisignPublicApi();
    return await ignisignPublicApi.post<Ignisign_BareSignature_ProofAccessToken>(
      ignisignRemoteServiceUrls.bareSignatureGetProofToken, 
      dto, 
      { urlParams: { appEnv: this.execContext.appEnv } });
  }

  public async getBareSignatureProofs(headerToken : string) : Promise<Ignisign_BareSignature_ProofAccessToken> {

    await this._assertIsAppTypeBareSignature("getBareSignatureProofs")

    const ignisignPublicApi  = await this.getIgnisignPublicApi();

    return ignisignPublicApi.get(
      ignisignRemoteServiceUrls.bareSignatureGetProofs, 
      {
          headers: { Authorization: `Bearer ${headerToken}` },
          urlParams: { appEnv: this.execContext.appEnv }
      });

  }

  public async getBareSignatureConfiguration() : Promise<IgnisignApplication_BareSignatureEnvSettings>{
    await this._assertIsAppTypeBareSignature("getBareSignatureConfiguration")
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignApplication_BareSignatureEnvSettings>(ignisignRemoteServiceUrls.getBareSignatureConfiguration, { urlParams: { appId, appEnv } });

  }



  /************** WEBHOOK MANAGEMENT *************/

  public async addWebhookEndpoint(endPointDto: IgnisignWebhook_EndpointDto): Promise<IgnisignWebhook_SettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;

    return ignisignConnectedApi.post(ignisignRemoteServiceUrls.addWebhookEndpoint, endPointDto, { urlParams: { appId, appEnv } });
  }

  public async getWebhookEndpoints(): Promise<IgnisignWebhook[]>{
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return ignisignConnectedApi.get<IgnisignWebhook[]>(ignisignRemoteServiceUrls.getWebhookEndpoints, { urlParams: { appId, appEnv } });
  }

  public async updateWebhookEndpoint(webhookId: string, endPointDto: IgnisignWebhook_EndpointDto): Promise<IgnisignWebhook_SettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.put(ignisignRemoteServiceUrls.updateWebhookEndpoint, endPointDto, { urlParams: { webhookId } });
  }

  public async removeWebhookEndpoint(webhookId: string): Promise<IgnisignWebhook_SettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.delete(ignisignRemoteServiceUrls.removeWebhookEndpoint, { urlParams: { webhookId } });
  }

  public async getWebhookEvents(webhookId: string, filter: IGNISIGN_WEBHOOK_EVENT_FILTER, page: number): Promise<IgnisignWebhookEvent_ListingDto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.get(ignisignRemoteServiceUrls.getWebhookEvents, { urlParams: { webhookId }, params: { filter, page } });
  }

  public async getWebhookEvent(webhookId: string, eventId: string): Promise<IgnisignWebhookEvent> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.get(ignisignRemoteServiceUrls.getWebhookEvent, { urlParams: { webhookId, eventId } });
  }

  public async resendWebhookEvent(webhookId: string, eventId: string): Promise<void> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    await ignisignConnectedApi.post(ignisignRemoteServiceUrls.resendWebhookEvent, {}, { urlParams: { webhookId, eventId } });
  }

  public async checkWebhookToken(token : string, appId: string, appEnv: string) : Promise<boolean> {
    try {
      const ignisignConnectedApi = await this.getIgnisignConnectedApi();
      const checkResult:IgnisignTechnicalToken_CheckAndConsumeDto = await ignisignConnectedApi.post(ignisignRemoteServiceUrls.checkWebhookToken, { token, appId, appEnv }, {})
      return (checkResult && checkResult.isValid)

    } catch (e) {
      console.error("check webhook token", e)
    }
  }

    /************** WEBHOOK CONSUMMATION MANAGEMENT *************/

  public async consumeWebhook(actionDto: IgnisignWebhook_ActionDto){

    _logIfActivated("consumeWebhook", actionDto)

    if(!this.isInitialized)
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_NOT_INITIALIZED, {}, null, this.execContext)

    if(!actionDto.topic || !actionDto.action || !actionDto.msgNature || !actionDto.verificationToken || !actionDto.appId || !actionDto.appEnv){
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_WEBHOOK_BAD_APP_ID, {
        customMessage : "[IGNISIGN SDK] Webhook received a message that is badly formatted",
        webhookMessageReceived : actionDto
      }, null, this.execContext)
    }

    if(actionDto.appId !== this.execContext.appId) {

      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_WEBHOOK_BAD_APP_ID, {
        customMessage : "[IGNISIGN SDK] You received a webhook for another app than yours",
        webhookMessageReceived : actionDto
      }, null, this.execContext)
    }

    if(actionDto.appEnv !== this.execContext.appEnv) {
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_WEBHOOK_BAD_APP_ENV, {
        customMessage : "[IGNISIGN SDK] You received a webhook from another environment than yours",
        webhookMessageReceived : actionDto
      }, null, this.execContext)
    }

    const isTokenValid:boolean = await this.checkWebhookToken(actionDto.verificationToken, actionDto.appId, actionDto.appEnv)

    if(!isTokenValid){
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_WEBHOOK_VERIFICATION_FAILED, {
        customMessage : "[IGNISIGN SDK] Webhook received a message that cannot be verified",
        webhookMessageReceived : actionDto
      }, null, this.execContext)
    }

    const callbacksToApply = this.callbacks.filter( c => {
      const topicIsMatching     = [actionDto.topic, IGNISIGN_WEBHOOK_ACTION_ALL].includes(c.topic);
      const actionIsMatching    = [actionDto.action, IGNISIGN_WEBHOOK_ACTION_ALL].includes(c.action);
      const msgNatureIsMatching = [actionDto.msgNature, IGNISIGN_WEBHOOK_ACTION_ALL].includes(c.msgNature);

      return (topicIsMatching && actionIsMatching && msgNatureIsMatching);
    });

    return callbacksToApply.reduce( async (accPr, c) => {
      try {
        await accPr;
        return c.callback({
          content: actionDto.content, 
          error: actionDto?.error || undefined, 
          msgNature: actionDto.msgNature, 
          action: actionDto.action, 
          topic: actionDto.topic
        })
          .catch(e => {
            console.error("[IGNISIGN SDK] Webhook: error when executing your webhook application callback", e)
            return Promise.resolve()
          })

      } catch (e) {
        console.error("[IGNISIGN SDK] Webhook: error when executing your webhook application callback", e)
        return Promise.resolve()
      }
    }, Promise.resolve())
  }

  //************************************************** WEBHOOKS REGISTER CALLBACKS ***************************************************/

  public async registerWebhookCallback_Signature(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_Signature>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    await this._assertIsAppTypeSignatureOrSealOrBareSignature("registerWebhookCallback_Signature")

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_Signature> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.SIGNATURE,
      action    : action? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }


  public async registerWebhookCallback_SignatureSession(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureSession>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_SESSION,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    await this._assertIsAppTypeSignatureOrSealOrBareSignature("registerWebhookCallback_SignatureSession")
    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_SignatureSession> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.SIGNATURE_SESSION,
      action    : action    ? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }


  public async registerWebhookCallback_SignatureRequest(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureRequest>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    await this._assertIsAppTypeSignatureOrSealOrBareSignature("registerWebhookCallback_SignatureRequest")

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_SignatureRequest> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.SIGNATURE_REQUEST,
      action    : action    ? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }

  public async registerWebhookCallback_Signer(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_Signer>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNER,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    await this._assertIsAppTypeSignatureOrSealOrBareSignature("registerWebhookCallback_Signer")

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_Signer> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.SIGNER,
      action    : action    ? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }

  public async registerWebhookCallback_SignatureProof(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureProof_Error | IgnisignWebhookDto_SignatureProof_Success | IgnisignWebhookDto_SignatureAdvancedProof>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROOF,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    await this._assertIsAppTypeSignatureOrSealOrBareSignature("registerWebhookCallback_SignatureProof")

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_SignatureProof_Error | IgnisignWebhookDto_SignatureProof_Success | IgnisignWebhookDto_SignatureAdvancedProof> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.SIGNATURE_PROOF,
      action    : action    ? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }

  public async registerWebhookCallback_SignatureImageGenerated(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureImage>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_IMAGE,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    await this._assertIsAppTypeSignatureOrSealOrBareSignature("registerWebhookCallback_SignatureImageGenerated")

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_SignatureImage> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.SIGNATURE_SIGNER_IMAGE,
      action    : action    ? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }

  public async registerWebhookCallback_Application(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_Application>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_APPLICATION,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_Application> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.APP,
      action    : action    ? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }

  public async registerWebhookCallback<T = any>(
    callback   : IgnisignWebhook_Callback<T>,
    topic     ?: IGNISIGN_WEBHOOK_TOPICS,
    action    ?: IgnisignWebhook_Action,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    const mapper : IgnisignWebhook_CallbackMapper<T>  = {
      uuid      : uuid.v4(),
      topic     : topic     ? topic     : IGNISIGN_WEBHOOK_ACTION_ALL,
      action    : action    ? action    : IGNISIGN_WEBHOOK_ACTION_ALL,
      msgNature : msgNature ? msgNature : IGNISIGN_WEBHOOK_ACTION_ALL,
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }

  public async revokeCallback(callbackId : string){
    this.callbacks = this.callbacks.filter( c => c.uuid !== callbackId);
  }
}

