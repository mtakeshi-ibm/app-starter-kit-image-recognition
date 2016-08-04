import angular from 'angular';

import GlobalConstants from './GlobalConstants';

const commonModule = angular.module(
  'app.commons', []
);

commonModule.service('GlobalConstants', GlobalConstants.activate);

export default commonModule.name;
