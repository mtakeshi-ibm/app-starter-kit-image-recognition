/* eslint-disable no-console */
const config = require('config');
const WatsonVisualRecognitionRestClient = require('./WatsonVisualRecognitionRestClientConfigureFunction');
const logger = require('../modules/logger');
const WatsonVisualRecognitionUtil = require('../utils/WatsonVisualRecognitionUtil');

/**
 * Routeハンドラー：DELETE /api/classifiers用
 */
const handlerFunc = (req, res) => {
    logger.app.debug("Called DeleteClassifierHandlerFunction.");

    //新規の、初期設定済みのRestClientを呼び出す
    const vrClient = WatsonVisualRecognitionRestClient();
    const classifier_id = req.params.classifier_id

    logger.app.debug('classifier_id=' + classifier_id);

    // Watsoin VR API にHTTP GETリクエストを送信
    vrClient.delete(
        //ここは baseUrl + /v3/classifiers に対してリクエストパラメータを指定
        WatsonVisualRecognitionUtil.createApiUrl('/v3/classifiers/' + classifier_id),{
            headers: {
                'Content-type': 'application/json'
            }
        }, (data, response) => {
            //結果受信処理
            //data は パースされたJSONオブジェクト、responseはRawデータ。
            // console.log('data=' + data);
            // console.log('type of data=' + typeof(data));
            // console.log('data, true of false =' + (data ? true : false));
            //
            logger.app.debug('response dump = ' + response);
            //console.log('response=' + response.status);

            //正常の場合、200として返す。
            res.sendStatus(200);
        }
    ).on('error', (err) => {
        logger.app.debug("node-rest-client error handler Called!");
        logger.app.debug('err.status=' + err.status + '');
        logger.app.debug('err.request=' + err.request + '');
        logger.app.debug('err.response=' + err.response + '');
        res.sendStatus(err.status);
    });

}

module.exports = handlerFunc;
