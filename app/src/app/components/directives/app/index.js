//import template from './template.html';

appDirective.$inject = [];
export default function appDirective() {
    return {
        template: require('./template.html'),
        controller: 'ApplicationController',
        controllerAs: 'controller'
    }
}

// export default class appDirective {
//
//   constructor(){
//     //
//     this.template = require('./template.html');
//     //this.templateUrl = './template.html';
//     this.constroller = 'ApplicationController';
//     this.controllerAs = 'controller';
//   }
//
//
//   //
//   // return {
//   //  template: require('./template.html'),
//   //  controller: 'ApplicationController',
//   //  controllerAs: 'controller'
//   // }
//
//   static activate() {
//     appDirective.instance = new appDirective();
//     return appDirective.instance ;
//   }
// }
