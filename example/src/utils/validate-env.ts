import { cleanEnv, port, str, url } from 'envalid';

const standart: any = {
  API_NAME: str(),
  PORT: str(),
  MY_SERVER_URL: url(),
  IGNISIGN_APP_ID: str(),
  IGNISIGN_APP_ENV: str(),
  IGNISIGN_APP_SECRET: str(),
  IGNISIGN_SERVER_URL: url(),
}

function validateEnv() {
  return cleanEnv(process.env, standart)
}

export default validateEnv;
