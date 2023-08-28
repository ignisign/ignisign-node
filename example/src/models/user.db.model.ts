import { COUNTRIES } from "@ignisign/public";
const fs     = require('fs');
const Engine = require('tingodb')();

const envDir = `./data/${process.env.IGNISIGN_APP_ENV}`
const dir    = `${envDir}/${process.env.IGNISIGN_APP_ID}`

if (!fs.existsSync(envDir)) 
  fs.mkdirSync(envDir);

if (!fs.existsSync(dir))
  fs.mkdirSync(dir);

const db = new Engine.Db(dir, {});

export type MyUser = {
  firstName     : string;
  lastName      : string;
  email         : string;
  nationality   : COUNTRIES;
  birthDate     : Date;
  birthPlace    : string;
  birthCountry  : COUNTRIES;
  signerId     ?: string;
  authSecret   ?: string;
  phoneNumber  ?: string;
  _id          ?: string;
}


export const MyUserModel = db.collection("users");
