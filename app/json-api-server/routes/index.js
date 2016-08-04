'use strict';
// ハンドラ関数オブジェクトをインポート
//const PredictiveAnalysisScoringHandlerFunction = require('../handlers/PredictiveAnalysisScoringHandlerFunction');
//const PredictiveAnalysisQueryResultsHandlerFunction = require('../handlers/PredictiveAnalysisQueryResultsHandlerFunction');

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
 * ルーティング：スコアリングサービスの呼び出し
 */
//router.post('/api/predictiveAnalysis/score/:servicename', PredictiveAnalysisScoringHandlerFunction);

/*
 * ルーティング：dashDB結果データ全件クエリ
 */
//router.get('/api/predictiveAnalysis/result', PredictiveAnalysisQueryResultsHandlerFunction);

//Routerインスタンスをエクスポート
module.exports = router;
