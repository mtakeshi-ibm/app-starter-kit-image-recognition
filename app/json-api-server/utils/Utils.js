/* eslint-disable no-console */
const archiver = require('archiver');
const fs = require('fs');
const cfenv = require('cfenv');
const logger = require('../modules/logger');

const Utils = {};

const appEnv = cfenv.getAppEnv();

/**
 * multerのファイル情報配列を受け取り、それらをひとまとめに単一ZIPファイル(ファイル内はフラット)のバイトデータ(Buffer)を生成する。
 * @return {Promise}
 */
Utils.createZip = (fileInfoArray, arr) => {

    // ランダムに生成する文字列の長さ
    const l = 8;

    // 生成する文字列に含める文字セット
    const c = "abcdefghijklmnopqrstuvwxyz0123456789";

    const cl = c.length;
    var r = "";
    for (var i = 0; i < l; i++) {
        r += c[Math.floor(Math.random() * cl)];
    }


    //同期型=引数なしtoBuffer()呼び出しでここでBufferオブジェクト化。APIリファレンス上は、コールバック関数をとる非同期型のAPIしか公開されていないが、とりあえず使える。
    //return zip.toBuffer();
    //
    var zipfilePath = 'upload/' + r + '.zip';
    if (appEnv.isLocal) {
        zipfilePath = 'upload/' + r + '.zip';
    } else {
        zipfilePath = '' + r + '.zip';
    }

    const archive = archiver.create('zip', {});

    const output = fs.createWriteStream(zipfilePath);
    archive.pipe(output);

    fileInfoArray.forEach((fileInfo) => {
        //logger.app.debug('a fileInfo = ' + JSON.stringify(fileInfo));
        archive.append(fs.createReadStream(fileInfo.path), {
            name: fileInfo.originalname
        });
    });


    //最終化。非同期処理である。
    archive.finalize();

    //Promise化を行う
    const promise = new Promise((resolve, reject) => {

        archive.on('error', (err) => {
            logger.app.error('error error error')
            reject(err);
        });

        //on stream closed we can end the request
        archive.on('end', () => {
            logger.app.debug('Archive wrote %d bytes', archive.pointer());
            arr.push(zipfilePath);
            resolve(arr);
        });

    });

    return promise;
}

/**
 * アップロードされたファイル(一時ファイル)を削除する
 */
Utils.deleteUplodedFiles = (fileInfoArray) => {

    for (var i = 0, n = fileInfoArray.length; i < n; i++) {
        var fileinfo = fileInfoArray[i];

        //ファイル削除(同期型)
        fs.unlink(fileinfo.path, (err) => {
            if (err) {
                logger.app.error('failed to delete/unlink file = ' + fileinfo.path);
            } else {
                logger.app.info('deleted an uploaded file = ' + fileinfo.path);
            }
        });
    }
}


module.exports = Utils;
