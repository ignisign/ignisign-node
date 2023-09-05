import { IgnisignSigner_CreationRequestDto } from "@ignisign/public";
import { MyUser, MyUserModel } from "../models/user.db.model";
import { IgnisignSdkManagerService } from "./ignisign-sdk-manager.service";

const addSigner = (signatureProfileId, signer: IgnisignSigner_CreationRequestDto) => {
  try {
    return new Promise((resolve, reject) => {
      MyUserModel.insert({...signer, signatureProfileId}, async (error, found)=>{
        if (error) {
          reject(error);
        } else {
          try {
            const userId = found?.length ? found[0]._id.toString() : null;
            const user = await IgnisignSdkManagerService.createNewSigner(
              signatureProfileId, {
              ...signer,
              birthDate : signer.birthDate.toString(), 
            }, userId)
  
            const {signerId, authSecret} = user;
          
            MyUserModel.update({_id: userId}, {signerId, authSecret, ...signer, signatureProfileId}, (error, found)=>{})
            resolve(found);
            
          } catch (error) {
            console.error(error)
          }
        }
      });
    });
  } catch (error) {
    console.error(error)
  }
}


const deleteUser = (userId: string) : Promise<MyUser> => {
  return new Promise((resolve, reject) => {
    MyUserModel.remove({_id: userId}, (error, found)=>{
      if (error) {
        reject(error);
      } else {
        resolve(found);
      }
    });
  });
}

const getUsers = async () => {
  return new Promise((resolve, reject) => {
    MyUserModel.find({}).toArray((error, found) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve(found);
      }
    });
  });
}

export const SignerService = {
  addSigner,
  deleteUser,
  getUsers
}