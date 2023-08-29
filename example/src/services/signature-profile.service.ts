import { IGNISIGN_INTEGRATION_MODE, Ignisign_SignatureProfile } from "@ignisign/public";
import { IgnisignSdkManagerService } from "./ignisign-sdk-manager.service";

const getSignatureProfiles = async () : Promise<Ignisign_SignatureProfile[]> => {
  const signatureProfiles = await IgnisignSdkManagerService.getSignatureProfiles()
  return signatureProfiles?.filter(e=>e.integrationMode === IGNISIGN_INTEGRATION_MODE.EMBEDDED)
}

export const SignatureProfileService = {
  getSignatureProfiles
}