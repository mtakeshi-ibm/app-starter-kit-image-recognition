import angular from 'angular';
import angularUIBootstrap from 'angular-ui-bootstrap';

import app from './app';
import appMessages from './appMessages';
//import classifierName from './classifierName';

//ディレクティブを束ねるモジュールをエクスポート
export default angular.module( 'app.directives', [angularUIBootstrap] )
    .directive( 'app', app )
    .directive( 'appMessages', appMessages )
    //.directive( 'classifierName', classifierName)
    .name;
