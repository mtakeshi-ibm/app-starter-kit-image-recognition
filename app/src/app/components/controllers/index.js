import angular from 'angular';

import { ApplicationController } from './ApplicationController';
import { MainController } from './MainController';


//コントローラ用モジュール(app.controllers)を定義
const appcontrollerModule = angular.module(
  'app.controllers', []
);

//コントローラを登録
appcontrollerModule.controller('ApplicationController', ApplicationController);
appcontrollerModule.controller('MainController', MainController);

//エクスポートするのは名前文字列
export default appcontrollerModule.name;
