

import { IGNISIGN_INTEGRATION_MODE } from "@ignisign/public";
import { IgnisignManagerService } from "./ignisign-webhook.manager";

const getSignatureProfiles = async () => {
  const signatureProfiles = await IgnisignManagerService.getSignatureProfiles()
  return signatureProfiles?.filter(e=>e.integrationMode === IGNISIGN_INTEGRATION_MODE.EMBEDDED)
}

export const SignatureProfileService = {
  getSignatureProfiles
}