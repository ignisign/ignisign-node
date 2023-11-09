import * as FormData from "form-data";
import * as uuid from "uuid";
import { ResponseType } from "axios";


import {
  IGNISIGN_ERROR_CODES,
  IGNISIGN_WEBHOOK_ACTION_ALL,
  IGNISIGN_WEBHOOK_TOPICS,
  IgnisignWebhook_ActionDto,
  IgnisignWebhook_Callback,
  IgnisignDocument_ContentCreation_DataJsonDto, IgnisignDocument, IgnisignSigner_CreationResponseDto,
  IgnisignTechnicalToken_CheckAndConsumeDto,
  IgnisignSignatureImages_Dto, IgnisignSigner_CreationRequestDto,
  IgnisignSignatureRequest_UpdateDto, IgnisignWebhook_EndpointDto,
  IgnisignWebhook_SettingsDescription, IGNISIGN_WEBHOOK_EVENT_FILTER,
  IgnisignWebhookEvent_ListingDto,
  IgnisignWebhookEvent, IgnisignApplication_InvitedUser,
  IgnisignApplication_InvitedUser_CreationRequestDto,
  IgnisignApplicationUser_EditRequestDto,
  IgnisignSigner_Context,
  IgnisignSigners_SearchResultDto,
  IgnisignDocument_InitializationDto,
  IgnisignDocument_ContentCreation_PrivateContentDto,
  IgnisignDocumentRequest_RequestDto, IgnisignDocument_Context,
  IgnisignSignatureProfile,
  IgnisignSignatureProfile_StatusWrapper,
  IGNISIGN_SIGNATURE_PROFILE_STATUS,
  IgnisignSignatureProfile_IdContainerDto,
  IgnisignSignatureRequest_IdContainer,
  IgnisignSignatureRequest_Context,
  IgnisignSignatureRequests_Paginate,
  IgnisignSigner_UpdateRequestDto,
  IgnisignWebhook,
  IgnisignApplication_Context,
  IgnisignSigner_Summary,
  IgnisignSignatureProfile_SignerInputsConstraints,
  IgnisignSignature,
  IgnisignWebhookDto_SignatureSession,
  IgnisignWebhookDto_DocumentRequest,
  IgnisignWebhookDto_SignatureRequest,
  IgnisignWebhookDto_Signer,
  IgnisignWebhookDto_SignatureProof,
  IgnisignWebhookDto_SignatureImage,
  IgnisignWebhookDto_Application,
  IgnisignWebhookDto_SignatureProfile,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROFILE,
  IGNISIGN_WEBHOOK_ACTION_SIGNER,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROOF,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_IMAGE,
  IGNISIGN_WEBHOOK_ACTION_APPLICATION,
  IgnisignWebhook_Action,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_SESSION,
  IgnisignWebhookDto_Signature,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE,
  IGNISIGN_WEBHOOK_ACTION_DOCUMENT_REQUEST,
  IGNISIGN_SIGNER_CREATION_INPUT_REF,
  IGNISIGN_WEBHOOK_MESSAGE_NATURE
} from "@ignisign/public";

import { createIgnisignSdkError } from "./ignisign-sdk-error.service";
import { IgnisignSdkFileContentUploadDto, IgnisignSdkInitializer, IgnisignWebhook_CallbackMapper } from "./ignisign-sdk.models";
import { ignisignRemoteServiceUrls } from "./ignisign-sdk.constant";
import { IgnisignHttpApi } from "./ignisign-http.service";
import { Readable } from "stream";


const LOG_ACTIVATED = false;
const _logIfActivated = (...args) => {
  if(LOG_ACTIVATED){
    console.info(...args)
  }
}

export class IgnisignSdk extends IgnisignHttpApi {

  private callbacks: IgnisignWebhook_CallbackMapper<any>[] = [];

  constructor(init: IgnisignSdkInitializer){
    super(init);
  }

   /************** APPLICATION *************/

