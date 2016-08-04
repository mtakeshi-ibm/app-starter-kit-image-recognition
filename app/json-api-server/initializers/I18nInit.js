'use strict';
//i18n initialize
const i18n = require('i18n');
i18n.configure({
  // 利用する言語環境文字をlocalesキーにを設定。この文字列がJSONファイル名に対応する。
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  // ロケールファイルの場所指定
  directory: __dirname + "/../locales",
  // オブジェクト形式(JSON)を有効化
  objectNotation: true
});

module.exports = i18n;
