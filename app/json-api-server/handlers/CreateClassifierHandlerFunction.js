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
const keepGeneratedTrainingZipFiles = config.app.global.keep_generated_training_zip_files;

const NEGATIVE_EXAMPLES = 'negativeExamples';
const POSITIVE_EXAMPLES = 'positiveExamples';

/**
 * Routeハンドラー：POST /api/classifiers用
 */
const handlerFunc = (req, res) => {
    logger.app.debug("Called CreateClassifierHandlerFunction.");

    //HTML側でのname属性と整合性を併せてミドルウェア設定しているため、ここでは req.files に情報が入っている
    //console.log('req.files = ' + JSON.stringify(req.files));

    //requestモジュールによるファイルアップロードでformDataキーにセットする送信データの入れ物
    const formData = {};

    //multerのany()でうけったreq.filesオブジェクトそのままでは送信に使えない。
    //そのため、加工処理して
    // {
    //  "positiveExamples" : { //値はオブジェクト型
    //    "className1" : [] //ファイル情報オブジェクトの配列
    //    "className2" : [] //
    //  },
    //  "negativeExamples" : [ ファイル情報オブジェクトの配列] //値は配列型,
    //  "classNames" : [] //PositiceExampleのクラス名配列
    // }
    //
    //となるようなオブジェクトを生成する
    const fileInfoContainer = createUploadedFileInfoContainer(req.files);

    // //
    // const negativeExampleFileInfo = req.files['negativeExamples'];
    //
    // for (var j = 0, m = negativeExampleFileInfo.length; j < m; j++) {
    //     console.log('negativeExamples[' + j + ']=' + JSON.stringify(negativeExampleFileInfo[j]));
    // }

    const classifierName = req.body.classifierName;
    logger.app.debug('new classifierName = ' + classifierName);

    const promiseArray = createAllZip(fileInfoContainer, []);

    //すべてのZIP化が完了後に実際の送信処理を行う
    Promise.all(promiseArray).then((array) => {

        logger.app.debug('after createAllZip result array = ' + JSON.stringify(array));

        formData['name'] = classifierName;

        const hasNegativeExamples = (fileInfoContainer['negativeExamples'].length > 0);

        for (let i = 0; i < array.length; i++) {
            //fileInfoContainerの生成ロジック仕様に基づいて、
            //Promise配列の先頭は、ネガティブ画像イメージデータである可能性がある
            //(ネガティブ画像イメージデータはオプションのため、必ずしも先頭の要素だからといってネガティブ画像だとは限らない)
            //fileInfoContainerに、キーnegativeExamplesにセットされている配列の要素数が1以上であれば、ネガティブ画像データが
            //ブラウザ側からアップロードされてきていることになる。
            if (i === 0 && hasNegativeExamples) {
                formData['negative_examples'] = {
                    value: fs.createReadStream(array[i][0]),
                    options: {
                        filename: 'negativeExamples.zip',
                        contentType: 'application/zip'
                    }
                };
            } else {
                // 先頭データであってもfileInfoContainer['negativeExamples'].length === 0 の場合や、
                //そもそも2番目以降の場合は、それは常にポジティブ画像データである。

                // クラス名の取得
                let classname = (hasNegativeExamples ? fileInfoContainer.classNames[i - 1] : fileInfoContainer.classNames[i]);

                //送信フォームデータのパラメータ名は、ポジティブ画像データについては<クラス名>_positive_examplesとしなければならない仕様
                formData[classname + '_positive_examples'] = {
                    // value: positiveExampleZipBuffer, //Bufferデータはrequestモジュールによってサポートされる
                    value: fs.createReadStream(array[i][0]),
                    options: {
                        filename: 'positiveExamples' + '_' + (hasNegativeExamples ? i - 1 : i) + '.zip',
                        contentType: 'application/zip'
                    }
                }
            }
        }
        // logger.app.debug('positive_examples zip file path = ' + positiveExamplesZipFilePath);
        // logger.app.debug('negative_examples zip file path = ' + negativeExamplesZipFilePath);

        var hrstart = process.hrtime();

        logger.app.debug('Create Classifier Request start to send...');

        logger.app.debug('formData = ' + JSON.stringify(formData));

        //node-rest-clientではファイルアップロードに対応していないので、requestを使ってデータを送る
        request({
                method: 'POST',
                preambleCRLF: true,
                postambleCRLF: true,
                //url: config.watson.visual_recognition.baseUrl + '/v2/classifiers?version=2015-12-02',
                url: WatsonVisualRecognitionUtil.createApiUrl('/v3/classifiers'),
                headers: {
                    'X-Watson-Learning-Opt-Out': config.bluemix_service.watson_visualrecognition_v3.opt_out
                },
                formData: formData
            }, (error, response, body) => {
                //処理時間計測
                const hrend = process.hrtime(hrstart); //引数にhrstartを指定することで、そことの差分時間を返す

                if (error) {
                    logger.app.error("ERROR " + JSON.stringify(error));
                    res.status(500).json(error);
                } else if (response.statusCode >= 300) {

                    logger.app.error("ERROR HTTP Response Status = " + response.statusCode + ', body = ' + response.body + 'headers = ' + JSON.stringify(response.headers));

                    try {
                        const parsedBody = JSON.parse(response.body);
                        //Watson VR API仕様上、エラーJSONは code と error の2つのキーを持つ
                        if (parsedBody && parsedBody.code && parsedBody.error) {
                            res.status(response.statusCode).json(parsedBody);
                        } else {
                            res.status(response.statusCode).send("Server Error");
                        }
                    } catch (ex) {
                        // JSON.parseに失敗した場合など。500番台で、レスポンスボディがJSONテキストではなく、文字列テキストであるような場合(502など)
                        res.status(response.statusCode).send("Server Error : " + response.body);
                    }
                } else {
                    logger.app.debug('Upload success! Server response:', body);
                    //文字列テキストであるbodyを、再度JavaScriptオブジェクト化し、処理時間の配列を保持するプロパティを生やす。
                    var respdata = JSON.parse(body);
                    //console.log('elapsedTime = ' + JSON.stringify(hrend));
                    respdata['elapsedTime'] = hrend;
                    // console.log('update respdata:', JSON.stringify(respdata));
                    //res.status(response.statusCode).send(respdata);
                    res.status(response.statusCode).json(respdata);

                }

                //delete files
                //後処理:ファイルの削除
                if (!keepUploadedImageFiles) {
                    //fileInfoContinerを元に、そこに指定されているすべてのファイルを削除
                    utils.deleteUplodedFiles(req.files);
                }

                if (!keepGeneratedTrainingZipFiles && array.length > 0) {
                    array.forEach((arr) => {

                        fs.unlink(arr[0], (err) => {
                            if (err) {
                                //throw err;
                            }
                            logger.app.debug('zip file deleted = ' + arr[0]);
                        });
                    });
                }

            }

        );


    }).catch((err) => {
        res.status(500).json(err);
    });

}

