
- appEnv : `string` : The environment of the application.
DEVELOPMENT | STAGING | PRODUCTION

# Bare Signature

## Flow Chart


### SDK and Example

In the following documentation, we describe 2 ways to implement the Bare Signature with IgniSign. Directly by API, or with the NodeJS SDK. Regarding showcase of the implemtation with the IgniSign NodeJS SDK, We will use Example Data structure and init initialization.

below, the different element we will use

Example Data Structure :

javascript```
// Ignisign SDK must be initialized before using this method


type BareSignatureDocument = {
  fileB64      : string;
  fileName     : string;
  mimeType     : string;
  documentHash : string;
}

enum BARE_SIGNATURE_STATUS {
  INIT       = 'INIT',
  IN_PROGESS = 'IN_PROGESS',
  SIGNED     = 'SIGNED',
}

type ExampleBareSignature = {
  _id              ?: string;
  title             : string;
  document          : BareSignatureDocument;
  status            : BARE_SIGNATURE_STATUS;
  codeVerifier      : string;
  accessToken      ?: string;
}

```

javascript```


```

## Flow

### create an autorization url to redirect the user to the Ignisign platform for initiating the Signature session.

### Create the Autorization URL by youself:
- base URL : https://api.ignisign.io/v4/envs/:appEnv/oauth2/authorize

Query Parameters
- client_id : `string` : The client ID of the application. this is the appId of the associated application in the Ignisign platform.
- redirect_uri : `string` : The URL to redirect to after the user authorizes the application. You must confugurate authorized redirect URIs in the Ignisign platform.
- response_type : `string` : The type of response Ignisign should return. Use `code` for the authorization code flow.

### Use the SDK to create the Autorization URL:
```javascript



```


