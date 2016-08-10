'use strict';

/* eslint-disable no-console */
const fs = require('fs');
const config = require('config');
const request = require('request');
const utils = require('../utils/Utils');
const logger = require('../modules/logger');
//const WatsonVisualRecognitionRestClient = require('./WatsonVisualRecognitionRestClientConfigureFunction');
const WatsonVisualRecognitionUtil = require('../utils/WatsonVisualRecognitionUtil');

//グローバル設定パラメター (config設定ファイルから値を取得)
const keepUploadedImageFiles = config.app.global.keep_uploaded_image_files;

if (config.app.global.request_debug) {
    request.debug = true
}

//const keepGeneratedTrainingZipFiles = config.app.global.keep_generated_training_zip_files;
/**
 * Routeハンドラー：GET /api/classifiers用
 */
const handlerFunc = (req, res) => {

    logger.app.debug("Called ClassifyImageHandlerFunction.");

    //一時ファイルとして保存されたファイルを読み込み、Bufferデータにする(同期型)
    //const fileBuffer = fs.readFileSync(req.file.path);

    //requestモジュールによるファイルアップロードでformDataキーにセットする送信データ(parameters)の入れ物
    const apiParams = {};

    //thresholdパラメータの初期値を得る(0.5)
    let threshold = config.bluemix_service.watson_visualrecognition_v3.default_threshold;

    //targetClassifiersパラメータの組み立て
    if (req.body.targetClassifiers && JSON.parse(req.body.targetClassifiers)) {

        const classifierlist = {};
        classifierlist.classifiers = JSON.parse(req.body.targetClassifiers);

        //要素数がゼロの場合は、そもそもclassifier_idsパラメータをセットしない(全てのクラス分類器を対象とする)
        if (classifierlist.classifiers && classifierlist.classifiers.length > 0) {
            //カンマ区切り文字列化は、stringifyで行っている
            logger.app.debug("parameter classifier_ids = " + JSON.stringify(classifierlist.classifiers));
            const classifier_ids_array = [];
            classifierlist.classifiers.forEach((value) => {
                classifier_ids_array.push(value.classifier_id);
            });
            apiParams['classifier_ids'] = classifier_ids_array; //最後にapiParams自体をJSON.stringifyするのでここではオブジェクトとしてのArrayをセット
        }
    }

    //thresholdパラメータの組み立て
    logger.app.debug("request parameter threshold = " + req.body.threshold);

    if (typeof(req.body.threshold) !== 'undefined' && req.body.threshold !== null) {
        //文字列からfloat値へ変換し、値がゼロ以上の場合はデフォルト値を上書き
        const parsedThreshold = parseFloat(req.body.threshold);
        if (parsedThreshold >= 0) {
            threshold = parsedThreshold;
        }
    }


    logger.app.debug("parameter threshold = " + threshold);
    apiParams['threshold'] = threshold;

    //ownersパラメータの組み立て
    logger.app.debug("request parameter ownerIBM = " + req.body.ownerIBM + ", length =" + req.body.ownerIBM.length);
    logger.app.debug("request parameter ownerMe = " + req.body.ownerMe + ", length =" + req.body.ownerMe.length);
    let owners = [];
    if (req.body.ownerIBM == "true") {
        owners.push('IBM');
    }
    if (req.body.ownerMe == "true") {
        owners.push('me');
    }
    logger.app.debug("parameter owners = " + JSON.stringify(owners));
    apiParams['owners'] = owners; //最後にapiParams自体をJSON.stringifyするのでここではオブジェクトとしてのArrayをセット


    //アップロードされたファイル(複数対応のために、1つであってもZIP化する。)
    const uploadedFilesInfo = req.files; // multerで.arrayメソッドを使った場合は、このfilesオブジェクトはアップロードされたファイル情報を要素に持つ配列になっている

    //WatsonVisualRecognitionの要求に要した時間計測(N/W通信時間含む)
    let hrstart = process.hrtime();

    logger.app.debug('apiParameters = ' + JSON.stringify(apiParams));

    //zipファイル化する。非同期書のため、Promiseで後続処理を実装
    utils.createZip(uploadedFilesInfo, [])
        .then((array) => {
            //utils.createZip()メソッドの戻り値はarrayオブジェクトである。その要素には、
            //圧縮したZIPファイルの情報オブジェクトが格納されている
            const uploadedFileZipFilePath = array[0];

            //node-rest-clientではファイルアップロードに対応していないので、requestを使ってデータを送る
            request({
                method: 'POST',
                preambleCRLF: true,
                postambleCRLF: true,
                url: WatsonVisualRecognitionUtil.createApiUrl('/v3/classify'),
                headers: {
                    'X-Watson-Learning-Opt-Out': config.bluemix_service.watson_visualrecognition_v3.opt_out
                },
                // formDataというキー名はrequestモジュールのAPI仕様。
                formData: {
                    //Watson API仕様で定められたキー名
                    images_file: {
                        // value: positiveExampleZipBuffer, //Bufferデータはrequestモジュールによってサポートされる
                        value: fs.createReadStream(uploadedFileZipFilePath),
                        options: {
                            filename: 'file.zip',
                            contentType: 'application/zip'
                        }
                    },
                    //formData内のキーに対応する値はString, Stream, Buffer型のみのため、JSオブジェクトは文字列化する必要がある
                    parameters: JSON.stringify(apiParams)
                }
            }, (error, response, body) => {
                //処理時間計測
                const hrend = process.hrtime(hrstart); //引数にhrstartを指定することで、差分時間を得る

                if (error) {
                    logger.app.error("ERROR " + error.toString());
                    res.status(500).json(error);
                } else if (response.statusCode >= 300) {
                    logger.app.error("ERROR HTTP Response Status = " + response.statusCode + ', body = ' + response.body + 'headers = ' + JSON.stringify(response.headers));
                    const parsedBody = JSON.parse(response.body);
                    //Watson VR API仕様上、エラーJSONは error のキーを持つ
                    if (parsedBody && parsedBody.error) {
                        res.status(response.statusCode).json(parsedBody);
                    } else {
                        res.sendStatus(response.statusCode);
                    }
                } else {
                    logger.app.debug('Uploaded successfully!  Server responded with = ', body);
                    //文字列テキストであるbodyを、再度JavaScriptオブジェクト化し、処理時間の配列を保持するプロパティを生やす。
                    var respdata = JSON.parse(body);
                    // logger.app.debug('elapsedTime = '+JSON.stringify(hrend));
                    respdata['elapsedTime'] = hrend;
                    // logger.app.debug('update respdata:', JSON.stringify(respdata));
                    res.status(response.statusCode).json(respdata);

                    //後処理ファイルの削除
                    if (!keepUploadedImageFiles) {
                        for (var i = 0, n = req.files.length; i < n; i++) {
                            var fileinfo = req.files[i];

                            //ファイル削除(同期型)
                            fs.unlink(fileinfo.path, (err) => {
                                if (err) {
                                    throw err;
                                }
                                logger.app.debug('successfully deleted an uploaded file = ' + fileinfo.path);
                            });
                        }
                    }

                }

                //最後にアップロードされたファイルを削除
                //後処理:ファイルの削除
                if (!keepUploadedImageFiles) {
                    fs.unlink(uploadedFileZipFilePath, (err) => {
                        if (err) {
                            throw err;
                        }
                        logger.app.debug('successfully deleted a zip file = ' + uploadedFileZipFilePath);
                    });
                }
            })

        });

};

module.exports = handlerFunc;
