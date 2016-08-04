import angular from 'angular';

import BytesFilter from './BytesFilter';

const filterModule = angular.module(
  'app.filters', []
);

filterModule.filter('BytesFilter', BytesFilter.activate);

export default filterModule.name;
