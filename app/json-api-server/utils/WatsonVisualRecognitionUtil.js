'use strict';
/* eslint-disable no-console */
const config = require('config');

const WatsonVisualRecognitionUtil = {};

/**
 * apiPath : /v3/classify等の文字列
 */
WatsonVisualRecognitionUtil.createApiUrl = (apiPath) => {

  let url = null;
  url = config.bluemix_service.watson_visualrecognition_v3.baseUrl;
  url = url + apiPath;
  url = url + '?api_key=';
  url = url + config.bluemix_service.watson_visualrecognition_v3.apiKey;
  url = url + '&version=';
  url = url + config.bluemix_service.watson_visualrecognition_v3.version;
  url = url + '&verbose=true';

  return url
}

module.exports = WatsonVisualRecognitionUtil;
