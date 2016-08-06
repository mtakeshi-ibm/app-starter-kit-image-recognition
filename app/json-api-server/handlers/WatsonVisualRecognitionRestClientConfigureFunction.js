'use strict';
/* eslint-disable no-console */
const config = require('config');
const RestClient = require('node-rest-client').Client;
const logger = require('../modules/logger');

// v2用 BASIC認証用設定オブジェクト (config設定ファイルから値を取得)
// const options_auth = {
//     user: config.watson.visual_recognition.apiKey,
//     password: config.watson.visual_recognition.apiPassword
// };

/**
 * node-reset-clientのBasic認証の共通設定を行う関数
 *
 */
const WatsonVisualRecognitionConfigureFunc = () => {

    //console.log("config value[config.watson.visual_recognition.baseUrl] = " + config.watson.visual_recognition.baseUrl);

    //BASIC認証設定を利用したコンストラクタ呼び出し
    // const vrClient = new RestClient(options_auth); //v2用はBASIC認証を伴うので、コンストラクタに認証情報をセット
    const vrClient = new RestClient();

    //クライアントレベルのエラーハンドラ登録
    vrClient.on('error', (err) => {

        logger.app.error('Something went wrong on the client', err);
        //console.error('Something went wrong on the client', err);

        if (err.response) {
          logger.app.error('err.response is not null!');
          //console.log('err.response is not null!');
        }
    });

    //newしたRestClientを返却
    return vrClient;
}

module.exports = WatsonVisualRecognitionConfigureFunc;
