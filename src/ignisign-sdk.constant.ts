


export const DEFAULT_IGNISIGN_API_URL = "https://api.ignisign.io";


export const ignisignRemoteServiceUrls = {

  // Webhooks

  addWebhookEndpoint                      : "/v3/applications/:appId/envs/:appEnv/webhooks", 
  updateWebhookEndpoint                   : "/v3/webhooks/:webhookId",
  removeWebhookEndpoint                   : "/v3/webhooks/:webhookId",

  getWebhookEvents                        : "/v3/webhooks/:webhookId/events",
  getWebhookEvent                         : "/v3/webhooks/:webhookId/events/:eventId",
  resendWebhookEvent                      : "/v3/webhooks/:webhookId/events/:eventId/resend",

  // Applications
  updateApplicationEnvSettings            : "/v3/applications/:appId/envs/:appEnv/settings", // put

  // User invitations
  getAppInvitedUsers                      : "/v3/applications/:appId/users-invitations", // get
  inviteNewAppUser                        : "/v3/applications/:appId/users-invitations", // post
  resendAppUserInvitation                 : "/v3/applications/:appId/users-invitations/:userInvitationId/resend", // post
  cancelAppUserInvitation                 : "/v3/applications/:appId/users-invitations/:userInvitationId", // delete
  editAppInvitedUser                      : "/v3/applications/:appId/users-invitations/:userInvitationId", // put

  // Signers
  getSignerWithDetails                    : "/v3/applications/:appId/envs/:appEnv/signers/:signerId/details", // get
  searchApplicationSigners                : "/v3/applications/:appId/envs/:appEnv/signers-search", // post
  getPaginateApplicationSigners           : "/v3/applications/:appId/envs/:appEnv/signers-paginate",//get
  createSigner                            : "/v3/applications/:appId/envs/:appEnv/signers",//post
  updateSigner                            : "/v3/applications/:appId/envs/:appEnv/signers/:signerId", //put
  revokeSigner                            : "/v3/applications/:appId/envs/:appEnv/signers/:signerId/revoke", //delete

  // Documents
  initializeDocument                      : "/v3/applications/:appId/envs/:appEnv/init-documents", // post
  updateDocument                          : "/v3/documents/:documentId", // put
  removeDocument                          : "/v3/documents/:documentId", // delete
  getDocumentById                         : "/v3/documents/:documentId", // get

  getDocumentContext                      : "/v3/documents/:documentId/context", //  get
  
  provideDocumentContent_DataJson         : "/v3/documents/:documentId/data-json-content", //
  provideDocumentContent_PrivateContent   : "/v3/documents/:documentId/private-content", //
  
  removeDocumentContent                   : "/v3/documents/:documentId/content", //

  createDocumentRequest                   : "/v3/documents/:documentId/requests", //
  documentRequestValidation               : "/v3/documents/:documentId/document-request-validation", //  

  provideDocumentContent_File             : "/v3/documents/:documentId/file", //
  downloadOriginalDoc                     : "/v3/documents/:documentId/file", // 
  
  downloadSignatureProofDocument          : "/v3/documents/:documentId/signature-proof", //  
  downloadDocumentSignatureXades          : "/v3/documents/:documentId/signatures/:signatureId/xades", //
  downloadAsicFile                        : "/v3/documents/:documentId/asics", // 

  getSignatureImg                         : "/v3/documents/:documentId/img-signatures", // ??
  
  

  // getDocumentSignatures                : "/v3/documents/:documentId/signatures", //  get
  // getDocumentSignature                 : "/v3/documents/:documentId/signatures/:signatureId", //   get

  // Signature profile   

  getSignatureProfiles                        : "/v3/applications/:appId/envs/:appEnv/signature-profiles", //  

  // getSignatureProfileContext               : "/v3/applications/:appId/envs/:appEnv/signature-profiles/:signatureProfileId/context", //  
  // getSignatureProfile_GlobalSignerContraints  : "/v3/applications/:appId/envs/:appEnv/signature-profiles/:signatureProfileId/signer-constraints", //  
  // getSignatureProfiel_SignerContraints         : "/v3/applications/:appId/envs/:appEnv/signature-profiles/:signatureProfileId/signer-constraints/:signerId", //  

  updateSignatureProfileStatus            : "/v3/applications/:appId/envs/:appEnv/signature-profiles/:signatureProfileId/status", // put

  // Signature requests

  initSignatureRequest                    : "/v3/applications/:appId/envs/:appEnv/signature-requests", //  
  getSignatureRequestsByAppIdAndAppEnv    : "/v3/applications/:appId/envs/:appEnv/signature-requests", //

  updateSignatureRequest                  : "/v3/signature-requests/:signatureRequestId", //  
  publishSignatureRequest                 : "/v3/signature-requests/:signatureRequestId/publish", //  
  closeSignatureRequest                   : "/v3/signature-requests/:signatureRequestId/close", //    
  getSignatureRequestContext              : "/v3/signature-requests/:signatureRequestId/context", //  

  checkWebhookToken                       : '/v3/tokens/webhook-verification/checking-consumption',
}
