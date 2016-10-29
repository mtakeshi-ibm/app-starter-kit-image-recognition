'use strict';
/*eslint no-console: "error"*/
/**
 * このindex.jsは、json-api-serverモジュールの起動用であり、npm run startで実行される const apiServer = require('./json-api-server'); 生成、ポート番号
 */
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const basicAuth = require('basic-auth-connect');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const serve_static = require('serve-static');
const cors = require('cors');
const basicAuthHandlerFunction = require('./handlers/BasicAuthHandlerFunction');

//initialize i18n modules
const i18n = require('./initializers/I18nInit');

//logger (log4js)
const logger = require('./modules/logger');

//Routerモジュールオブジェクトインスタンス
const routes = require('./routes'); //ディレクトリを指定すると、そこにあるindex.jsつまり「./routes/index.js」が読み込まれる


// 引数PORTを与えてこのモジュールを呼び出すのは、ローカル環境の場合は npm script
module.exports = (PORT) => {

    const app = express();

    //リクエストログの出力設定
    if (app.get('env') === 'production') {
        app.use(morgan("production", {
            format: 'combined',
            immediate: false
        }));
    } else {
        app.use(morgan("dev", {
            format: 'combined',
            immediate: false
        }));
    }

    // POSTでdataを受け取る設定
    app.use(compression());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    //enabled basic auth if the values of environment variables are set.
    const grantedBasicAuthUsername = process.env['BASIC_AUTH_USERNAME'];
    const grantedBasicAuthPassword = process.env['BASIC_AUTH_PASSWORD'];
    if (grantedBasicAuthUsername && grantedBasicAuthPassword) {
        app.use(basicAuth(basicAuthHandlerFunction));
    }

    app.use(serve_static(path.join(__dirname, '../dist')));

    // Enable CORS preflight across the board.
    app.options('*', cors());
    app.use(cors());

    //i18nによる国際化対応のExpressへの組み込み
    app.use(i18n.init);

    //// Router ////
    /**
     * ルート(/) およびそれ以下に対して、ルーティングモジュールを登録
     */
    app.use('/', routes);

    // production error handler
    // no stacktraces leaked to user
    app.use((err, req, res, next) => {
        //res.status(err.status || 500);
        res.status(404).send('Sorry cant find that!');
        next(err);
    });

    app.listen(PORT);
    logger.system.info('listen on port ' + PORT);
};
