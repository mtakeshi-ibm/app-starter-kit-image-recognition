import BaseService from './BaseService';



/**
 * WatsonVisualRecognitionのクライアントとしてサービスを実行するクラス
 */
class WatsonVisualRecognitionV3Service extends BaseService {

    /**
     * コンストラクタ
     */
    constructor($log, $http) {
        'ngInject';
        super();
        this.$log = $log;
        this.$http = $http;
    }

    /**
     * クラスを削除する。
     * 戻り値はPromise
     */
    deleteClassifier(classifier) {
        this.$log.info('WatsonVisualRecognitionV3Service#deleteClassifier(' + JSON.stringify(classifier) + ') is called');

        const classifierId = classifier.classifier_id;

        if (!classifierId) {
            this.SharedService.addErrorMessage('missing classifier id!');
            return;
        } else {
            const responsePromise = this.$http.delete('/api/classifiers/' + classifierId , {});

            //$httpサービスを使ってREST APIを呼び出した戻り値のPromiseをそのままコントローラに返す(非同期的に)
            return responsePromise;
        }

    }

    /**
     * クラスをリストする。
     * 戻り値はPromise
     */
    listClassifiers() {

        this.$log.info("WatsonVisualRecognitionV3Service#listClassifiers is called");

        const responsePromise = this.$http.get('/api/classifiers', {});

        //$httpサービスを使ってREST APIを呼び出した戻り値のPromiseをそのままコントローラに返す(非同期的に)
        return responsePromise;

    }

    /**
     * strict DI対応メソッド
     */
    static activate($log, $http) {
      WatsonVisualRecognitionV3Service.instance = new WatsonVisualRecognitionV3Service($log, $http);
      return WatsonVisualRecognitionV3Service.instance;
    }
}

//strict DI対応設定(activateプロパティとその下の$injectに文字列配列を定義することで、AngularJSに通知)
WatsonVisualRecognitionV3Service.activate.$inject = ['$log', '$http'];

export default WatsonVisualRecognitionV3Service;
