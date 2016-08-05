//import template from './template.html';

appDirective.$inject = [];
export default function appDirective() {
    return {
        template: require('./template.html'),
        controller: 'ApplicationController',
        controllerAs: 'controller'
    }
}
