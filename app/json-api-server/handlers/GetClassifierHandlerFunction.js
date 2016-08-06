'use strict';
/* eslint-disable no-console */
const config = require('config');
const WatsonVisualRecognitionRestClient = require('./WatsonVisualRecognitionRestClientConfigureFunction');
const logger = require('../modules/logger');
const WatsonVisualRecognitionUtil = require('../utils/WatsonVisualRecognitionUtil');

/**
 * Routeハンドラー：GET /api/classifiers用
 */
const handlerFunc = (req, res) => {
    logger.app.debug("Called GetClassifierHandlerFunction.");

    //新規の、初期設定済みのRestClientを呼び出す
    var vrClient = WatsonVisualRecognitionRestClient();

    // Watsoin VR API にHTTP GETリクエストを送信
    vrClient.get(
        //ここは baseUrl + /v3/classifiers に対してリクエストパラメータを指定
        WatsonVisualRecognitionUtil.createApiUrl('/v3/classifiers'), {
            headers: {
                'Content-type': 'application/json'
            },
        }, (data, response) => {
            //結果受信処理
            //data は パースされたJSONオブジェクト、responseはRawデータ。
            // logger.app.debug('data=' + data);
            // logger.app.debug('type of data=' + typeof(data));
            // logger.app.debug('data, true of false =' + (data ? true : false));
            // logger.app.debug('response=' + response);

            if (data) {
                //if (data && data.hasOwnProperty('classifiers')) {
                //正常かどうかは、戻りJSONデータ構造を踏まえて判定。on('error')では判定できない：クライアントへJSONデータを返却
                //res.json(data);
                logger.app.debug('classifiers API response=' + data);
                res.send(data);
            } else {
                //エラー：API仕様通りのデータを返していない場合や、何らかの理由で errorハンドラに制御がわたらないような
                //レスポンスが返された場合
                logger.app.error('Can not receive JSON data as response!');
                res.sendStatus(500);
            }
        }
    ).on('error', (err) => {
        logger.app.debug("error handler Called!");
        logger.app.debug('err.status=' + err.status + '');
        logger.app.debug('err.request=' + err.request + '');
        logger.app.debug('err.response=' + err.response + '');
        res.sendStatus(500);
    });

}

module.exports = handlerFunc;
