'use strict';
/* eslint-disable no-console */
const config = require('config');

const ENV_KEY_NAME_VISUAL_RECOGNITION_API_KEY = "VISUAL_RECOGNITION_API_KEY";

const WatsonVisualRecognitionUtil = {};

/**
 * apiPath : /v3/classify等の文字列
 */
WatsonVisualRecognitionUtil.createApiUrl = (apiPath) => {

  let url = null;
  url = config.bluemix_service.watson_visualrecognition_v3.baseUrl;
  url = url + apiPath;
  url = url + '?api_key=';
  url = url + getApiKey() ;
  url = url + '&version=';
  url = url + config.bluemix_service.watson_visualrecognition_v3.version;
  url = url + '&verbose=true';

  return url
}

/**
 * APIキー情報を以下の優先度で取得する。
 * 1. 環境変数「VISUAL_RECOGNITION_API_KEY」
 * 2. 設定情報JSONファイルの bluemix_service.watson_visualrecognition_v3.apiKey
 */
const getApiKey = () => {

  const envApiKey = process.env[ENV_KEY_NAME_VISUAL_RECOGNITION_API_KEY];

  if ( envApiKey ) {
    return envApiKey;
  } else if (config.bluemix_service.watson_visualrecognition_v3.apiKey) {
    return config.bluemix_service.watson_visualrecognition_v3.apiKey;
  } else {
    return new Error("could not found Watson Visual Recognition API Key");
  }
}

module.exports = WatsonVisualRecognitionUtil;
