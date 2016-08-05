'use strict';

export class ApplicationController {
    //
    // public testValue: string = "This is a Test Value!";
    //
    // private $log:any = null;

    /**
     * コンストラクタ
     */
    //static $inject = ['$log', '$window', '$location', '$scope'];
    constructor($log, $window, $location, $scope) {
        this.$log = $log;
        this.$scope = $scope;
    }
}

ApplicationController.$inject = ['$log', '$window', '$location', '$scope'];
