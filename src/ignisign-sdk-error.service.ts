import {IGNISIGN_ERROR_CODES} from "@ignisign/public";

import {IgnisignSdkExecutionContext} from "./ignisign-sdk.models";

const ERRORS_WARN : IGNISIGN_ERROR_CODES[] = [];
const IGNISIGN_ERROR_TEXT = "IGNISIGN SDK EXCEPTION"

const getTimestampString = () => {
  const pad = (num) => num < 10 ? '0' + num : num;

  const date = new Date();
  const dateUtc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  
  const year = dateUtc.getUTCFullYear();
  const month = pad(dateUtc.getUTCMonth() + 1); // Months are 0 based, so we need to add 1
  const day = pad(dateUtc.getUTCDate());
  const hour = pad(dateUtc.getUTCHours());
  const minutes = pad(dateUtc.getUTCMinutes());
  const seconds = pad(dateUtc.getUTCSeconds());
  
  const offset = -date.getTimezoneOffset();
  const sign = offset < 0 ? '-' : '+';
  const offsetHours = pad(Math.abs(Math.floor(offset / 60)));
  const offsetMinutes = pad(Math.abs(offset % 60));
  
  const formattedDate = `${year}-${month}-${day} ${hour}:${minutes}:${seconds} ${sign}${offsetHours}${offsetMinutes}`;
  
  return formattedDate;
}


const logError = ( code : IGNISIGN_ERROR_CODES, context : object = {}, stack: string = "", execContext: IgnisignSdkExecutionContext) => {

  const timestamp = getTimestampString(); //`${moment().utc().format('YYYY-MM-DD HH:mm:ss ZZ')}`;
  const isWarn    = ERRORS_WARN.includes(code);

  if(isWarn && !execContext?.displayWarning)
    return;

  const msgTitle  = ERRORS_WARN.includes(code) ? 'WARN' : 'ERROR';

  const errorHeaderMessage = `[${IGNISIGN_ERROR_TEXT} ${msgTitle}] [ ${timestamp} | ${code} ]`;

  console.error(errorHeaderMessage)

  if(execContext){
    if(!context)
      context = {};

    context['execContext'] = execContext;
  }

  if(context && Object.keys(context).length !== 0){
    console.error("* Context: ", context);
  }

  if(stack && stack.length !== 0){
    console.error("* Stack: ", stack);
  }
}


export const createIgnisignSdkError = (code : IGNISIGN_ERROR_CODES, context : object = {}, stack: string = "",execContext: IgnisignSdkExecutionContext): Error => {

  const ignisignError = IGNISIGN_ERROR_CODES[code];

  if(!ignisignError)
    return new Error('A Ignisign error occurred without a known error:' + code);

  logError(code, context, stack, execContext);

  const e =  new Error(`${IGNISIGN_ERROR_TEXT}: ${ignisignError}`)

  if(stack && stack.length)
    e.stack = stack;

  return e;
}



export const createIgnisignSdkErrorFromHttp = async (error: any, execContext: IgnisignSdkExecutionContext): Promise<Error> => {

  const isObject = (val) => val instanceof Object;

  if( error.response ){
    console.error("!! error.response")
    const errorData = error.response.data;

    let code;
    if(errorData && errorData.code)
      code = errorData.code;

    if(!code || !IGNISIGN_ERROR_CODES[code])
      return error;

    const context = errorData || {};

    context['execContext'] = execContext;
    if(errorData.message)
      context['message'] = isObject(errorData.message) ?
        JSON.stringify(errorData.message):
        errorData.message;

    const stack = errorData.stack || "";

    return createIgnisignSdkError(code as IGNISIGN_ERROR_CODES, context, stack, execContext);
  }
  console.error("!! not error.response")
  return error;
}

