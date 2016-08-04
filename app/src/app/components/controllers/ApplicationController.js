export class ApplicationController {

    //public $scope;

    /**
     * コンストラクタ
     */
    constructor($scope) {
        this.$scope = $scope;
    }
}

ApplicationController.$inject = ['$scope'];
