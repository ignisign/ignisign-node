# Node.js Implementation of Ignisign API SDK

This documentation guides you through the Node.js implementation of the Ignisign API SDK, simplifying the integration of Ignisign API with your backend.

## Pre-requisites

Before you begin, ensure you have an API key and defined webhook endpoints. 
Detailed instructions for setting these up can be found in the [Integrate Ignisign with your Backend](https://ignisign.io/docs/quick-start/Integrate_Ignisign_With_Your_Backend section).

## Installation

Install the library via npm:

```bash
npm install @ignisign/sdk
```

Additionally, consider installing the `@ignisign/public` package, which includes all types utilized by the library. While it's a transitive dependency of `@ignisign/sdk` and not mandatory, installing it directly can enhance your development experience, especially for IDE import mechanisms.

```bash
npm install @ignisign/public
```

## Integration Example

Find an example of integration in this [GitHub repository](https://github.com/ignisign/ignisign-examples/tree/main/ignisign-node).

## Initiate the IgnisignSdk Class

Begin by initiating the `IgnisignSdk` class:

```typescript
import { IgnisignSdk } from "@ignisign/sdk"

const ignisignSdkInstance = new IgnisignSdk({
  appId: IGNISIGN_APP_ID,
  appEnv: (<IGNISIGN_APPLICATION_ENV>IGNISIGN_APP_ENV),
  appSecret: IGNISIGN_APP_SECRET,
  displayWarning: true,
});
```

Find your `appId`, `appEnv`, and `appSecret` in the "API Keys" section of the [Ignisign Console](https://console.ignisign.io/). 
The `application environment` should be one of the following:

```typescript
enum IGNISIGN_APPLICATION_ENV {
  DEVELOPMENT = "DEVELOPMENT",
  STAGING = "STAGING",
  PRODUCTION = "PRODUCTION",
}
```

## Easy API Calls

The `IgnisignSdk` class exposes all API endpoints as methods for easy access. 

- An implementation example is available [here](https://github.com/ignisign/ignisign-examples/blob/main/ignisign-node/src/services/ignisign-sdk-manager.service.ts), 
- And a full description of the API endpoints is in the [Ignisign API Documentation](https://ignisign.io/docs/ignisign-api/api-auth).

### Example Implementation

```typescript
async function createNewSigner(
  signatureProfileId, 
  inputs: { [key in IGNISIGN_SIGNER_CREATION_INPUT_REF] ?: string } = {}, 
  externalId: string = null): Promise<IgnisignSigner_CreationResponseDto> {  

  const dto: IgnisignSigner_CreationRequestDto = {
    signatureProfileId,
    ...inputs,
    ...(externalId && {externalId})
  };

  try {
    return await ignisignSdkInstance.createSigner(dto);
  } catch (error) {
    console.error(error.toString());
    throw error;
  }
}
```

### Linking Your Webhook Endpoint to Ignisign SDK

Easily connect your webhook endpoint to the Ignisign SDK:

```typescript
router.post('/v1/ignisign-webhook', async (req, res, next) => {
  try {
    const result = await IgnisignSdkManagerSignatureService.consumeWebhook(req.body);
    jsonSuccess(res, result);
  } catch (e) {
    next(e);
  }
});
```

The SDK manages webhook signature verification and calls the appropriate callback method based on the webhook type.

### Registering Webhook Callbacks

You can register callbacks for various webhook events, as described in the [Webhook Events Documentation](https://ignisign.io/docs/webhooks/webhooks).

#### Example Webhook Callback Registration:

```typescript
const exampleWebhookCallback = async (
  webhookContext: IgnisignWebhookDto,
  error: IgnisignError = null,
  msgNature?: IGNISIGN_WEBHOOK_MESSAGE_NATURE,
  action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST,
  topic?: IGNISIGN_WEBHOOK_TOPICS  
): Promise<boolean> => {

  console.log("Received webhook", webhookContext, topic, action, msgNature);
  return true;
};

await ignisignSdkInstance.registerWebhookCallback(
  exampleWebhookCallback,
  IGNISIGN_WEBHOOK_TOPICS.SIGNATURE,
  IGNISIGN_WEBHOOK_ACTION_SIGNATURE.FINALIZED
);
```
#### Simplified Registration of Common Webhook Callbacks

To streamline the implementation of frequently used webhook callbacks, we've introduced a series of "shortcut" functions. These functions provide an more efficient way to handle common webhook scenarios. Below is a list of these functions:

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

### Example of Implementation

Here is an example to illustrate how these shortcut functions can be implemented:

```typescript
const webhookHandler_SignatureRequest = async (
    content: IgnisignWebhookDto_SignatureRequest,
    error: IgnisignError = null,
    msgNature?: IGNISIGN_WEBHOOK_MESSAGE_NATURE,
    action?: IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST,
    topic?: IGNISIGN_WEBHOOK_TOPICS
  ): Promise<any> => {

    if (msgNature === IGNISIGN_WEBHOOK_MESSAGE_NATURE.ERROR) {
      console.error("handleSignatureRequestWebhookSigners ERROR : ", error);
      return;
    }

    console.log("handleSignatureRequestWebhookSigners : ", content);
};

await ignisignSdkInstance.registerWebhookCallback_SignatureRequest(
    webhookHandler_SignatureRequest,  
    IGNISIGN_WEBHOOK_ACTION_SIGNATURE_REQUEST.LAUNCHED
);
```
