const log4js = require('log4js');
const config = require('config');

//Log4jsモジュールの構成
log4js.configure(config.log4js);

//Log4jsロガーを用途別にそれぞれでセット
//
module.exports = {

    //appプロパティに、アプリケーション用ロガーをセット
    app : log4js.getLogger('app'),
    //systemプロパティに、システム用ロガーをセット
    system : log4js.getLogger('system')

    //ExpressのアクセスログをMorganから切り替えることも可能でそのための用途だが、実際には未使用。(Morganを利用)
    // access: log4js.getLogger('access'),
    // express: log4js.connectLogger(log4js.getLogger('access'), {
    //     level: log4js.levels.INFO
    // })
};
