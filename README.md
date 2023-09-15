This is the implemetation of the Ignisign API SDK in Node JS. <br/>
It ease the integration of the Ignisign API with your backend.

## Pre-requisites

First at all you need an API key, and defined Webhook endpoints. <br/>
Follow the information in the **[Integrate Ignisign with your Backend](https://doc.ignisign.io/#tag/Integrate-Ignisign-with-your-Backend)** to do it.

## Installation

You can install the library using npm.

```bash
npm install @ignisign/sdk
```

We suggest your to also install `@ignisign/public` package into your application. <br/>
This package contains all types that are used by the library.<br/><br/>

Although it is a transitive dependancy from `@ignisign/ignisign-node`, and consequently it's not mandatory to install it, it will help you to have a **better experience** with the library, expecially regarding **import mecanism of your IDE** (Indeed, IDE do not resolve automatically dependancies import from  transitives dependancies)

```bash
npm install @ignisign/public
```

an example of integration is available **[here](https://github.com/ignisign/ignisign-examples/tree/main/ignisign-node-example)**

## Usage
<br/>

### Initiate the IgnisignSdk class.
<br/>
First at all you need to initiate the IgnisignSdk class

```typescript
import { IgnisignSdk } from "@ignisign/sdk"

    ignisignSdkInstance = new IgnisignSdk({
      appId           : IGNISIGN_APP_ID,
      appEnv          : (<IGNISIGN_APPLICATION_ENV>IGNISIGN_APP_ENV),
      appSecret       : IGNISIGN_APP_SECRET,
      displayWarning  : true,
    })
```

You can found your appId in the API Keys section of your application into the [Ignisign Console](https://console.ignisign.io/).

The `application environment` is a value of the following enum:

```typescript
enum IGNISIGN_APPLICATION_ENV {
  DEVELOPMENT   = "DEVELOPMENT",
  STAGING       = "STAGING",
  PRODUCTION    = "PRODUCTION",
}
```

### Call the API easyly
<br/>

The **IgnisignSdk** class expose all the API endpoints as methods.<br/>
So, you can call them easily.<br/><br/>

```typescript

async function createNewSigner(
  signatureProfileId, 
  inputs: { [key in IGNISIGN_SIGNER_CREATION_INPUT_REF] ?: string } = {}, 
  externalId: string = null): Promise<IgnisignSigner_CreationResponseDto> {  

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
```

You can found a full description of the API endpoints in the **[Ignisign API Documentation](https://doc.ignisign.io/#tag/Api-Auth)**


### Link your webhook endpoint to Ignisign SDK
<br/>
you can link your webhook endpoint to Ignisign SDK very easily.
<br/><br/>

```typescript
router.post('/v1/ignisign-webhook', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await IgnisignSdkManagerService.consumeWebhook(req.body);
        jsonSuccess(res, result);
      } catch(e) { next(e) }
    })
```

The Ignisign SDK will manage the webhook signature verification, and will call the right callback method according to the webhook type.

### Register webhooks callbacks
<br/>
You can now register your webhooks callbacks to the Ignisign SDK.
<br/><br/>

```typescript
const exampleWebhookCallback = async ( 
  webhookContext  : IgnisignWebhookDto, 
  error           : IgnisignError = null,
  msgNature      ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  action         ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST,
  topic          ?: IGNISIGN_WEBHOOK_TOPICS  
): Promise<boolean> => {

  console.log("Received webhook", webhookContext, topic, action, msgNature)
  return true;
}

await ignisignSdkInstance.registerWebhookCallback(
  exampleWebhookCallback, 
  IGNISIGN_WEBHOOK_TOPICS.SIGNATURE,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE.FINALIZED
);

```
<br/>
There are also register functions for **each webhook type**.
<br/><br/>

```typescript
  registerWebhookCallback_Signature(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_Signature>, 
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE
  ): Promise<string>;

  registerWebhookCallback_SignatureSession(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureSession>, 
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_SESSION
  ): Promise<string>;

  registerWebhookCallback_DocumentRequest(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_DocumentRequest>, 
    action?: IGNISIGN_WEBHOOK_ACTION_DOCUMENT_REQUEST
  ): Promise<string>;

  registerWebhookCallback_SignatureRequest(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureRequest>, 
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST
  ): Promise<string>;

  registerWebhookCallback_SignatureProfile(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureProfile>, 
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROFILE
  ): Promise<string>;

  registerWebhookCallback_Signer(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_Signer>, 
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNER
  ): Promise<string>;

  registerWebhookCallback_SignatureProof(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureProof>, 
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_PROOF
  ): Promise<string>;

  registerWebhookCallback_SignatureImageGenerated(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_SignatureImage>, 
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_IMAGE
  ): Promise<string>;

  registerWebhookCallback_Application(
    callback: IgnisignWebhook_Callback<IgnisignWebhookDto_Application>, 
    action?: IGNISIGN_WEBHOOK_ACTION_APPLICATION
  ): Promise<string>;
    
```
<br/><br/>
All webhooks events are described in the **[Webhook Events Documentation](https://doc.ignisign.io/#tag/Webhook-Events)**<br/>

You can register them easily using the same principle.
<br/><br/>

```typescript

const handleSignatureRequestWebhookSigners = async (
    content     : IgnisignWebhookDto_SignatureRequest,
    error       : IgnisignError = null,
    msgNature  ?: IGNISIGN_WEBHOOK_MESSAGE_NATURE,
    action     ?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST,
    topic      ?: IGNISIGN_WEBHOOK_TOPICS
  ): Promise<any> => {

  if(msgNature === IGNISIGN_WEBHOOK_MESSAGE_NATURE.ERROR) {
    console.error("handleSignatureRequestWebhookSigners ERROR : ", error);
    return;
  }

  console.log("handleSignatureRequestWebhookSigners : ", content);
  
}

await ignisignSdkInstance.registerWebhookCallback_SignatureRequest(
  SignatureRequestService.handleSignatureRequestWebhookSigners,  
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST.LAUNCHED
);

```



