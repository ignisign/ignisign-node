
export const formatUrlRequestInterceptor = (config) => {
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

export const responseStdInterceptor = (resp) => {
  return resp.data;
}

export const errorHandlerStrInterceptor = (error ) => {
  let msg = "error-occurred";

  if( error.response ){
    const errorData = error.response.data;
    if(errorData && errorData.message){
      msg = errorData.message
    }
  }

  return Promise.reject(error);
};