// {
//  "positiveExamples" : { //値はオブジェクト型
//    "className1" : [] //ファイル情報オブジェクトの配列
//    "className2" : [] //
//  },
//  "negativeExamples" : [ ファイル情報オブジェクトの配列] //値は配列型
// }
const createUploadedFileInfoContainer = (files) => {

    //戻り値
    const fileInfoContainer = {};

    const _POSITIVEEXAMPLES = "_positiveExamples";

    fileInfoContainer['classNames'] = [];

    //v3APIの仕様上、negativeExamplesは1つしかないので、クラス名ではなくそのまま配列を値としてセット
    fileInfoContainer['negativeExamples'] = []; ///空の配列
    fileInfoContainer['positiveExamples'] = {}; ///空のオブジェクト

    const positiveExamples = fileInfoContainer['positiveExamples'];

    if (files) {

        let previousclassName = null;

        files.forEach((value) => {
            const fieldName = value.fieldname;
            if (fieldName === 'negativeExamples' && value) {
                //フィールド名が negativeExamples の場合は、各ファイル情報オブジェクトを単純に追加していく
                fileInfoContainer['negativeExamples'].push(value);
            } else if (fieldName.indexOf(_POSITIVEEXAMPLES) !== -1) {
                //フィールド名が_positiveExamplesを含んでいる場合、クラス名を切り出してそれをキー名に配列をセット(なければセット)して追加
                const regexp = new RegExp(_POSITIVEEXAMPLES, "g");
                const className = fieldName.replace(regexp, ''); //空文字に置換つまり該当部分の文字を削除
                if (!positiveExamples[className]) {
                    positiveExamples[className] = []; //空の配列をセット
                }

                positiveExamples[className].push(value);
                //classNames配列は、同じクラス名は二度と入れない。そのため、前と同じでない場合にのみセットする
                if (previousclassName !== className) {
                    fileInfoContainer['classNames'].push(className);
                }
                //1つ前のものとしてセット
                previousclassName = className;

            }
        });
    }

    logger.app.debug('fileInfoContainer = ' + JSON.stringify(fileInfoContainer));

    return fileInfoContainer;
};

/**
 * 関数 全部のZIPファイルを作成する
 */
const createAllZip = (fileInfoContainer) => {

    const promiseArray = [];

    let negativeExampleFileInfo = fileInfoContainer['negativeExamples'];

    //ネガティブ画像ファイル(単発またはZIPのどちらにしても)はオプションであり、何もファイルが送信されてこない場合がある。
    //その場合は fileInfoContainer['negativeExamples'] の値は初期値としての「空の配列」がセットされている。
    //この場合は、そもそもZIPファイルのセットを行わない(Promise配列にセットしない)
    if (negativeExampleFileInfo.length > 0) {
        //negativeExampleのアップロード用ZIPファイルを生成
        const firstPromise = utils.createZip(negativeExampleFileInfo, []);
        promiseArray.push(firstPromise);
    }

    //以降、数が不定のpositiveExamples用の処理を行う
    // 値はオブジェクト型
    const positiveExamples = fileInfoContainer.positiveExamples;

    //logger.app.debug('positiveExamples' + JSON.stringify(positiveExamples));

    Object.keys(positiveExamples).forEach((key) => {
        //logger.app.debug('key=' + key);
        const positiveClassExampleFileInfo = positiveExamples[key];
        const promise = utils.createZip(positiveClassExampleFileInfo, []);
        promiseArray.push(promise);
    });

    return promiseArray;
};

module.exports = handlerFunc;
