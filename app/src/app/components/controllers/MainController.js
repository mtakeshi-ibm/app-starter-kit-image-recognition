'use strict';

export class MainController {

    //public testValue: string = "This is a Test Value!";

    /**
     * コンストラクタ
     */
    //static $inject = ['$log', '$window', '$location', '$scope'];
    constructor($log, $window, $location, $scope) {
        this.testValue = "This is a Test Value!";
    }
}

MainController.$inject = ['$log', '$window', '$location', '$scope'];
