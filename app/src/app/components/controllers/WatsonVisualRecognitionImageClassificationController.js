'use strict';

/**
 * Controller:
 */
export class WatsonVisualRecognitionImageClassificationController {

    /**
     * コンストラクタ
     */
    constructor($window, $location, $scope, $log, $translate, uiGridConstants, Upload, GlobalConstants, SharedService, WatsonVisualRecognitionV3Service) {
        'ngInject';

        this.$scope = $scope;
        this.$log = $log;
        this.$translate = $translate;

        //this.$log.debug("constructor of Class WatsonVisualRecognitionImageClassficitationController is called.");

        this.SharedService = SharedService;
        this.GlobalConstants = GlobalConstants;
        this.uiGridConstants = uiGridConstants;
        this.Upload = Upload;
        this.WatsonVisualRecognitionV3Service = WatsonVisualRecognitionV3Service;

        this.targetClassesType = GlobalConstants.TARGET_CLASS_TYPE_ALL;

        //アップロードするファイル(配列) 初期値として空の配列をセット
        this.targetFile = [];
        this.threshold = 0.5; //default threshold.

        //判定対象Owner指定
        this.enableOwnerIBM = false;
        this.enableOwnerMe = true;

        //ui-grid表設定オブジェクト
        this.$scope.gridOptions = {
                data: [],
                columnDefs: [{
                    field: 'image',
                    displayName: this.$translate.instant('label.text_106'),
                    grouping: {
                        groupPriority: 0
                    },
                    sort: {
                        priority: 0,
                        direction: 'desc'
                    }
                }, {
                    field: 'classifier_id',
                    displayName: this.$translate.instant('label.text_101')
                }, {
                    field: 'classifier_name',
                    displayName: this.$translate.instant('label.text_100')
                }, {
                    field: 'class_name',
                    displayName: this.$translate.instant('label.text_109')
                }, {
                    field: 'score',
                    displayName:  this.$translate.instant('label.text_107'),
                    filters: [{
                        condition: this.uiGridConstants.filter.GREATER_THAN_OR_EQUAL,
                        placeholder: '>='
                    }, {
                        condition: this.uiGridConstants.filter.LESS_THAN_OR_EQUAL,
                        placeholder: '<='
                    }]
                }],
                showGridFooter: true,
                enableGridMenu: true,
                exporterCsvFilename: 'classificationResult.txt',
                exporterCsvColumnSeparator: '\t',
                exporterMenuPdf: false,
                enableColumnResizing: true,
                enableFiltering: true
            }
            //clean Messages
        this.SharedService.clearMessages();

    }

    /**
     * メッセージをクリアする。
     */
    clearMessages() {
        this.SharedService.clearMessages();
    }

    /**
     * ファイルをサーバーにアップロードして、クラス分類・判定を行う
     */
    upload() {
        this.$log.info("upload method is called.")

        let targetClassifiers = {};

        //ラジオボタンの設定によって、送信するかどうかのデータを切り替え
        if (this.targetClassesType !== this.GlobalConstants.TARGET_CLASS_TYPE_ALL) {
            targetClassifiers = angular.toJson(this.modifyClassifiers(this.getSelectedClassifiers())) //配列オブジェクト
        }

        //ng-file-upload を利用してアップロードを行う
        this.Upload.upload({
            url: 'api/classify',
            method: 'POST',
            arrayKey: '', //HTML5での単一inputからの複数ファイルアップロード時、itemname[i]という項目名でサーバに送信されるとmulterがハンドリングできずエラーになる問題に対処
            data: {
                'uploadFiles': this.targetFile, //このキー名は、フォーム項目のnameに相当する。この文字列はNode.js側 multer 処理と連動する
                'targetClassifiers': targetClassifiers,
                'threshold': this.threshold,
                'ownerIBM': this.enableOwnerIBM,
                'ownerMe' : this.enableOwnerMe
            }
        }).then((resp) => {
            this.$log.info('Success uploaded. Response: ' + angular.toJson(resp.data));
            this.$scope.elapsedTime = resp.data.elapsedTime;
            //画面表示用に、二次元表に適したデータ構造へ組み替え
            this.$scope.gridOptions.data = this._flattenData(resp.data);
        }, (resp) => {
            //エラー発生時(400 BAD Requestの場合など)
            this.$log.error('Error status: ' + resp.status);
            if (resp.data && resp.data.message) {
                this.SharedService.addErrorMessage('Error ' + resp.status + ' ' + resp.data.message);
            } else {
                this.SharedService.addErrorMessage('Error ' + resp.status + ' Server Error!');
            }
        }, (evt) => {
            //const progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //this.$log.info(angular.toJson(evt));
            //this.$log.info('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });

    }

    /**
     * 分類器オブジェクトの配列から、分類器IDのみの配列を生成して返します。
     */
    modifyClassifiers(classifiers) {

        const objarray = [];

        Array.forEach(classifiers, (item) => {
            if (item && item.classifier_id && item.name) {
                const obj = {};
                obj.classifier_id = item.classifier_id;
                obj.name = item.name;
                objarray.push(obj);
            }
        });

        return objarray;

    }

    /**
     * アプリキャッシュから、現在選択状態にあるクラス分類器IDの情報を取得
     */
    getSelectedClassifiers() {

        const selectedClassifiers = this.SharedService.getApplicationAttribute(this.GlobalConstants.SELECTED_CLASSIFIERS);

        //ids が undefined または null かということを 「== null」でチェック(あえて=== nullにしない)
        if (selectedClassifiers == null || selectedClassifiers.length === 0) {
            return [];
        } else {
            //return ['Food_Processor', 'Cargo_Ship'];
            return selectedClassifiers;
        }
    }

    /**
     * データの階層化を解除し、ui-gridの二次元表データとしてレコードへ組み立て直す。
     */
    _flattenData(data) {

        const retArray = [];


        if (!data.images) {
            return retArray;
        }

        //imagesフィールドの配列をループ(outerloop)
        Array.forEach(data.images, (imageobj) => {
            //scoresフィールドの配列をループ(innerloop)
            if (imageobj.classifiers != null) {
                //2nd-loop
                Array.forEach(imageobj.classifiers, (classifier) => {

                  if(classifier.classes != null) {
                    //3rd-loop
                    Array.forEach(classifier.classes, (cls) => {
                      const d = {};
                      d.image = imageobj.image;
                      d.classifier_id = classifier.classifier_id;
                      d.classifier_name = classifier.name;
                      d.class_name = cls.class;
                      d.score = cls.score;
                      //結果データ配列にセット
                      retArray.push(d);
                    });
                  }
                });
            } else {
                const d = {};
                d.image = imageobj.image;
                d.classifier_id = 'n/a';
                d.name = 'n/a';
                d.score = '(under threthold)';
                retArray.push(d);
            }
        });

        //this.$log.debug('flattenedData : ' + angular.toJson(retArray));
        return retArray;
    }

}

WatsonVisualRecognitionImageClassificationController.$inject = ['$window', '$location', '$scope', '$log','$translate', 'uiGridConstants', 'Upload', 'GlobalConstants', 'SharedService', 'WatsonVisualRecognitionV3Service'];
