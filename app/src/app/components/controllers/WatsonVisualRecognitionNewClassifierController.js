'use strict';

/**
 * Controller:
 */
export class WatsonVisualRecognitionNewClassifierController {

    /**
     * constructor - description
     *
     * @param  {type} $window                        description
     * @param  {type} $location                      description
     * @param  {type} $scope                         description
     * @param  {type} $log                           description
     * @param  {type} uiGridConstants                description
     * @param  {type} Upload                         description
     * @param  {type} GlobalConstants                description
     * @param  {type} SharedService                  description
     * @param  {type} WatsonVisualRecognitionV3Service description
     * @return {type}                                description
     */
    constructor($window, $location, $scope, $log, $translate, uiGridConstants, Upload, GlobalConstants, SharedService, WatsonVisualRecognitionV3Service) {
        'ngInject';

        //this.$log.debug("constructor of Class WatsonVisualRecognitionNewClassifierController is called.");

        this.$scope = $scope;
        this.$log = $log;
        this.$translate = $translate;
        this.uiGridConstants = uiGridConstants;
        this.Upload = Upload;
        this.GlobalConstants = GlobalConstants;
        this.SharedService = SharedService;
        this.WatsonVisualRecognitionV3Service = WatsonVisualRecognitionV3Service;


        //新規に作成されたクラス分類器の名前
        this.classifierName = null;

        //positiveExamplesArray :Array<Object>
        //Object = {
        // className : string,
        // examples : Array<Buffer>
        // fileType : string
        //}
        this.positiveExamplesArray = [];
        this.addClassDef();

        //ネガティブイメージデータ(ファイルインプットから選択されるバイナリ)
        this.negativeExamples = [];
        this.negativeExamples_fileType = this.GlobalConstants.UPLOAD_FILETYPE_SEPARATED_FILE;

        //新規作成されたクラス分類器
        this.createdClassifier = null;

        //clean Messages
        this.SharedService.clearMessages();

    }


    /**
     * clearMessages - 共有メッセージをクリアします。
     *
     * @return {void}
     */
    clearMessages() {
        this.SharedService.clearMessages();
    }


    /**
     * isReadyToCreateClassifier - 新規クラス作成ボタンをクリックできるかどうかの判断ロジックを提供するメソッド
     *
     * @return {type}  description
     */
    isReadyToCreateClassifier() {

        if (!this.classifierName) {
            //classifierNameが未入力ならNG
            return false;
        }

        // negativeExamplesのイメージ数が0でも、各クラスのPostiveイメージの合計が20以上なら問題無い
        //positiveExamplesの各イメージ数が10に満たない場合はNG
        this.positiveExamplesArray.forEach((value) => {
            if (value.positiveExamples && value.positiveExamples.length < 10) {
                return false;
            }
            //各クラス名が設定されていないならNG
            if (!value.className) {
                return false;
            }
        });

        //positiveExamplesで、クラス数が1つの場合は、ネガティブ画像が10個必要
        if (this.positiveExamplesArray.length === 1 && this.negativeExamples.length < 10) {
            return false;
        }

        return true;

    }


    /**
     * createNewClassifier - 新規にクラス分類器を作成します。
     *
     * @return {void}
     */
    createNewClassifier() {

        // this.$log.info('creatNewClassifier() is called!');
        this.clearMessages();

        if (!this.isReadyToCreateClassifier()) {
            //送信前提を満たしていない場合はエラーとして終了
            this.SharedService.addErrorMessage(this.$translate.instant('message.text_010'));

            return;
        }

        //ng-file-upload を利用してアップロードを行う
        this.Upload.upload({
            url: 'api/classifier',
            method: 'POST',
            arrayKey: '', //HTML5での単一inputからの複数ファイルアップロード時、itemname[i]という項目名でサーバに送信されるとmulterがハンドリングできずエラーになる問題に対処
            data: this._createSendData()
        }).then((resp) => {
            this.$log.info('Uploaded succesfully. Response data = ' + angular.toJson(resp.data));
            this.$scope.elapsedTime = resp.data.elapsedTime;

            //正常応答の場合、応答データJSONオブジェクトをセット
            this.createdClassifier = resp.data;

            //現在選択中のクラス分類器を更新(v3になって、非同期での学習となったため、この機能は削除)
            //this.setCurrentTargetClassifier(this.createdClassifier);

            this.SharedService.addInfoMessage(this.$translate.instant('message.text_011'));
        }, (resp) => {
            //うまくresolve出来なかった場合。
            this.SharedService.addErrorMessage(this.$translate.instant('message.server_failure_with_status', {
                'status': resp.status
            }));
            this.$log.error('Error status: ' + resp.status);
        }, (evt) => {
            //const progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //this.$log.info(angular.toJson(evt));
            //this.$log.info('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });

    }


    /**
     * setCurrentTargetClassifier - 現在選択対象のクラス分類器情報をセットします。
     *
     * @param  {type} classifierInfo description
     * @return {type}                description
     */
    setCurrentTargetClassifier(classifierInfo) {
        if (classifierInfo) {

            //唯一の要素を持つ配列としてセット
            this.SharedService.setApplicationAttribute(this.GlobalConstants.SELECTED_CLASSIFIERS, [classifierInfo]);
        }
    }

    /**
     * positiveExampleで指定するクラス定義を1つ追加する
     */
    addClassDef() {
        const positiveExampleDef = {};
        positiveExampleDef.className = "";
        positiveExampleDef.positiveExamples = [];
        positiveExampleDef.fileType = this.GlobalConstants.UPLOAD_FILETYPE_SEPARATED_FILE;
        this.positiveExamplesArray.push(positiveExampleDef);
    }

    /**
     * positiveExampleの最後のクラスを削除する
     */
    removeLastClassDef() {
        if (this.positiveExamplesArray.length >= 1) {
            this.positiveExamplesArray.pop();
        }
    }

    /**
     * テンプレートHTMLのng-changeディレクティブでバインドされる関数
     */
    changePositiveUploadFileType(index, fileType) {

        if (this.GlobalConstants.UPLOAD_FILETYPE_ZIP === fileType) {

            const positiveExample = this.positiveExamplesArray[index];
            positiveExample.fileType = this.GlobalConstants.UPLOAD_FILETYPE_ZIP;
            positiveExample.positiveExamples = [];

        } else if (this.GlobalConstants.UPLOAD_FILETYPE_SEPARATED_FILE === fileType) {

            const positiveExample = this.positiveExamplesArray[index];
            positiveExample.fileType = this.GlobalConstants.UPLOAD_FILETYPE_SEPARATED_FILE;
            positiveExample.positiveExamples = [];

        }
    }

    /**
     *テンプレートHTMLのng-changeディレクティブでバインドされる関数
     */
    changeNegativeUploadFileType(fileType) {
        this.negativeExamples = [];
    }

    /**
     *
     */
    _createSendData() {
        const data = {};

        this.positiveExamplesArray.forEach((value) => {
            data[value.className + '_positiveExamples'] = value.positiveExamples;
        });

        data['negativeExamples'] = this.negativeExamples;
        data['classifierName'] = this.classifierName;

        return data;
    }

}

WatsonVisualRecognitionNewClassifierController.$inject = ['$window', '$location', '$scope', '$log', '$translate', 'uiGridConstants', 'Upload', 'GlobalConstants', 'SharedService', 'WatsonVisualRecognitionV3Service'];
