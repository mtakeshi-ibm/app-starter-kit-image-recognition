'use strict';

/**
 * コントローラー: 画像分類画面
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

        //
        this.targetClassesType = this._configureTargetClassesType();

        //アップロードするファイル(配列) 初期値として空の配列をセット
        this.targetFile = [];
        this.threshold = 0.5; //default threshold.

        //判定対象Owner指定
        this.enableOwnerIBM = false;
        this.enableOwnerMe = true;

        //angularjs-sliderオブジェクト(確信度閾値指定用)
        this.$scope.sliderOptions = {
            floor: 0,
            ceil: 1,
            minLimit: 0,
            maxLimit: 1,
            precision: 3,
            step: 0.025,
            enforceStep: false,
            vertical: false,
            showTicks: true
        }

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
                //field: 'class_name',
                name: 'class_name',
                displayName: this.$translate.instant('label.text_109'),
                cellTemplate: `<div class="ui-grid-cell-contents">
                    <span uib-tooltip="{{row.entity.type_hierarchy}}">{{row.entity.class_name}}</span>
                    </div>`
            }, {
                field: 'score',
                displayName: this.$translate.instant('label.text_107'),
                cellClass: function(grid, row) {
                    var val = row.entity.score;
                    if (val < 0.5) {
                        return 'text-danger';
                    } else if (0.5 <= val && val < 0.7) {
                        return 'text-default';
                    } else if (0.7 <= val && val < 0.7) {
                        return 'text-primar';
                    } else if (0.7 <= val && val < 0.9) {
                        return 'text-info';
                    } else if (0.9 <= val) {
                        return 'text-success';
                    } else {
                        return 'text-default';
                    }
                },
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
        };



        //チャート設定
        $scope.chartOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 300,
                x: function(d) {
                    return d.label;
                },
                y: function(d) {
                    return d.value;
                },
                //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
                showControls: false,
                showValues: true,
                duration: 500,
                xAxis: {
                    showMaxMin: true
                },
                yAxis: {
                    axisLabel: 'Score (Confidence)',
                    tickFormat: function(d) {
                        return d3.format(',.2f')(d);
                    }
                },
                yDomain: [0, 1.0],
                valueFormat: this._valueFormatFunc()
            }
        };


        $scope.chartData = [];

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
        //this.$log.debug("upload method is called.")
        this.clearMessages();

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
                'ownerMe': this.enableOwnerMe
            }
        }).then((resp) => {

            if (resp.data.status === 'ERROR') {
                //エラー
                this.$log.error('failed to uploaded. Response: ' + angular.toJson(resp.data));

                //画面に失敗メッセージを表示
                this.SharedService.addErrorMessage($translate.instant('message.server_failure_with_status_and_message', {
                    status: resp.data.status,
                    message: resp.data.statusInfo
                }));
            } else {
                //成功：resolve時処理
                this.$log.info('Success uploaded. Response: ' + angular.toJson(resp.data));

                //画面に成功メッセージを表示
                this.SharedService.addInfoMessage(this.$translate.instant('message.server_success'));

                this.$scope.elapsedTime = resp.data.elapsedTime;
                //画面二次元表(テーブル)表示用に、二次元表に適したデータ構造へ組み替えしてセット
                this.$scope.gridOptions.data = this._flattenData(resp.data);

                //画面グラフ(棒グラフ)表示用に、オブジェクトデータ構造を生成してセット
                this.$scope.chartData = this._generateChartData(resp.data);
            }

        }, (resp) => {
            //失敗:reject時処理
            //エラー発生時(400 BAD Requestの場合など)
            this.$log.error('Error status: ' + resp.status);

            //結果一覧画面をクリア
            this.$scope.gridOptions.data = [];

            //画面にエラーメッセージを表示
            if (resp.data && resp.data.message) {
                this.SharedService.addErrorMessage(this.$translate.instant('message.server_failure_with_status_and_message', {
                    'status': resp.status,
                    'message': resp.data.message
                }));
            } else if (resp.data && resp.data.error.description) {
                this.SharedService.addErrorMessage(this.$translate.instant('message.server_failure_with_status_and_message', {
                    'status': resp.status,
                    'message': resp.data.error.description
                }));
            } else {
                this.SharedService.addErrorMessage(this.$translate.instant('message.server_failure_with_status', {
                    'status': resp.status
                }));
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

        angular.forEach(classifiers, (item) => {
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
        angular.forEach(data.images, (imageobj) => {
            //scoresフィールドの配列をループ(innerloop)
            if (imageobj.classifiers != null) {
                //2nd-loop
                angular.forEach(imageobj.classifiers, (classifier) => {

                    if (classifier.classes != null) {
                        //3rd-loop
                        angular.forEach(classifier.classes, (cls) => {
                            const d = {};
                            d.image = imageobj.image;
                            d.classifier_id = classifier.classifier_id;
                            d.classifier_name = classifier.name;
                            d.class_name = cls.class;
                            d.score = cls.score;
                            d.type_hierarchy = cls.type_hierarchy;
                            //結果データ配列にセット
                            retArray.push(d);
                        });
                    }
                });
            } else {
                const d = {};
                d.image = imageobj.image;
                if (imageobj.error) {
                    //エラーの場合は、分類器ID列に、「エラー」との文字を表示
                    d.classifier_id = imageobj.error.error_id;
                    //エラーの場合は、分類器名列に、エラー
                    d.classifier_name = imageobj.error.description;
                    d.class_name = '';
                    d.score = '';
                } else {
                    d.classifier_id = 'n/a';
                    d.classifier_name = 'n/a';
                    d.class_name = '';
                    d.score = '';
                }

                retArray.push(d);
            }
        });

        //this.$log.debug('flattenedData : ' + angular.toJson(retArray));
        return retArray;
    }

    /**
     * チャートデータ(配列)を生成して返します。NVD3の type: 'multiBarHorizontalChart' のチャート仕様に基づく、
     * dataオブジェクト(配列)を返します。$scope.chartOptionsと整合性を持ったデータを返す必要があります。
     */
    _generateChartData(data) {

        const retArray = [];

        if (!data.images) {
            return retArray;
        }

        //1.まず、系列(Series)オブジェクトを作る
        // key に、シリーズ名文字列。値は、シリーズオブジェクトの文字列
        const container = {};
        // シリーズ名として、クラス名を用いる必要がある。
        //imagesフィールドの配列をループ(outerloop)


        //imagesフィールドの配列をループ(outerloop)
        angular.forEach(data.images, (imageobj) => {
            //scoresフィールドの配列をループ(innerloop)
            if (imageobj.classifiers != null) {

                //2nd-loop
                angular.forEach(imageobj.classifiers, (classifier) => {

                    if (classifier.classes != null) {
                        //3rd-loop
                        angular.forEach(classifier.classes, (cls) => {
                            //クラス名が得られる。
                            const clsname = cls.class;

                            if (clsname) {

                                if (!container[clsname]) {
                                    //まだcontainerに系列名となるそのクラス名をキーとしたオブジェクトがセットされていないなら、まず箱を作る
                                    //まだcontainerにこのクラス名がなければそのクラス名をキーに、値として空のオブジェクトをセット
                                    const tmp = {
                                        'key': clsname, //シリーズ名をセット
                                        'values': [] // 初期配列をセット
                                    };
                                    container[clsname] = tmp;
                                }

                                //既にコンテナにクラス名のキーがある場合
                                container[clsname].values.push({
                                    "label": imageobj.image, //ファイル名
                                    "value": cls.score
                                });
                            }
                        });
                    }
                });
            }
        });

        //containersオブジェクトの中身をループして、最終的なchartDataの値としてセット
        Object.keys(container).forEach((key) => {
            retArray.push(container[key]);
        });

        //高さの調整
        this.$scope.chartOptions.chart.height = retArray.length * 150;

        return retArray;
    }

    /**
     *
     */
    _valueFormatFunc() {
        //const format = d3.format(',.8f');
        return (d) => {
            //return format(d);
            return d + '';
        };
    }


    /**
     * アプリセッションデータとして、値が入っているかどうかを元に、this.targetClassesTypeにセットする定数を決定して返す
     */
    _configureTargetClassesType() {

        const selectedClasses = this.getSelectedClassifiers();

        if (selectedClasses.length > 0) {
            return this.GlobalConstants.TARGET_CLASS_TYPE_SPECIFIED;
        } else {
            return this.GlobalConstants.TARGET_CLASS_TYPE_ALL;
        }
    }

}

WatsonVisualRecognitionImageClassificationController.$inject = ['$window', '$location', '$scope', '$log', '$translate', 'uiGridConstants', 'Upload', 'GlobalConstants', 'SharedService', 'WatsonVisualRecognitionV3Service'];
