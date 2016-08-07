import angular from 'angular';

//コントローラ：固定的設定
import { ApplicationController } from './ApplicationController';
import { MainController } from './MainController';
import { BasicModalController } from './BasicModalController';

//コントローラ：アプリケーション設定
import { WatsonVisualRecognitionClassifierListController } from './WatsonVisualRecognitionClassifierListController';
import { WatsonVisualRecognitionImageClassificationController } from './WatsonVisualRecognitionImageClassificationController';
import { WatsonVisualRecognitionNewClassifierController } from './WatsonVisualRecognitionNewClassifierController';

//コントローラ用モジュール(app.controllers)を定義
const appcontrollerModule = angular.module(
  'app.controllers', []
);

//コントローラのクラスを登録(システム内部用・必須)
appcontrollerModule.controller('ApplicationController', ApplicationController);
appcontrollerModule.controller('MainController', MainController);
appcontrollerModule.controller('BasicModalController', BasicModalController);

//コントローラのクラスを登録(アプリケーション用)
appcontrollerModule.controller('WatsonVisualRecognitionClassifierListController', WatsonVisualRecognitionClassifierListController);
appcontrollerModule.controller('WatsonVisualRecognitionImageClassificationController', WatsonVisualRecognitionImageClassificationController);
appcontrollerModule.controller('WatsonVisualRecognitionNewClassifierController', WatsonVisualRecognitionNewClassifierController);

//エクスポートするのは名前文字列
export default appcontrollerModule.name;
