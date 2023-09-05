import * as FormData from "form-data";
import * as uuid from "uuid";
import { ResponseType } from "axios";


import {
  IGNISIGN_ERROR_CODES,
  IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  IGNISIGN_WEBHOOK_TOPICS,
  IgnisignWebhookActionDto,
  IgnisignWebhookCallback,
  IgnisignDocumentContentCreation_DataJsonDto, IgnisignDocument, IgnisignSigner_Creation_ResponseDto,
  IgnisignTechnicalTokenCheckAndConsumeDto,
  DocumentSignatureImagesDto, IgnisignSigner_Creation_RequestDto,
  Ignisign_SignatureRequest_UpdateDto, IgnisignWebhookEndpointDto,
  IgnisignWebhookSettingsDescription, IGNISIGN_WEBHOOK_EVENT_FILTER,
  IgnisignWebhookEventResponseDto,
  IgnisignWebhookEvent, IgnisignApplicationInvitedUser,
  IgnisignApplicationInvitedUserCreationRequestDto,
  IgnisignApplicationUserEditRequestDto,
  IgnisignSignerContext,
  IgnisignSignersSearchResultDto,
  IgnisignDocumentInitializationDto,
  IgnisignDocumentContentCreation_PrivateContentDto,
  IgnisignDocumentRequestDto, IgnisignDocumentContext,
  Ignisign_SignatureProfile,
  Ignisign_SignatureProfile_StatusWrapper,
  IGNISIGN_SIGNATURE_PROFILE_STATUS,
  Ignisign_SignatureProfileIdContainerDto,
  IgnisignSignatureRequestIdContainer,
  IgnisignSignatureRequestContext,
  IgnisignSignatureRequestsPaginate,
  IgnisignSigner_Update_RequestDto,
  IgnisignWebhook,
  IgnisignApplicationContext,
  IgnisignSignerSummary,
  Ignisign_SignatureProfileSignerInputsConstraints,
  IgnisignSignature,
} from "@ignisign/public";

import { createIgnisignSdkError } from "./ignisign-sdk-error.service";
import { IgnisignSdkFileContentUploadDto, IgnisignSdkInitializer, IgnisignWebhookCallbackMapper } from "./ignisign-sdk.models";
import { ignisignRemoteServiceUrls } from "./ignisign-sdk.constant";
import { IgnisignHttpApi } from "./ignisign-http.service";


const LOG_ACTIVATED = false;
const _logIfActivated = (...args) => {
  if(LOG_ACTIVATED){
    console.info(...args)
  }
}

export class IgnisignSdk extends IgnisignHttpApi {

  private callbacks: IgnisignWebhookCallbackMapper<any>[] = [];

  constructor(init: IgnisignSdkInitializer){
    super(init);
  }

   /************** APPLICATION *************/

