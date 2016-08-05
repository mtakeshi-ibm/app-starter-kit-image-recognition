//CloudFoundry環境かどうかを認識するための便利モジュールcfenvを利用
const cfenv = require('cfenv');
// dotenvモジュールにより環境変数を反映
require('dotenv').load();

//※ Node.jsネイティブでのES6対応は、importには対応してない。よって右の表記はNG → import apiServer from "./json-api-server";
const apiServer = require('./json-api-server');

const appEnv = cfenv.getAppEnv();

//production環境の場合は、Bluemix環境とみなし、VCAP_APPLICATION変数により指示されたportを利用して待ち受け。それ以外の場合(ローカル開発環境)は8080を利用
const PORT = (process.env.NODE_ENV === "production" ? appEnv.port : process.env.PORT || 8080);
const PROD = process.env.NODE_ENV === "production";

if (PROD) {
  //本番環境の場合、APIサーバーのみを稼働させる (クライアント向けAngularSPAアプリは、dist以下のビルド済みファイルをstaticファイルとして公開するだけ)
  apiServer(PORT);
} else {
  //※ Node.jsネイティブでのES6対応は、importには対応指定してない。よって右の表記はNG → import appServer from "./webpack-server";
  const appServer = require('./webpack-server');
  //開発環境の場合、APIサーバーとアプリケーションサーバーを同一マシン上に、ポート番号を分けて2つのexpressフレームワーク利用アプリを稼働させる
  apiServer(PORT - 1);
  appServer(PORT);
}
