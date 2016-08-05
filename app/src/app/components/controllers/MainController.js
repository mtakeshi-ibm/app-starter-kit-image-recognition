'use strict';

export class MainController {
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

        this.testValue = "This is a Test Value!";
        //this.$log.info("インジェクションのテスト");
    }
}

MainController.$inject = ['$log', '$window', '$location', '$scope'];
