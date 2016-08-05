import angular from 'angular';

import SharedService from './SharedService';
import WatsonVisualRecognitionV3Service from './WatsonVisualRecognitionV3Service';

const appServiceModule = angular.module(
      'app.services', []
    );

//以下、サービスを登録
appServiceModule.service('SharedService', SharedService.activate);
appServiceModule.service('WatsonVisualRecognitionV3Service', WatsonVisualRecognitionV3Service.activate);

export default appServiceModule.name;
