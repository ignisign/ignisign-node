import axios, {AxiosInstance, AxiosRequestConfig} from "axios";

import { DEFAULT_IGNISIGN_API_URL } from "./ignisign-sdk.constant";
import { IgnisignSdkInitializer, IgnisignSdkExecutionContext, IgnisignOldSdkInitializer} from "./ignisign-sdk.models";
import {createIgnisignSdkError, createIgnisignSdkErrorFromHttp} from "./ignisign-sdk-error.service";
import {IgnisignApiAuth_RequestDto, IGNISIGN_ERROR_CODES, IgnisignJwtContainer} from "@ignisign/public";
import { IgnisignSdkUtilsService } from "./ignisign-sdk-utils.service";
const IGNISIGN_SERVER_URL = process.env.IGNISIGN_SERVER_URL || DEFAULT_IGNISIGN_API_URL;
const MAX_BODY_LENGTH     = 50000000;
const URL_API_AUTH        = "/v4/auth/app-api";

// /!\ https://github.com/axios/axios/issues/1510#issuecomment-525382535
interface IgnisignSdkAxiosRequest extends AxiosRequestConfig {
  urlParams?      : { [keys : string] : string },
}

declare module 'axios' {
  export interface AxiosInstance {
    request<T = any>  ( config: IgnisignSdkAxiosRequest): Promise<T>;

    get<T = any>      (url: string, config?: IgnisignSdkAxiosRequest): Promise<T>;
    delete<T = any>   (url: string, config?: IgnisignSdkAxiosRequest): Promise<T>;
    head<T = any>     (url: string, config?: IgnisignSdkAxiosRequest): Promise<T>;

    post<T = any>     (url: string, data?: any, config?: IgnisignSdkAxiosRequest): Promise<T>;
    put<T = any>      (url: string, data?: any, config?: IgnisignSdkAxiosRequest): Promise<T>;
    patch<T = any>    (url: string, data?: any, config?: IgnisignSdkAxiosRequest): Promise<T>;
  }
}





export class IgnisignHttpApi {

  protected ignisignServerUrl   : string          = IGNISIGN_SERVER_URL;

  private ignisignConnectedApi  : AxiosInstance   = axios.create({ baseURL : IGNISIGN_SERVER_URL, headers: { Accept: 'application/json' }, maxBodyLength: MAX_BODY_LENGTH });
  private ignisignPublicApi     : AxiosInstance   = axios.create({ baseURL : IGNISIGN_SERVER_URL, headers: { Accept: 'application/json' }, maxBodyLength: MAX_BODY_LENGTH });

  private jwtToken              : string          = null;

  protected isInitialized         : boolean         = false;
  protected initAlreadyStarted    : boolean         = false;
  protected _init: IgnisignSdkInitializer = null;

  protected execContext           : IgnisignSdkExecutionContext;


  constructor(init: IgnisignSdkInitializer){
    this._init = init;
  }

  public async init(){
    await this._executeInit(this._init);
  }