   public async getApplicationContext(): Promise<IgnisignApplication_Context> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignApplication_Context>(ignisignRemoteServiceUrls.getApplicationContext);
   }


  /************** APPLICATION USER INVITATION *************/
  
  public async getAppInvitedUsers(): Promise<IgnisignApplication_InvitedUser[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.get<IgnisignApplication_InvitedUser[]>(ignisignRemoteServiceUrls.getAppInvitedUsers, { urlParams: { appId } });
  }

  public async inviteNewAppUser(dto: IgnisignApplication_InvitedUser_CreationRequestDto): Promise<IgnisignApplication_InvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.post<IgnisignApplication_InvitedUser>(ignisignRemoteServiceUrls.inviteNewAppUser, dto, { urlParams: { appId } });
  }

  public async resendAppUserInvitation(userInvitationId: string): Promise<IgnisignApplication_InvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.post<IgnisignApplication_InvitedUser>(ignisignRemoteServiceUrls.resendAppUserInvitation, {}, { urlParams: { appId, userInvitationId } });
  }

  public async cancelAppUserInvitation(userInvitationId: string): Promise<IgnisignApplication_InvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.delete<IgnisignApplication_InvitedUser>(ignisignRemoteServiceUrls.cancelAppUserInvitation,  { urlParams: { appId, userInvitationId} });
  }

  public async editAppInvitedUser(userInvitationId: string, dto : IgnisignApplicationUser_EditRequestDto): Promise<IgnisignApplication_InvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;
    return await ignisignConnectedApi.put<IgnisignApplication_InvitedUser>(ignisignRemoteServiceUrls.editAppInvitedUser, dto, { urlParams: { appId, userInvitationId } });
  }

  /************** SIGNERS *************/


  public async getMissingSignerInputs_FromSignatureProfile(signatureProfileId : string, signerId: string) : Promise<IGNISIGN_SIGNER_CREATION_INPUT_REF[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IGNISIGN_SIGNER_CREATION_INPUT_REF[]>(ignisignRemoteServiceUrls.getMissingSignerInputs_FromSignatureProfile, { urlParams: { appId, appEnv, signatureProfileId, signerId } });
  }

  public async getSignatureProfileSignerInputsConstraints(signatureProfileId : string) : Promise<IgnisignSignatureProfile_SignerInputsConstraints> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignatureProfile_SignerInputsConstraints>(ignisignRemoteServiceUrls.getSignatureProfileSignerInputsConstraints, { urlParams: { appId, appEnv, signatureProfileId } });
  }


  public async getSignerWithDetails(signerId : string): Promise<IgnisignSigner_Context> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigner_Context>(ignisignRemoteServiceUrls.getSignerWithDetails,  { urlParams: { appId, appEnv, signerId } });
  }
  public async getSignerSummary(signerId : string): Promise<IgnisignSigner_Summary> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigner_Summary>(ignisignRemoteServiceUrls.getSignerSummary,  { urlParams: { appId, appEnv, signerId } });
  }

  public async searchApplicationSigners(filter: string): Promise<IgnisignSigners_SearchResultDto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigners_SearchResultDto>(ignisignRemoteServiceUrls.searchApplicationSigners, { urlParams: { appId, appEnv }, params: { filter } });
  }

  public async getPaginateApplicationSigners(page: number): Promise<IgnisignSigners_SearchResultDto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSigners_SearchResultDto>(ignisignRemoteServiceUrls.getPaginateApplicationSigners, { urlParams: {  appId, appEnv}, params: { page : page.toString() } });
  }

  public async createSigner(dto: IgnisignSigner_CreationRequestDto) {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post<IgnisignSigner_CreationResponseDto>(ignisignRemoteServiceUrls.createSigner, dto, { urlParams: { appId, appEnv } });
  }
  
  public async updateSigner(signerId: string, dto: IgnisignSigner_UpdateRequestDto) {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.put<IgnisignSigner_CreationResponseDto>(ignisignRemoteServiceUrls.updateSigner, dto, { urlParams: { appId, appEnv, signerId } });
  }
  
  public async revokeSigner(signerId: string): Promise<{signerId : string}> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.delete<{signerId : string}>(ignisignRemoteServiceUrls.revokeSigner, { urlParams: { appId, appEnv, signerId } });
  }
  

  /************** DOCUMENT FILES *************/

  public async initializeDocument(dto: IgnisignDocument_InitializationDto): Promise<{documentId : string}> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post<{documentId : string}>(ignisignRemoteServiceUrls.initializeDocument, dto, { urlParams: { appId, appEnv } });
  }

  public async getDocumentById(documentId: string): Promise<IgnisignDocument> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignDocument>(ignisignRemoteServiceUrls.getDocumentById, { urlParams: { documentId } });
  }

  public async getDocumentContext(documentId: string): Promise<IgnisignDocument_Context> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignDocument_Context>(ignisignRemoteServiceUrls.getDocumentContext, { urlParams: { documentId } });
  }

  public async updateDocument(documentId: string, dto: IgnisignDocument_InitializationDto): Promise<IgnisignDocument> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.put<IgnisignDocument>(ignisignRemoteServiceUrls.updateDocument, ignisignConnectedApi, { urlParams: { documentId } });
  }

  public async removeDocument(documentId: string): Promise<{documentId : string}> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.delete<{documentId : string}>(ignisignRemoteServiceUrls.removeDocument, { urlParams: { documentId } });
  }

  public async removeDocumentContent(documentId: string): Promise<IgnisignDocument> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.delete<IgnisignDocument>(ignisignRemoteServiceUrls.removeDocumentContent, { urlParams: { documentId } });
  }

  public async provideDocumentContent_DataJson(documentId: string, content : any): Promise<IgnisignDocument> {
    const dto: IgnisignDocument_ContentCreation_DataJsonDto = { jsonContent : content};

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_DataJson, dto , { urlParams: { documentId } });
  }

  public async provideDocumentContent_PrivateContent(documentId: string, documentHash: string): Promise<IgnisignDocument> {
    const dto: IgnisignDocument_ContentCreation_PrivateContentDto = { documentHash };
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_PrivateContent, dto, { urlParams: { documentId } });
  }

  public async provideDocumentContent_File(documentId: string, uploadDto : IgnisignSdkFileContentUploadDto): Promise<IgnisignDocument> {

    const formData = new FormData();

    formData.append('file', uploadDto.fileStream, {
      filename    : uploadDto.fileName,
      contentType : uploadDto.contentType
    });

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_File, formData, { urlParams: { documentId } , headers: {...formData.getHeaders()} });
  }

  public async downloadOriginalDoc(documentId : string): Promise<Readable> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadOriginalDoc, { urlParams: { documentId }, responseType:<ResponseType>('stream') });
  }

  public async createDocumentRequest(documentId: string, dto: IgnisignDocumentRequest_RequestDto): Promise<IgnisignDocument> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.createDocumentRequest, dto, { urlParams: {documentId} });
  }


  public async downloadDocumentSignatureXades(documentId : string, signatureId : string): Promise<Readable> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadDocumentSignatureXades,  { urlParams: { documentId, signatureId }, responseType:<ResponseType>('stream') });
  }

  public async downloadAsicFile(documentId : string): Promise<Readable> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadAsicFile, { urlParams: { documentId }, responseType:<ResponseType>('stream')});
  }

  public async getSignaturesImages(documentId : string): Promise<IgnisignSignatureImages_Dto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.getSignatureImg, { urlParams: {documentId } });
  }


  public async downloadSignatureProofDocument(documentId: string): Promise<Readable> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadSignatureProofDocument, { urlParams: { documentId }, responseType:<ResponseType>('stream') });
  }

  public async generateAdvancedSignatureProof(documentId: string): Promise<{ documentId : string }> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.generateAdvancedSignatureProof, {}, { urlParams: { documentId }, responseType:<ResponseType>('stream') });
  }


  /************** DOCUMENTS *************/

  public async getDocumentSignatures(documentId): Promise<IgnisignSignature[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignSignature[]>(ignisignRemoteServiceUrls.getDocumentSignatures,  { urlParams: {documentId  } });
  }


  public async getDocumentSignature(documentId, signatureId): Promise<IgnisignSignature> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignSignature>(ignisignRemoteServiceUrls.getDocumentSignature, { urlParams: { documentId, signatureId } });
  }


  /************** SIGNATURE PROFILE *************/

  public async getSignatureProfiles(): Promise<IgnisignSignatureProfile[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignatureProfile[]>(ignisignRemoteServiceUrls.getSignatureProfiles,  { urlParams: { appId, appEnv } });
  }

  public async updateSignatureProfileStatus(signatureProfileId: string, status: IGNISIGN_SIGNATURE_PROFILE_STATUS): Promise<IgnisignSignatureProfile> {

    const dto : IgnisignSignatureProfile_StatusWrapper = { status };

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.put<IgnisignSignatureProfile>(ignisignRemoteServiceUrls.updateSignatureProfileStatus, dto, { urlParams: { appId, appEnv, signatureProfileId } });
  }

  
  /**************  SIGNATURE REQUESTS *************/

  public async initSignatureRequest(dto: IgnisignSignatureProfile_IdContainerDto): Promise<IgnisignSignatureRequest_IdContainer> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.initSignatureRequest, dto, { urlParams: { appId, appEnv } });
  }

  public async updateSignatureRequest(signatureRequestId : string, dto: IgnisignSignatureRequest_UpdateDto): Promise<IgnisignSignatureRequest_Context> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.put<IgnisignSignatureRequest_Context>(ignisignRemoteServiceUrls.updateSignatureRequest, dto, { urlParams: { signatureRequestId } });
  }

  public async publishSignatureRequest(signatureRequestId : string): Promise<IgnisignSignatureRequest_IdContainer> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.publishSignatureRequest, {}, { urlParams: { signatureRequestId } });
  }

  public async closeSignatureRequest(signatureRequestId : string): Promise<IgnisignSignatureRequest_IdContainer> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.closeSignatureRequest, {}, { urlParams: {  signatureRequestId} });
  }

  public async getSignatureRequestsByAppIdAndAppEnv(page: Number = 1): Promise<IgnisignSignatureRequests_Paginate> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignatureRequests_Paginate>(ignisignRemoteServiceUrls.getSignatureRequestsByAppIdAndAppEnv, { urlParams: { appId, appEnv }, params: { page : page.toString() } });
  }

  public async getSignatureRequestContext(signatureRequestId : string): Promise<IgnisignSignatureRequest_Context> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.getSignatureRequestContext, { urlParams: {  signatureRequestId } });
  }

  /*************** SIGNATURE PROOF **************/


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

  public async registerWebhookCallback_DocumentRequest(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_DocumentRequest>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_DOCUMENT_REQUEST,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_DocumentRequest> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.DOCUMENT_REQUEST,
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

  public async registerWebhookCallback_SignatureProfile(
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureProfile>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROFILE,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_SignatureProfile> = {
      uuid      : uuid.v4(),
      topic     : IGNISIGN_WEBHOOK_TOPICS.SIGNATURE_PROFILE,
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
    callback   : IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureProof>,
    action    ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROOF,
    msgNature ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE
  ): Promise<string>{

    const mapper : IgnisignWebhook_CallbackMapper<IgnisignWebhookDto_SignatureProof> = {
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