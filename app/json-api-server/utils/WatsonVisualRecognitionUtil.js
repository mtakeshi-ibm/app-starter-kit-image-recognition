'use strict';

/* eslint-disable no-console */
const logger = require('../modules/logger');
const config = require('config');

const ENV_KEY_NAME_IBM_WATSON_VISUAL_RECOGNITION_API_KEY = "IBM_WATSON_VISUAL_RECOGNITION_API_KEY";
const ENV_KEY_NAME_IBM_WATSON_VISUAL_RECOGNITION_BASE_URL = "IBM_WATSON_VISUAL_RECOGNITION_BASE_URL";
const ENV_KEY_NAME_IBM_WATSON_VISUAL_RECOGNITION_VERSION = "IBM_WATSON_VISUAL_RECOGNITION_VERSION";

const WatsonVisualRecognitionUtil = {};

/**
 * apiPath : /v3/classify等の文字列
 */
WatsonVisualRecognitionUtil.createApiUrl = (apiPath) => {

  let url = null;
  url = getBaseUrl();
  url = url + (apiPath || "");
  url = url + '?api_key=';
  url = url + getApiKey() ;
  url = url + '&version=';
  url = url + getVersion();
  url = url + '&verbose=true';

  logger.app.debug("createApiUrl() returned :" + url);
  return url;
}

/**
 * API キー情報を以下の優先度で取得する。
 * 1. 環境変数「IBM_WATSON_VISUAL_RECOGNITION_BASE_URL」
 * 2. 設定情報JSONファイルの bluemix_service.watson_visualrecognition_v3.apiKey
 */
const getBaseUrl = () => {

  const envBaseUrl = process.env[ENV_KEY_NAME_IBM_WATSON_VISUAL_RECOGNITION_BASE_URL];

  if (envBaseUrl) {
    return envBaseUrl;
  } else if (config.bluemix_service.watson_visualrecognition_v3.baseUrl) {
    return config.bluemix_service.watson_visualrecognition_v3.baseUrl;
  } else {
    return new Error("could not get Watson Visual Recognition BaseURL");
  }
}

/**
 * APIキー情報を以下の優先度で取得する。
 * 1. 環境変数「IBM_WATSON_VISUAL_RECOGNITION_API_KEY」
 * 2. 設定情報JSONファイルの bluemix_service.watson_visualrecognition_v3.apiKey
 */
const getApiKey = () => {

  const envApiKey = process.env[ENV_KEY_NAME_IBM_WATSON_VISUAL_RECOGNITION_API_KEY];

  if ( envApiKey ) {
    return envApiKey;
  } else if (config.bluemix_service.watson_visualrecognition_v3.apiKey) {
    return config.bluemix_service.watson_visualrecognition_v3.apiKey;
  } else {
    return new Error("could not get Watson Visual Recognition API Key");
  }
}

/**
 * v3としてのバージョン情報を以下の優先度で取得する。
 * 1. 環境変数「IBM_WATSON_VISUAL_RECOGNITION_VERSION」
 * 2. 設定情報JSONファイルの bluemix_service.watson_visualrecognition_v3.version
 */
const getVersion = () => {
  const envVersion = process.env[ENV_KEY_NAME_IBM_WATSON_VISUAL_RECOGNITION_VERSION];

  if ( envVersion ) {
    return envVersion;
  } else if (config.bluemix_service.watson_visualrecognition_v3.version) {
    return config.bluemix_service.watson_visualrecognition_v3.version;
  } else {
    return new Error("could not get Watson Visual Recognition version");
  }
}

module.exports = WatsonVisualRecognitionUtil;