  private async _executeInit(init: IgnisignSdkInitializer | IgnisignOldSdkInitializer ){
    try {

      const responseStdInterceptor = (resp) => resp.data;
      const formatUrlRequestInterceptor = (config) => {
        if (!config.url)
          return config;
      
        const currentUrl = new URL(config.url, config.baseURL);
      
        // @ts-ignore
        Object.entries(config.urlParams || {}).forEach(([k, v]) => currentUrl.pathname = currentUrl.pathname.replace(`:${k}`, encodeURIComponent(v)));
      
        return {
          ...config,
          baseURL: `${currentUrl.protocol}//${currentUrl.host}`,
          url: currentUrl.pathname,
        };
      };
      
      

      this.initAlreadyStarted = true;

      // Check fields directly instead of using instanceof to support both object formats and compatibility
      if ('appId' in init && 'appEnv' in init && 'appSecret' in init) {
        // Old format with appId, appEnv, appSecret
        this.execContext = {
          appId           : init.appId,
          appEnv          : init.appEnv,
          apiKey          : init.appSecret,
          displayWarning  : init.displayWarning,
          isOldKey        : true
        }
      } else if ('apiKey' in init) {
        // New format with apiKey
        try {
          const { appId, appEnv } = IgnisignSdkUtilsService.exportAppIdAndEnv(init.apiKey);
          this.execContext = {
            appId           : appId,
            appEnv          : appEnv,
            apiKey          : init.apiKey,
            displayWarning  : init.displayWarning,
            isOldKey        : false
          }
        } catch (e) {
          throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_BAD_CREDENTIALS, { customMessage : "Could not extract app info from API key. Please use a valid Ignisign API key.", init}, null, this.execContext)
        }
      } else {
        throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_BAD_CREDENTIALS, { customMessage : "Invalid API key format. Please use a valid Ignisign API key.", init}, null, this.execContext)
      }
      if (!this.isInitialized){
        this.ignisignPublicApi.interceptors.request.use(formatUrlRequestInterceptor)
        this.ignisignPublicApi.interceptors.response.use(responseStdInterceptor, this._errorHandlerStrInterceptor.bind(this));

        if(this.execContext?.isOldKey)
          await this._requestAdminAuthJWT();

        this.ignisignConnectedApi.interceptors.request.use(formatUrlRequestInterceptor)
        this.ignisignConnectedApi.interceptors.request.use(this._authRequestInterceptor.bind(this));
        this.ignisignConnectedApi.interceptors.response.use(responseStdInterceptor, this._errorHandlerStrInterceptor.bind(this));

        this.isInitialized = true;
        if(this.execContext.displayWarning)
          console.info("[Ignisign SDK] Initialized and Connected");
      }
    } catch (e) {
      console.error(e)
    }

  }

  protected getIgnisignConnectedApi() : Promise<AxiosInstance>{
    return this._getIfInitialized(this.ignisignConnectedApi);
  }

  protected getIgnisignPublicApi() : Promise<AxiosInstance>{
    return this._getIfInitialized(this.ignisignPublicApi);
  }

  protected _getJwtAuthToken(apiAuthDto : IgnisignApiAuth_RequestDto): Promise<IgnisignJwtContainer> {
    return this.ignisignPublicApi.post<IgnisignJwtContainer>(URL_API_AUTH, apiAuthDto);
  }
  /************** PRIVATE METHODS **************/

  private async _requestAdminAuthJWT(): Promise<string> {
      if(!this.execContext)
        throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_NOT_INITIALIZED, {}, null, this.execContext)

      if(!this.execContext?.isOldKey)
        throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_BAD_CREDENTIALS, { customMessage : "New API key used. JWT mechanism is not available for new API keys."}, null, this.execContext)
      
      const apiAuthDto : IgnisignApiAuth_RequestDto = {
        appId   : this.execContext.appId,
        appEnv  : this.execContext.appEnv,
        secret  : this.execContext.apiKey,
      }

      const jwtContainer : IgnisignJwtContainer  = await this.ignisignPublicApi.post(URL_API_AUTH, apiAuthDto);
      this.jwtToken       = jwtContainer.jwtToken;
      return this.jwtToken;
  }


  private async _authRequestInterceptor(config) {
    try {

      if(this.execContext?.isOldKey){
        if(!this.jwtToken)
          throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_NOT_INITIALIZED, {}, null, this.execContext);
  
        await this._renewJwtIfNeeded();
        config.headers.authorization = `Bearer ${this.jwtToken}`;
      } else {
        config.headers.authorization = `Bearer ${this.execContext.apiKey}`;
      }
     
      return config;
    } catch (e) {
      return config
    }
  }

  private async _errorHandlerStrInterceptor(error: any) {
    const e = await createIgnisignSdkErrorFromHttp(error, this.execContext);

    return Promise.reject(e);
  }

  private async _renewJwtIfNeeded() : Promise<string> {

    const  isTokenExpired = (token) => {
      if(!token)
        return true;
      const payloadBase64 = token.split('.')[1];
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
      const decoded = JSON.parse(decodedJson)
      const exp = decoded.exp;
      return (Date.now() >= exp * 1000)
    }

    if (!this.jwtToken || isTokenExpired(this.jwtToken)){
        await this._requestAdminAuthJWT();
    }

    
    return this.jwtToken;
  }

  private async _getIfInitialized<T>(result: T, attempts = 0) : Promise<T> {
    const MAX_ATTEMPTS = 3;
    const TIMEOUT_TO_RETRY = 500;

    if (this.isInitialized)
      return result;

    if (!this.initAlreadyStarted)
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_NOT_INITIALIZED, {}, null, this.execContext)

    if (attempts >= MAX_ATTEMPTS)
      throw createIgnisignSdkError(IGNISIGN_ERROR_CODES.SDK_NOT_INITIALIZED, {}, null, this.execContext)

    return new Promise((resolve, reject) => setTimeout(async () => {
      try {
        resolve(await this._getIfInitialized(result, attempts + 1));
      } catch (e) {
        reject(e);
      }
    } , TIMEOUT_TO_RETRY));

  }
}
