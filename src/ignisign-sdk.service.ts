import * as FormData from "form-data";
import * as uuid from "uuid";
import { ResponseType } from "axios";


import {
  IGNISIGN_ERROR_CODES,
  IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  IGNISIGN_WEBHOOK_TOPICS,
  IgnisignWebhook_ActionDto,
  IgnisignWebhook_Callback,
  IgnisignDocument_ContentCreation_DataJsonDto, IgnisignDocument, IgnisignSigner_CreationResponseDto,
  IgnisignTechnicalToken_CheckAndConsumeDto,
  Ignisign_SignatureImagesDto, IgnisignSigner_CreationRequestDto,
  IgnisignSignatureRequest_UpdateDto, IgnisignWebhook_EndpointDto,
  IgnisignWebhook_SettingsDescription, IGNISIGN_WEBHOOK_EVENT_FILTER,
  IgnisignWebhookEvent_ResponseDto,
  IgnisignWebhookEvent, IgnisignApplication_InvitedUser,
  IgnisignApplication_InvitedUser_CreationRequestDto,
  IgnisignApplication_User_EditRequestDto,
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
} from "@ignisign/public";

import { createIgnisignSdkError } from "./ignisign-sdk-error.service";
import { IgnisignSdkFileContentUploadDto, IgnisignSdkInitializer, IgnisignWebhook_CallbackMapper } from "./ignisign-sdk.models";
import { ignisignRemoteServiceUrls } from "./ignisign-sdk.constant";
import { IgnisignHttpApi } from "./ignisign-http.service";


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

   // TODO https://app.clickup.com/t/860rnx794
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

  public async editAppInvitedUser(userInvitationId: string, dto : IgnisignApplication_User_EditRequestDto): Promise<IgnisignApplication_InvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;
    return await ignisignConnectedApi.put<IgnisignApplication_InvitedUser>(ignisignRemoteServiceUrls.editAppInvitedUser, dto, { urlParams: { appId, userInvitationId } });
  }

  /************** SIGNERS *************/

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

  // TODO see stream management
  public async provideDocumentContent_File(documentId: string, uploadDto : IgnisignSdkFileContentUploadDto): Promise<IgnisignDocument> {

    const formData = new FormData();

    formData.append('file', uploadDto.fileStream, {
      filename    : uploadDto.filename,
      contentType : uploadDto.contentType
    });

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_File, formData, { urlParams: { documentId } , headers: {...formData.getHeaders()} });
  }

  public async downloadOriginalDoc(documentId : string): Promise<ReadableStream|string|Object> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadOriginalDoc, { urlParams: { documentId } });
  }

  public async createDocumentRequest(documentId: string, dto: IgnisignDocumentRequest_RequestDto): Promise<IgnisignDocument> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.createDocumentRequest, dto, { urlParams: {documentId} });
  }

  // TODO see the return type, update the documentation when checked
  public async downloadDocumentSignatureXades(documentId : string, signatureId : string): Promise<any> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadDocumentSignatureXades,  { urlParams: { documentId, signatureId } });
  }

  public async downloadAsicFile(documentId : string): Promise<ReadableStream> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadAsicFile, { urlParams: { documentId }, responseType:<ResponseType>('stream')});
  }

  public async getSignatureImg(documentId : string, signerId: string): Promise<Ignisign_SignatureImagesDto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.getSignatureImg, { urlParams: {documentId,  signerId } });
  }

  // TODO see the return type
  public async downloadSignatureProofDocument(documentId: string): Promise<any> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadSignatureProofDocument, { urlParams: { documentId } });
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

  public async getSignatureProfileSignerInputsConstraints(signatureProfileId : string) : Promise<IgnisignSignatureProfile_SignerInputsConstraints> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignatureProfile_SignerInputsConstraints>(ignisignRemoteServiceUrls.getSignatureProfileSignerInputsConstraints, { urlParams: { appId, appEnv, signatureProfileId } });
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


  /************** WEBHOOK *************/

  public async addWebhookEndpoint(endPointDto: IgnisignWebhook_EndpointDto): Promise<IgnisignWebhook_SettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;

    return ignisignConnectedApi.post(ignisignRemoteServiceUrls.addWebhookEndpoint, endPointDto, { urlParams: { appId, appEnv } });
  }

  public async updateWebhookEndpoint(webhookId: string, endPointDto: IgnisignWebhook_EndpointDto): Promise<IgnisignWebhook_SettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.put(ignisignRemoteServiceUrls.updateWebhookEndpoint, endPointDto, { urlParams: { webhookId } });
  }

  public async removeWebhookEndpoint(webhookId: string): Promise<IgnisignWebhook_SettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.delete(ignisignRemoteServiceUrls.removeWebhookEndpoint, { urlParams: { webhookId } });
  }

  public async getWebhookEvents(webhookId: string, filter: IGNISIGN_WEBHOOK_EVENT_FILTER, page: number): Promise<IgnisignWebhookEvent_ResponseDto> {
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

  public async getWebhookEndpoints(): Promise<IgnisignWebhook[]>{
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return ignisignConnectedApi.get<IgnisignWebhook[]>(ignisignRemoteServiceUrls.getWebhookEndpoints, { urlParams: { appId, appEnv } });
  }



  public async registerWebhookCallback<T = any>(
    callback   : IgnisignWebhook_Callback<T>,
    topic?     : IGNISIGN_WEBHOOK_TOPICS,
    action?    : string,
    msgNature? : IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  ): Promise<string>{

    const mapper : IgnisignWebhook_CallbackMapper<T>  = {
      uuid      : uuid.v4(),
      topic     : topic     ? topic     : 'ALL',
      action    : action    ? action    : 'ALL',
      msgNature : msgNature ? msgNature : 'ALL',
      callback
    }

    this.callbacks.push(mapper)

    return mapper.uuid;
  }

  public async revokeCallback(callbackId : string){
    this.callbacks = this.callbacks.filter( c => c.uuid !== callbackId);
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
      const topicIsMatching   = [ actionDto.topic, 'ALL'].includes(c.topic);
      const actionIsMatching  = [ actionDto.action, 'ALL'].includes(c.action);
      const msgIsMatching     = [ actionDto.msgNature, 'ALL'].includes(c.msgNature);

      return (topicIsMatching && actionIsMatching && msgIsMatching)
    });

    return callbacksToApply.reduce( async (accPr, c) => {
      try {
        await accPr;
        return c.callback(actionDto.content, actionDto.topic, actionDto.action, actionDto.msgNature)
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
}