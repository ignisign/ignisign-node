import { IGNISIGN_INTEGRATION_MODE, IgnisignSignatureProfile } from "@ignisign/public";
import { IgnisignSdkManagerService } from "./ignisign-sdk-manager.service";

const getSignatureProfiles = async () : Promise<IgnisignSignatureProfile[]> => {
  const signatureProfiles = await IgnisignSdkManagerService.getSignatureProfiles()
  return signatureProfiles?.filter(e=>e.integrationMode === IGNISIGN_INTEGRATION_MODE.EMBEDDED)
}

export const SignatureProfileService = {
  getSignatureProfiles
}