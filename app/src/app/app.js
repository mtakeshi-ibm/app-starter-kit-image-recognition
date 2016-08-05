// This file is referred from 'webpack.config.js'
//load jquery
import 'jquery/dist/jquery.min';

//angular and sub components
import angular from 'angular';
import angularAnimate from 'angular-animate';
import angularUIRouter from 'angular-ui-router';
import angularMessages from 'angular-messages';
import angularTranslate from 'angular-translate';
import angularTranslateLoaderStaticFiles from 'angular-translate-loader-static-files';
import angularUIBootstrap from 'angular-ui-bootstrap';
import accordion from 'angular-ui-bootstrap/src/accordion';
import datepicker from 'angular-ui-bootstrap/src/datepicker';
import buttons from 'angular-ui-bootstrap/src/buttons';
import alerts from 'angular-ui-bootstrap/src/alert';
import fileUpload from 'ng-file-upload';
import angularLoadingBar from 'angular-loading-bar';
import angularNvd3 from 'angular-nvd3';
import angularBootstrapCheckbox from 'angular-bootstrap-checkbox/angular-bootstrap-checkbox';

// application components
import controllers from './components/controllers';
import directives from './components/directives';
import services from './components/services';
import filters from './components/filters';
import commons from './components/commons';

// application configuration
import AppConfig from './app.config';
import RouteConfig from './route.config';

// load Bootstrap3 CSS
import 'bootstrap/dist/css/bootstrap.min.css';
//import '../style/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

// load ui-grid JS and CSS (ui-gridはindex.jsが提供されていないため、importだけではJSを読み込まない)
//ui-grid.min.jsをimport=require相当の処理をして読みこみ、ui.gridモジュールを読み込んで、後続の実際にangluar.moduleの
//で 依存コンポーネントとして 固定的な 'ui.grid' のモジュール名文字列を指定する
import 'angular-ui-grid/ui-grid.min.js';
import 'angular-ui-grid/ui-grid.min.css';

// load angular-loading-bar JS and CSS ($http要求時の自動的なローディングバーを表示)
import 'angular-loading-bar/build/loading-bar.min.js';
import 'angular-loading-bar/build/loading-bar.min.css';

//import 'angular-google-chart/ng-google-chart.min.js';
import 'd3/d3.min.js'
import 'nvd3/build/nv.d3.min.js'
import 'nvd3/build/nv.d3.min.css'
import 'angular-nvd3/dist/angular-nvd3.min.js';

// このモジュール名  (エントリーページの ng-app属性の指定値"app"と同じ名前にする必要がある)
const MODULE_NAME = 'app';

// "app"モジュールの生成 (繰り返すが、エントリーページの ng-app属性の指定値"app"と同じ名前にする必要がある)
const appModule = angular.module(
  MODULE_NAME,
  [
    angularAnimate,
    angularUIRouter,
    angularUIBootstrap,
    angularMessages,
    angularTranslate,
    angularTranslateLoaderStaticFiles,
    fileUpload,
    angularLoadingBar,
    angularNvd3,
    'ui.grid', //aungular-ui-gridが内部で宣言しているモジュール物理名
    'ui.grid.resizeColumns',
    'ui.grid.pagination',
    'ui.grid.exporter',
    'ui.grid.selection',
    'ui.grid.grouping',
    'ui.checkbox',
    buttons,
    alerts,
    accordion,
    datepicker,
    controllers,
    directives,
    services,
    filters,
    commons
  ]
);

//アプリケーション全体設定
appModule.config(AppConfig.activate);

//ui-routerを利用した画面遷移(ルーティング)設定
appModule.config(RouteConfig.activate);

// export angular module name as this module
export default appModule.name;