   // TODO https://app.clickup.com/t/860rnx794
   public async getApplicationContext(): Promise<IgnisignApplicationContext> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignApplicationContext>(ignisignRemoteServiceUrls.getApplicationContext);
   }


  /************** APPLICATION USER INVITATION *************/
  
  public async getAppInvitedUsers(): Promise<IgnisignApplicationInvitedUser[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.get<IgnisignApplicationInvitedUser[]>(ignisignRemoteServiceUrls.getAppInvitedUsers, { urlParams: { appId } });
  }

  public async inviteNewAppUser(dto: IgnisignApplicationInvitedUserCreationRequestDto): Promise<IgnisignApplicationInvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.post<IgnisignApplicationInvitedUser>(ignisignRemoteServiceUrls.inviteNewAppUser, dto, { urlParams: { appId } });
  }

  public async resendAppUserInvitation(userInvitationId: string): Promise<IgnisignApplicationInvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.post<IgnisignApplicationInvitedUser>(ignisignRemoteServiceUrls.resendAppUserInvitation, {}, { urlParams: { appId, userInvitationId } });
  }

  public async cancelAppUserInvitation(userInvitationId: string): Promise<IgnisignApplicationInvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;

    return await ignisignConnectedApi.delete<IgnisignApplicationInvitedUser>(ignisignRemoteServiceUrls.cancelAppUserInvitation,  { urlParams: { appId, userInvitationId} });
  }

  public async editAppInvitedUser(userInvitationId: string, dto : IgnisignApplicationUserEditRequestDto): Promise<IgnisignApplicationInvitedUser> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId }             = this.execContext;
    return await ignisignConnectedApi.put<IgnisignApplicationInvitedUser>(ignisignRemoteServiceUrls.editAppInvitedUser, dto, { urlParams: { appId, userInvitationId } });
  }

  /************** SIGNERS *************/

  public async getSignerWithDetails(signerId : string): Promise<IgnisignSignerContext> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignerContext>(ignisignRemoteServiceUrls.getSignerWithDetails,  { urlParams: { appId, appEnv, signerId } });
  }
  public async getSignerSummary(signerId : string): Promise<IgnisignSignerSummary> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignerSummary>(ignisignRemoteServiceUrls.getSignerSummary,  { urlParams: { appId, appEnv, signerId } });
  }

  public async searchApplicationSigners(filter: string): Promise<IgnisignSignersSearchResultDto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignersSearchResultDto>(ignisignRemoteServiceUrls.searchApplicationSigners, { urlParams: { appId, appEnv }, params: { filter } });
  }

  public async getPaginateApplicationSigners(page: number): Promise<IgnisignSignersSearchResultDto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignersSearchResultDto>(ignisignRemoteServiceUrls.getPaginateApplicationSigners, { urlParams: {  appId, appEnv}, params: { page : page.toString() } });
  }

  public async createSigner(dto: IgnisignSigner_Creation_RequestDto) {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post<IgnisignSigner_Creation_ResponseDto>(ignisignRemoteServiceUrls.createSigner, dto, { urlParams: { appId, appEnv } });
  }
  
  public async updateSigner(signerId: string, dto: IgnisignSigner_Update_RequestDto) {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.put<IgnisignSigner_Creation_ResponseDto>(ignisignRemoteServiceUrls.updateSigner, dto, { urlParams: { appId, appEnv, signerId } });
  }
  
  public async revokeSigner(signerId: string): Promise<{signerId : string}> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.delete<{signerId : string}>(ignisignRemoteServiceUrls.revokeSigner, { urlParams: { appId, appEnv, signerId } });
  }
  

  /************** DOCUMENT FILES *************/

  public async initializeDocument(dto: IgnisignDocumentInitializationDto): Promise<{documentId : string}> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post<{documentId : string}>(ignisignRemoteServiceUrls.initializeDocument, dto, { urlParams: { appId, appEnv } });
  }

  public async getDocumentById(documentId: string): Promise<IgnisignDocument> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignDocument>(ignisignRemoteServiceUrls.getDocumentById, { urlParams: { documentId } });
  }

  public async getDocumentContext(documentId: string): Promise<IgnisignDocumentContext> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get<IgnisignDocumentContext>(ignisignRemoteServiceUrls.getDocumentContext, { urlParams: { documentId } });
  }

  public async updateDocument(documentId: string, dto: IgnisignDocumentInitializationDto): Promise<IgnisignDocument> {
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
    const dto: IgnisignDocumentContentCreation_DataJsonDto = { jsonContent : content};

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    
    return await ignisignConnectedApi.post<IgnisignDocument>(ignisignRemoteServiceUrls.provideDocumentContent_DataJson, dto , { urlParams: { documentId } });
  }

  public async provideDocumentContent_PrivateContent(documentId: string, documentHash: string): Promise<IgnisignDocument> {
    const dto: IgnisignDocumentContentCreation_PrivateContentDto = { documentHash };
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

  public async createDocumentRequest(documentId: string, dto: IgnisignDocumentRequestDto): Promise<IgnisignDocument> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.createDocumentRequest, dto, { urlParams: {documentId} });
  }


  public async downloadDocumentSignatureXades(documentId : string, signatureId : string): Promise<ReadableStream> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadDocumentSignatureXades,  { urlParams: { documentId, signatureId } });
  }

  public async downloadAsicFile(documentId : string): Promise<ReadableStream> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.downloadAsicFile, { urlParams: { documentId }, responseType:<ResponseType>('stream')});
  }

  public async getSignatureImg(documentId : string, signerId: string): Promise<DocumentSignatureImagesDto> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.getSignatureImg, { urlParams: {documentId,  signerId } });
  }

  // TODO see the return type
  public async downloadSignatureProofDocument(documentId: string): Promise<ReadableStream> {
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

  public async getSignatureProfiles(): Promise<Ignisign_SignatureProfile[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<Ignisign_SignatureProfile[]>(ignisignRemoteServiceUrls.getSignatureProfiles,  { urlParams: { appId, appEnv } });
  }

  public async updateSignatureProfileStatus(signatureProfileId: string, status: IGNISIGN_SIGNATURE_PROFILE_STATUS): Promise<Ignisign_SignatureProfile> {

    const dto : Ignisign_SignatureProfile_StatusWrapper = { status };

    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.put<Ignisign_SignatureProfile>(ignisignRemoteServiceUrls.updateSignatureProfileStatus, dto, { urlParams: { appId, appEnv, signatureProfileId } });
  }

  public async getSignatureProfileSignerInputsConstraints(signatureProfileId : string) : Promise<Ignisign_SignatureProfileSignerInputsConstraints> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<Ignisign_SignatureProfileSignerInputsConstraints>(ignisignRemoteServiceUrls.getSignatureProfileSignerInputsConstraints, { urlParams: { appId, appEnv, signatureProfileId } });
  }

  /**************  SIGNATURE REQUESTS *************/

  public async initSignatureRequest(dto: Ignisign_SignatureProfileIdContainerDto): Promise<IgnisignSignatureRequestIdContainer> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.initSignatureRequest, dto, { urlParams: { appId, appEnv } });
  }

  public async updateSignatureRequest(signatureRequestId : string, dto: Ignisign_SignatureRequest_UpdateDto): Promise<IgnisignSignatureRequestContext> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.put<IgnisignSignatureRequestContext>(ignisignRemoteServiceUrls.updateSignatureRequest, dto, { urlParams: { signatureRequestId } });
  }

  public async publishSignatureRequest(signatureRequestId : string): Promise<IgnisignSignatureRequestIdContainer> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.publishSignatureRequest, {}, { urlParams: { signatureRequestId } });
  }

  public async closeSignatureRequest(signatureRequestId : string): Promise<IgnisignSignatureRequestIdContainer> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.post(ignisignRemoteServiceUrls.closeSignatureRequest, {}, { urlParams: {  signatureRequestId} });
  }

  public async getSignatureRequestsByAppIdAndAppEnv(page: Number = 1): Promise<IgnisignSignatureRequestsPaginate> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;
    return await ignisignConnectedApi.get<IgnisignSignatureRequestsPaginate>(ignisignRemoteServiceUrls.getSignatureRequestsByAppIdAndAppEnv, { urlParams: { appId, appEnv }, params: { page : page.toString() } });
  }

  public async getSignatureRequestContext(signatureRequestId : string): Promise<IgnisignSignatureRequestContext> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return await ignisignConnectedApi.get(ignisignRemoteServiceUrls.getSignatureRequestContext, { urlParams: {  signatureRequestId } });
  }


  /************** WEBHOOK *************/

  public async addWebhookEndpoint(endPointDto: IgnisignWebhookEndpointDto): Promise<IgnisignWebhookSettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    const { appId, appEnv }     = this.execContext;

    return ignisignConnectedApi.post(ignisignRemoteServiceUrls.addWebhookEndpoint, endPointDto, { urlParams: { appId, appEnv } });
  }

  public async updateWebhookEndpoint(webhookId: string, endPointDto: IgnisignWebhookEndpointDto): Promise<IgnisignWebhookSettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.put(ignisignRemoteServiceUrls.updateWebhookEndpoint, endPointDto, { urlParams: { webhookId } });
  }

  public async removeWebhookEndpoint(webhookId: string): Promise<IgnisignWebhookSettingsDescription[]> {
    const ignisignConnectedApi  = await this.getIgnisignConnectedApi();
    return ignisignConnectedApi.delete(ignisignRemoteServiceUrls.removeWebhookEndpoint, { urlParams: { webhookId } });
  }

  public async getWebhookEvents(webhookId: string, filter: IGNISIGN_WEBHOOK_EVENT_FILTER, page: number): Promise<IgnisignWebhookEventResponseDto> {
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
      const checkResult:IgnisignTechnicalTokenCheckAndConsumeDto = await ignisignConnectedApi.post(ignisignRemoteServiceUrls.checkWebhookToken, { token, appId, appEnv }, {})
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
    callback   : IgnisignWebhookCallback<T>,
    topic?     : IGNISIGN_WEBHOOK_TOPICS,
    action?    : string,
    msgNature? : IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  ): Promise<string>{

    const mapper : IgnisignWebhookCallbackMapper<T>  = {
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

  public async consumeWebhook(actionDto: IgnisignWebhookActionDto){

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