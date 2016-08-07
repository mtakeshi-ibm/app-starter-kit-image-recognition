'use strict'
/**
 * 共有サービスを提供するクラス
 */
class ModalService {

    /**
     * コンストラクタ
     */
    constructor($log, $uibModal, GlobalConstants, SharedService) {
        'ngInject';
        this.$log = $log;
        this.$uibModal = $uibModal;
        this.GlobalConstants = GlobalConstants;
        this.SharedService = SharedService;
        this.appScope = {};

    }

    /**
     * モーダルを開く汎用的なサービスメソッド
     */
    openModal(modalSettings, modalParam) {

        this.SharedService.clearMessages();

        //サービス呼び出し元側で指定されなかったパラメータのデフォルト値を設定
        //各パラメータの意味は、AngularUI Bootstrapのマニュアルを参照のこと
        const defaultModalSettings = {
            animation: false,
            template: require('../../view/modal/basic-modal.html'),
            controller: "BasicModalController",
            controllerAs: "controller",
            backdrop: false,
            resolve: {
                modalParam: () => {
                    return modalParam;
                }
            }
        };

        //サービス呼び出し側の指定値が優先されるよう、デフォルト設定に上書きする形で最終的なモーダル表示設定オブジェクトを生成
        const newModalSettings = angular.extend({}, defaultModalSettings, modalSettings);

        const modalInstance = this.$uibModal.open(newModalSettings);
        return modalInstance;

    }

    static activate($log, $uibModal, GlobalConstants, SharedService) {
        ModalService.instance = new ModalService($log, $uibModal, GlobalConstants, SharedService);
        return ModalService.instance;
    }
}


ModalService.activate.$inject = ['$log', '$uibModal', 'GlobalConstants', 'SharedService'];
export default ModalService;
