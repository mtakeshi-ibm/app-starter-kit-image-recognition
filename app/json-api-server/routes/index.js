'use strict';
// ハンドラ関数オブジェクトをインポート
const GetClassifierHandlerFunction = require('../handlers/GetClassifierHandlerFunction');
const ClassifyImageHandlerFunction = require('../handlers/ClassifyImageHandlerFunction');
const DeleteClassifierHandlerFunction = require('../handlers/DeleteClassifierHandlerFunction');
const CreateClassifierHandlerFunction = require('../handlers/CreateClassifierHandlerFunction');



const cfenv = require('cfenv');
const express = require('express');
const multer = require('multer'); //ファイルアップロード受信処理用ミドルウェア

const appEnv = cfenv.getAppEnv();

let uploadedFiles = null;
if (appEnv.isLocal) {
    //local environment
    uploadedFiles = multer({
        dest: './upload'
    });
} else {
    //Bluemix,CloudFoundry environment
    uploadedFiles = multer({
        dest: process.env.TMPDIR
    });
}

//Express4 Router
const router = express.Router();

/**
 * このルーティングモジュール(/)に作用する共通のミドルウェア的処理
 */
router.use((req, res, next) => {
    //console.log('Something is happening.');
    next(); //ミドルウェア関数において、後続のルーティング処理を呼び出すためにこのnext()は必須。
});

// ルーティング：テスト用。
router.get('/api/test', (req, res) => {
    res.json({
        message: 'Successfully Posted a test message.'
    });
});


/*
 * ルーティング：classifiers一覧取得
 */
router.get('/api/classifiers', GetClassifierHandlerFunction);

/*
 * ルーティング：classifier削除
 */
router.delete('/api/classifiers/:classifier_id', DeleteClassifierHandlerFunction);

/*
 * ルーティング：分類操作。マルチパートアップロードであることが前提
 */
//router.post('/api/classify', uploadedFiles.any(), ClassifyImageHandlerFunction);
//router.post('/api/classify', uploadedFiles.single('uploadFile'), ClassifyImageHandlerFunction);
router.post('/api/classify', uploadedFiles.array('uploadFiles'), ClassifyImageHandlerFunction);

/**
 * ルーティング:新規クラス分類器の作成(トレーニング)。マルチパートアップロードであることが前提。
 * 複数のフォーム名で、それぞれ複数の画像ファイルがアップロードされてくる
 */
// router.post('/api/classifier', uploadedFiles.fields([{
//     name: 'positiveExamples'
// }, {
//     name: 'negativeExamples'
// }]), CreateClassifierHandlerFunction);
router.post('/api/classifier', uploadedFiles.any(), CreateClassifierHandlerFunction);

//Routerインスタンスをエクスポート
module.exports = router;
