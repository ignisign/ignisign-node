# ignisign-node

This package name is not the IgniSign SDK. It exists so the name cannot be taken by someone else.

```bash
npm install @ignisign/sdk
```

```js
import { IgnisignSdk } from "@ignisign/sdk";

const client = new IgnisignSdk({ apiKey: "skv2_your_api_key_here", displayWarning: true });
await client.init();
```

Requiring this package throws. It does not re-export the SDK.
