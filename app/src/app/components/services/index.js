import angular from 'angular';

import SharedService from './SharedService';

const appServiceModule = angular.module(
      'app.services', []
    );

//以下、サービスを登録
appServiceModule.service('SharedService', SharedService.activate);

export default appServiceModule.name;
