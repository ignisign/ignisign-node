import {
  IGNISIGN_APPLICATION_ENV,
  IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  IGNISIGN_WEBHOOK_TOPICS,
  IgnisignWebhook_Action,
  IgnisignWebhook_Callback,
  IGNISIGN_WEBHOOK_ALL_TYPE
} from "@ignisign/public";


export class IgnisignSdkInitializer {
  appId                   : string;
  appEnv                  : IGNISIGN_APPLICATION_ENV;
  appSecret               : string;
  displayWarning          : boolean = true;
  disableWebhookWarning  ?: boolean = false;
}


export class IgnisignSdkExecutionContext {
  displayWarning  : boolean = true;
  appId           : string;
  appEnv          : IGNISIGN_APPLICATION_ENV;
  appSecret       : string;
}

export class IgnisignWebhook_CallbackMapper<T> {
  uuid      : string;
  topic     : IGNISIGN_WEBHOOK_TOPICS | IGNISIGN_WEBHOOK_ALL_TYPE;
  action    : IgnisignWebhook_Action;
  msgNature : IGNISIGN_WEBHOOK_MESSAGE_NATURE | IGNISIGN_WEBHOOK_ALL_TYPE;
  callback  : IgnisignWebhook_Callback<T>
}

export class IgnisignSdkFileContentUploadDto {
  fileStream  : NodeJS.ReadableStream;
  fileName    : string;
  contentType : string;
}

export class IgnisignSignM2mSignatureRequestPayload {
  signatureRequestId : string;
  documentHash       : string;
}