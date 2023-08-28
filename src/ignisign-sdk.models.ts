import {
  IGNISIGN_APPLICATION_ENV,
  IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  IGNISIGN_WEBHOOK_TOPICS,
  IgnisignWebhookCallback
} from "@ignisign/public";


export class IgnisignSdkInitializer {
  appId           : string;
  appEnv          : IGNISIGN_APPLICATION_ENV;
  appSecret       : string;
  displayWarning  : boolean = true;
}


export class IgnisignSdkExecutionContext {
  displayWarning  : boolean = true;
  appId           : string;
  appEnv          : IGNISIGN_APPLICATION_ENV;
  appSecret       : string;
}

export class IgnisignWebhookCallbackMapper<T> {
  uuid      : string;
  topic     : IGNISIGN_WEBHOOK_TOPICS         |  'ALL';
  action    : string;
  msgNature : IGNISIGN_WEBHOOK_MESSAGE_NATURE |  'ALL';
  callback  : IgnisignWebhookCallback<T>
}


export class IgnisignSdkFileContentUploadDto {
  fileStream  : NodeJS.ReadableStream;
  filename    : string;
  contentType : string;
}


