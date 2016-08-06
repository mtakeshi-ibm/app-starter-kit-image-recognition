'use strict';

/**
 * Controller:
 */
export class WatsonVisualRecognitionClassifierListController {

    /**
     * コンストラクタ
     */
    constructor($window, $location, $scope, $log, $translate, ngToast, uiGridConstants, GlobalConstants, SharedService, WatsonVisualRecognitionV3Service) {
        'ngInject';

        this.$scope = $scope;
        this.$log = $log;
        this.$translate = $translate;
        this.ngToast = ngToast;
        this.GlobalConstants = GlobalConstants;

        this.SharedService = SharedService;
        this.WatsonVisualRecognitionV3Service = WatsonVisualRecognitionV3Service;
        this.uiGridConstants = uiGridConstants;

        this.$scope.classifiers = [];

        //this.$log.debug("constructor of Class WatsonVisualRecognitionClassifierListController is called.");

        //アプリセッション領域から、キャッシュ情報を取得(前にセットしている用)
        this.cachedClassifiers = SharedService.getApplicationAttribute(this.GlobalConstants.CASHED_CLASSIFIERS);
        if (!this.cachedClassifiers || this.cachedClassifiers.length === 0) {
            //空の配列をセット
            this.cachedClassifiers = [];
        }

        //アプリセッション領域から、現在選択状態のクラス分類ID(配列)をセット
        this.selectedClassifiers = SharedService.getApplicationAttribute(this.GlobalConstants.SELECTED_CLASSIFIERS);
        if (!this.selectedClassifiers || this.selectedClassifiers === 0) {
            //空の配列をセット
            this.selectedClassifiers = [];
        }

        //ui-grid表設定オブジェクト
        this.$scope.gridOptions = {
            data: this.cachedClassifiers,
            rowHeight: 44,
            columnDefs: [{
                field: 'name',
                displayName: this.$translate.instant('label.text_100'),
                sort: {
                    priority: 0,
                    direction: 'asc'
                }
            }, {
                field: 'classifier_id',
                displayName: this.$translate.instant('label.text_101')
            }, {
                field: 'classes',
                displayName: this.$translate.instant('label.text_102')
            }, {
                field: 'status',
                displayName: this.$translate.instant('label.text_103'),
                cellClass: function(grid, row) {
                    if (row.entity.status === 'failed') {
                        return 'text-danger';
                    } else if (row.entity.status === 'training') {
                        return 'text-info';
                    } else if (row.entity.status === 'ready' || row.entity.status === 'retraining') {
                        return 'text-primary';
                    } else {
                        return 'text-default';
                    }
                }
            }, {
                field: 'created',
                displayName: this.$translate.instant('label.text_104'),
                cellFilter: 'date: "yyyy/MM/dd HH:mm:ss"'
            }, {
                field: 'owner',
                displayName: this.$translate.instant('label.text_108')
            }, {
                name: 'Delete',
                displayName: this.$translate.instant('label.text_105'),
                cellTemplate: `<div class="ui-grid-cell-contents" style="text-align:center;">
                <button type="button"
                 class="btn btn-danger btn-sm" data-container="body"
                 data-toggle="popover"
                 data-placement="center"
                 ng-disabled="row.entity.owner === \'IBM\'"
                 ng-click="grid.appScope.deleteClassifier(row.entity)"><span translate="label.text_105"></span></button>
                 </div>`,
                //cellTemplate: '<div class="ui-grid-cell-contents"><button type="button" class="btn btn-danger btn-sm" data-container="body" data-toggle="popover" data-placement="center" ng-click="grid.appScope.deleteClassifier(row.entity)">Delete</button></div>',
                enableFiltering: false
            }],
            //行選択機能をON
            enableRowSelection: true,
            enableSelectAll: true,
            //全行選択機能をOFF (行のどこでもクリックしたら選択状態になるようにはしない)
            enableFullRowSelection: false,
            //チェックボックスのみでの行選択可能をON
            selectWithCheckboxOnly: true,
            //複数行選択可能をON
            multiSelect: true,

            onRegisterApi: (gridApi) => {
                //ui-gridの内部APIである gridApiオブジェクトを$scopeに、同じ名前(gridApi)のメンバとして生やす
                this.$scope.gridApi = gridApi;
                //単一行選択変更時のコールバック
                this.$scope.gridApi.selection.on.rowSelectionChanged($scope, (row) => {
                    //console.log('rowSelectionChanged is called! row = ' + row);
                    const currentSelectedRows = $scope.gridApi.selection.getSelectedRows();
                    this.updateSelectedClassifiers(currentSelectedRows);
                });
                //複数行選択変更時のコールバック
                this.$scope.gridApi.selection.on.rowSelectionChangedBatch($scope, (rows) => {
                    //const msg = 'rows changed ' + rows.length;
                    //console.log(msg);
                    const currentSelectedRows = $scope.gridApi.selection.getSelectedRows();
                    this.updateSelectedClassifiers(currentSelectedRows);

                });
            },

            //以下、表全体設定
            showGridFooter: true,
            enableGridMenu: true,
            exporterCsvFilename: 'classifiers.txt',
            exporterCsvColumnSeparator: '\t',
            exporterMenuPdf: false,
            enableFiltering: true,
            enableColumnResizing: true,
            enablePaginationControls: true,
            paginationPageSize: 100,
            paginationPageSizes: [100, 200, 300, 500, 1000]
        };

        //削除関数
        $scope.deleteClassifier = (classifier) => {

            //メッセージクリア
            this.clearMessages();

            this.$log.info("deleteClassifier=" + angular.toJson(classifier));

            // API呼び出し
            const responsePromise = this.WatsonVisualRecognitionV3Service.deleteClassifier(classifier);

            responsePromise.then((respdata) => {
                this.$log.info(angular.toJson(respdata.data));
                this.SharedService.addInfoMessage('Classifier ' + classifier.name + '(Classifier ID=' + classifier.classifier_id + ') is deleted successfully.', null);

                //現在のリストを更新
                this.listClassifiers();

            }).catch((respdata) => {
                //this.$log.debug(angular.toJson(respdata));
                this.SharedService.addFatalMessage('Error. Failed to delete classifier : ' + classifier.name + '(Classifier ID=' + classifier.classifier_id + ')', null);
            }).finally(() => {
                //this.$log.debug("service called and finally.");

            });

        };

        //clean Messages
        this.SharedService.clearMessages();
    }

