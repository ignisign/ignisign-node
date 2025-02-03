import { sign } from "crypto";

export const DEFAULT_IGNISIGN_API_URL = "https://api.ignisign.io";
export const DEFAULT_IGNISIGN_SIGN_URL = "https://sign.ignisign.io";

export const ignisignRemoteServiceUrls = {


  // Applications
  getApplicationContext                   : "/v4/applications/:appId/context", // get

  // Signer profile
  getSignerProfile                        : "/v4/applications/:appId/envs/:appEnv/signer-profiles/:signerProfileId", // get
  getSignerProfiles                       : "/v4/applications/:appId/envs/:appEnv/signer-profiles", // get

  // User invitations
  getAppInvitedUsers                      : "/v4/applications/:appId/users-invitations", // get
  inviteNewAppUser                        : "/v4/applications/:appId/users-invitations", // post
  resendAppUserInvitation                 : "/v4/applications/:appId/users-invitations/:userInvitationId/resend", // post
  cancelAppUserInvitation                 : "/v4/applications/:appId/users-invitations/:userInvitationId", // delete
  editAppInvitedUser                      : "/v4/applications/:appId/users-invitations/:userInvitationId", // put

  // Signers
  regenerateSignerAuthSecret              : "/v4/applications/:appId/envs/:appEnv/signers/:signerId/regenerate-auth-secret", // put
  getSignerWithDetails                    : "/v4/applications/:appId/envs/:appEnv/signers/:signerId/details", // get
  getSignerSummary                        : "/v4/applications/:appId/envs/:appEnv/signers/:signerId", // get
  searchApplicationSigners                : "/v4/applications/:appId/envs/:appEnv/signers-search", // post
  getPaginateApplicationSigners           : "/v4/applications/:appId/envs/:appEnv/signers-paginate",//get
  createSigner                            : "/v4/applications/:appId/envs/:appEnv/signers",//post
  updateSigner                            : "/v4/applications/:appId/envs/:appEnv/signers/:signerId", //put
  revokeSigner                            : "/v4/applications/:appId/envs/:appEnv/signers/:signerId/revoke", //delete
  getSignerInputsConstraintsFromSignerProfileId  : "/v4/applications/:appId/envs/:appEnv/signer-profiles/:signerProfileId/inputs-needed", // get

  // Documents
  initializeDocument                      : "/v4/applications/:appId/envs/:appEnv/init-documents", // post
  updateDocument                          : "/v4/documents/:documentId", // put
  removeDocument                          : "/v4/documents/:documentId", // delete
  getDocumentById                         : "/v4/documents/:documentId", // get

  getDocumentContext                      : "/v4/documents/:documentId/context", //  get
  
  provideDocumentContent_DataJson         : "/v4/documents/:documentId/data-json-content", //
  provideDocumentContent_PrivateContent   : "/v4/documents/:documentId/private-content", //
  
  removeDocumentContent                   : "/v4/documents/:documentId/content", //

  createDocumentRequest                   : "/v4/documents/:documentId/requests", //

  provideDocumentContent_File             : "/v4/documents/:documentId/file", //
  downloadOriginalDoc                     : "/v4/documents/:documentId/file", // 
  checkDocumentAuthenticity               : "/v4/documents/:documentId/check-authenticity", // post
  
  // Signature Proof
  downloadSignatureByType                 : "/v4/documents/:documentId/signature-type/:signatureType", // get
  downloadLowLevelSignatureProof          : "/v4/documents/:documentId/signature-type/:signatureType/signers/:signerId", // get

  getSignatureImg                         : "/v4/documents/:documentId/img-signatures", // get
  getDocumentSignatures                   : "/v4/documents/:documentId/signatures", // get
  getDocumentSignature                    : "/v4/documents/:documentId/signatures/:signatureId", // get

  // Signature requests
                         
  initSignerSetup                         : "/v4/applications/:appId/envs/:appEnv/signer-setup", // post

  initSignatureRequest                    : "/v4/applications/:appId/envs/:appEnv/signature-requests", //  
  getSignatureRequestsByAppIdAndAppEnv    : "/v4/applications/:appId/envs/:appEnv/signature-requests", //

  updateSignatureRequest                  : "/v4/signature-requests/:signatureRequestId", //  
  publishSignatureRequest                 : "/v4/signature-requests/:signatureRequestId/publish", //  
  createSignatureRequestInOneCall         : "/v4/signature-requests/one-call-sign", //
  closeSignatureRequest                   : "/v4/signature-requests/:signatureRequestId/close", //    
  getSignatureRequestContext              : "/v4/signature-requests/:signatureRequestId/context", //  
  getSignatureRequestsStatus              : "/v4/applications/:appId/envs/:appEnv/signature-requests/status", //

  
  // Webhooks
  addWebhookEndpoint                      : "/v4/applications/:appId/envs/:appEnv/webhooks", 
  updateWebhookEndpoint                   : "/v4/webhooks/:webhookId",
  removeWebhookEndpoint                   : "/v4/webhooks/:webhookId",
  getWebhookEndpoints                     : "/v4/applications/:appId/envs/:appEnv/webhooks", 

  getWebhookEvents                        : "/v4/webhooks/:webhookId/events",
  getWebhookEvent                         : "/v4/webhooks/:webhookId/events/:eventId",
  resendWebhookEvent                      : "/v4/webhooks/:webhookId/events/:eventId/resend",
  checkWebhookToken                       : '/v4/tokens/webhook-verification/checking-consumption',
  initIdProofingOnlySession               : "/v4/applications/:appId/envs/:appEnv/signers/:signerId/id-proofing",

  // Seal
  
  signM2M                                 : "/v4/applications/:appId/envs/:appEnv/m2m/:m2mId/sign", 

  // Bare Signature

  bareSignatureGetProofToken              : "/v4/envs/:appEnv/oauth2/proofs-token", // proof-token
  bareSignatureGetProofs                  : "/v4/envs/:appEnv/bare-signatures/proofs", // proofs
  getBareSignatureConfiguration           : "/v4/applications/:appId/envs/:appEnv/bare-signatures-configuration", // config

  // Log Capsule

  logCapsuleCreate                        : "/v4/applications/:appId/envs/:appEnv/log-capsules", 
}
