'use strict'

export class BasicModalController {

    /**
     * コンストラクタ
     */
    constructor($window, $location, $scope, $log, $translate, GlobalConstants, SharedService, $uibModalInstance, modalParam) {

        this.$log = $log;
        this.$scope = $scope;
        this.$translate = $translate;
        this.GlobalConstants = GlobalConstants;
        this.SharedService = SharedService;
        this.$uibModalInstance = $uibModalInstance;

        //モーダルヘッダー文字列
        $scope.modalHeader = modalParam.modalHeader;
        //モーダルボディ文字列
        $scope.modalBody = modalParam.modalBody;
        //モーダル画面用HTMLテンプレートで、ng-clickで指定されるok()メソッドの処理
        $scope.ok = function() {
            //モーダル表示元コントローラが渡してきたmodalParamの関数okFuncを呼び出して、親コントローラ側で再処理される引数を渡すことも出来る。
            if (modalParam.okFunc) {
                modalParam.okFunc();
            }
            //$modalInstanceのcloseメソッドにはこのモーダル側画面スコープ($scope)の値を指定し、モーダル呼び出し側のthenで
            //利用できるデータを型を問わず(anyで)なんでも引き渡すことができる。
            $uibModalInstance.close('OK');
        };
        //モーダル画面用HTMLテンプレートで、ng-clickで指定されるcancel()メソッドの処理
        $scope.cancel = function() {
            if (modalParam.cancelFunc) {
                modalParam.cancelFunc();
            }
            //$modalInstanceのdismissメソッドにも(closeメソッドと同様に)引数を与えることができる。単なる文字列をここでは与える
            $uibModalInstance.dismiss('CANCEL');
        };


    }
}


BasicModalController.$inject = ['$window', '$location', '$scope', '$log', '$translate', 'GlobalConstants', 'SharedService', '$uibModalInstance', 'modalParam'];