    /**
     * メッセージをクリア
     */
    clearMessages() {
        this.SharedService.clearMessages();
    }

    /**
     * 現在選択されているクラス分類器IDを更新する
     */
    updateSelectedClassifiers(selectedRows) {

        //選択行データの配列から、選択されたクラス分類器IDの配列を生成してセットする。
        const newSelectedClassifiers = [];
        for (var i = 0, n = selectedRows.length; i < n; i++) {
            let selectedRow = selectedRows[i];
            //状態がreadyまたはretrainingの場合にのみ、選択状態のものに組み込む
            if (selectedRow.status === 'ready' || selectedRow.status === 'retraining' ) {
                newSelectedClassifiers.push(angular.copy(selectedRows[i]));
            } else {
                this.ngToast.create({
                    className: 'warning',
                    content: this.$translate.instant('message.text_013')
                });
            }
        }

        //this.selectedClassifiers.length = 0; //clear array
        this.selectedClassifiers = newSelectedClassifiers;
        //アプリケーションキャッシュ側のデータも更新する。
        this.SharedService.setApplicationAttribute(this.GlobalConstants.SELECTED_CLASSIFIERS, newSelectedClassifiers);
    }

    /**
     * List All Classifiers
     */
    listClassifiers() {
        //メッセージクリア
        this.clearMessages();

        //this.SharedService.addFatalMessage('Hello, Fatal!', null);

        // API呼び出し
        const responsePromise = this.WatsonVisualRecognitionV3Service.listClassifiers();

        responsePromise.then((respdata) => {
            //this.$log.debug('レスポンスデータの数=' + respdata.data.classifiers.length);
            //応答オブジェクトの構造は、$httpサービスで決めされている。dataプロパティがレスポンスボディ。
            //this.$scope.classifiers = respdata.data.classifiers;
            this.$scope.gridOptions.data = this._modifyReceivedData(respdata.data.classifiers);
            //データをキャッシュ
            this.cachedClassifiers = respdata.data.classifers;

            //アプリセッションにセット(_modifyReceivedDataで処理したあとのデータをセットする)
            this.SharedService.setApplicationAttribute(this.GlobalConstants.CASHED_CLASSIFIERS, this.$scope.gridOptions.data);
            //
            if (respdata.data !== null && (WatsonVisualRecognitionClassifierListController.isType('Array', respdata.data.classifiers) && respdata.data.classifiers.length === 0)) {
                this.SharedService.addWarnMessage('No Classifiers.');
            }

        }).catch((respdata) => {
            //this.$log.debug(angular.toJson(respdata));
            this.SharedService.addFatalMessage('Server Error!' + (respdata ? angular.toJson(respdata) : ""), null);
        }).finally(() => {
            //this.$log.debug("service called and finally.");
        });

    }

    /**
     * 受信データを、ui-gridでの表示に合うように組み替え
     */
    _modifyReceivedData(classifiers) {

        const records = [];


        classifiers.forEach((classifier) => {

            const record = {};
            record.classifier_id = classifier.classifier_id;
            record.name = classifier.name;
            record.owner = classifier.owner;
            record.status = classifier.status;
            record.created = classifier.created;

            let classes = "";
            //inner loop
            classifier.classes.forEach((cls) => {
                classes += cls.class + ", ";
            });

            //最後の部分の", ""を除去
            if (classes.length >= 2) {
                classes = classes.slice(0, classes.length - 2);
            }
            record.classes = classes;

            records.push(record);
        });

        return records;

    }

    /**
     *
     */
    static isType(type, obj) {
        const clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
}

WatsonVisualRecognitionClassifierListController.$inject = ['$window', '$location', '$scope', '$log', '$translate', 'ngToast', 'uiGridConstants', 'GlobalConstants', 'SharedService', 'WatsonVisualRecognitionV3Service'];
