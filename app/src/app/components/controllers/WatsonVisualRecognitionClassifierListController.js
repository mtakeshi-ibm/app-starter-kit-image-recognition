'use strict';

/**
 * コントローラ：分類器一覧表示画面
 */
export class WatsonVisualRecognitionClassifierListController {

    /**
     * コンストラクタ
     */
    constructor($window, $location, $scope, $log, $translate, ngToast, uiGridConstants, GlobalConstants, SharedService, ModalService, WatsonVisualRecognitionV3Service) {
        'ngInject';

        this.$scope = $scope;
        this.$log = $log;
        this.$translate = $translate;
        this.ngToast = ngToast;
        this.GlobalConstants = GlobalConstants;

        this.SharedService = SharedService;
        this.ModalService = ModalService;

        this.WatsonVisualRecognitionV3Service = WatsonVisualRecognitionV3Service;
        this.uiGridConstants = uiGridConstants;

        this.$scope.classifiers = [];

        //this.$log.debug("constructor of Class WatsonVisualRecognitionClassifierListController is called.");

        //アプリセッション領域から、キャッシュ情報を取得(前にセットしている用)
        this.cachedClassifiers = SharedService.getApplicationAttribute(this.GlobalConstants.CASHED_CLASSIFIERS);
        if (!this.cachedClassifiers) {
          //アプリセッション領域の値が未セット(空の配列すらない)場合は、APIを呼び出す
          this.listClassifiers();
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
                //field: 'classes',
                name: 'Classes',
                displayName: this.$translate.instant('label.text_102'),
                cellTemplate: `<div class="ui-grid-cell-contents" style="text-align:left;"><ul style="margin-left: 0;padding-left: 0;"><li ng-repeat="cls in row.entity.classes">{{cls.class}}</li></ul></div>"`
            }, {
                field: 'status',
                displayName: this.$translate.instant('label.text_103'),
                cellTemplate: `<div class="ui-grid-cell-contents" style="text-align:center;">
                <span uib-tooltip="{{row.entity.explanation}}">{{row.entity.status}}</span>
                </div>`,
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

        //チャート構造オプション
        this.$scope.chartOptions = {
            chart: {
                type: 'pieChart',
                labelType: 'percent',
                donut: true,
                donutRatio: 0.35,
                labelsOutside: false,
                height: 400,
                x: function(d) {
                    return d.key;
                },
                y: function(d) {
                    return d.y;
                },
                showLabels: true,
                duration: 500,
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            },
            title: {
                enable: true,
                text: this.$translate.instant('label.text_028')
            },
            // subtitle : {
            //   enable : true,
            //   html : 'subtitle',
            //   css : {
            //     'text-align' : 'center',
            //     'margin' : '10px 13px 0px 7px'
            //   }
            // }
        };

        //チャート表示データ
        this.$scope.chartData = this._createChartData(this.cachedClassifiers);

        //削除関数
        $scope.deleteClassifier = (classifier) => {

            //メッセージクリア
            this.clearMessages();

            this.$log.debug("deleteClassifier=" + angular.toJson(classifier));

            //ダイアログ表示
            const modalInstance = this.ModalService.openModal({
                //size: 'lg',
            }, {
                modalHeader: this.$translate.instant('dialog_title.confirmation'),
                modalBody: this.$translate.instant("message.text_017", {
                    "name": classifier.classifier_id
                }),
                okFunc: (param) => {
                    //this.$log.debug("OKがモーダルウィンドウでクリックされたことを、呼び出し元コールバック関数で検知しました。");
                },
                cancelFunc: (param) => {
                    //this.$log.debug("Cancelがモーダルウィンドウでクリックされたことを、呼び出し元コールバック関数で検知しました。");
                }
            });

            // ダイアログのOK・Cancelボタンの押下結果を基に動作
            modalInstance.result.then(
                (modalCallbackedParam) => {
                    //確認ダイアログでCanelボタンがクリックされた場合
                    // サービスの分類器削除API呼び出し
                    const responsePromise = this.WatsonVisualRecognitionV3Service.deleteClassifier(classifier);

                    responsePromise.then((respdata) => {

                        //画面に成功メッセージを表示
                        this.SharedService.addInfoMessage(this.$translate.instant('message.server_success'));
                        //this.$log.debug(angular.toJson(respdata.data));
                        this.ngToast.create({
                            className: 'info',
                            content: this.$translate.instant('message.text_014', {
                                classifier_id: classifier.classifier_id
                            })
                        });

                        //現在のリストを更新
                        this.listClassifiers();

                    }, (respdata) => { //this.$log.debug(angular.toJson(respdata));
                        this.ngToast.create({
                            className: 'error',
                            content: this.$translate.instant('message.text_015', {
                                classifier_id: classifier.classifier_id
                            })
                        });
                    }).catch((respdata) => {
                        //do nothing.
                    }).finally(() => {
                        //this.$log.debug("service called and finally.");
                    });

                }, (modalCallbackedParam) => {
                    //確認ダイアログでCanelボタンがクリックされた場合
                    //this.$log.debug("Modal's dismiss is called, modalCallbackedParam=" + angular.toJson(modalCallbackedParam));
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
            if (selectedRow.status === 'ready' || selectedRow.status === 'retraining') {
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

        //「選択済みの分類器」の設定をクリア
        this._clearSelectedClassifier();

        //this.SharedService.addFatalMessage('Hello, Fatal!', null);

        // API呼び出し
        const responsePromise = this.WatsonVisualRecognitionV3Service.listClassifiers();

        responsePromise.then((respdata) => {

            if (respdata.data.status === 'ERROR') {
                //エラー
                this.$log.error('failed to retrieve list of classifiers. Response: ' + angular.toJson(respdata.data));

                //画面に失敗メッセージを表示
                this.SharedService.addErrorMessage($translate.instant('message.server_failure_with_status_and_message', {
                    status: respdata.data.status,
                    message: respdata.data.statusInfo
                }));
            } else {
                //画面に成功メッセージを表示
                this.SharedService.addInfoMessage(this.$translate.instant('message.server_success'));

                //チャートデータを更新
                this._updateCachedClassifiers(respdata.data.classifiers);

                //
                if (respdata.data !== null && (WatsonVisualRecognitionClassifierListController.isType('Array', respdata.data.classifiers) && respdata.data.classifiers.length === 0)) {
                    this.SharedService.addWarnMessage('No Classifiers.');
                }
            }

        }).catch((resp) => {
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
        }).finally(() => {
            //this.$log.debug("service called and finally.");
        });

    }

    /**
     * キャッシュ済み分類器のリストを更新します。
     */
    _updateCachedClassifiers(cachedClassifiers) {
        //応答オブジェクトの構造は、$httpサービスで決めされている。dataプロパティがレスポンスボディ。
        this.$scope.classifiers = cachedClassifiers;

        this.$scope.gridOptions.data = cachedClassifiers;
        //データをキャッシュ
        this.cachedClassifiers = cachedClassifiers;

        this.$scope.chartData = this._createChartData(cachedClassifiers);

        //アプリセッションにセット
        this.SharedService.setApplicationAttribute(this.GlobalConstants.CASHED_CLASSIFIERS, cachedClassifiers);

    }

    /**
     * 現在の「選択済みの分類器」をクリアします。
     */
    _clearSelectedClassifier() {

        if (this.selectedClassifiers && this.selectedClassifiers.length > 0) {
            //Toastメッセージ表示
            this.ngToast.create({
                className: 'warning',
                content: this.$translate.instant('message.text_016')
            });
        }
        this.selectedClassifiers = [];
        this.SharedService.setApplicationAttribute(this.GlobalConstants.SELECTED_CLASSIFIERS, []);
    }

    /**
     * パイチャートデータを生成します。
     */
    _createChartData(cachedClassifiers) {
        if (!cachedClassifiers || cachedClassifiers.length === 0) {
            return [];
        }

        const array = [];
        let numOfReady = 0;
        let numOfFailed = 0;
        let numOfTraining = 0;
        let numOfRetraining = 0;

        //status別に数を計測して
        cachedClassifiers.forEach((value) => {
            const status = value.status;
            switch (status) {
                case 'ready':
                    ++numOfReady;
                    break;
                case 'training':
                    ++numOfTraining;
                    break;
                case 'retraining':
                    ++numOfRetraining;
                    break;
                case 'failed':
                    ++numOfFailed;
                    break;
                default:
                    break;
            }
        });

        //ready件数パイチャートデータセット
        array.push({
            key: 'ready',
            y: numOfReady
        });

        //training件数パイチャートデータセット
        array.push({
            key: 'training',
            y: numOfTraining
        });

        //retraining件数パイチャートデータセット
        array.push({
            key: 'retraining',
            y: numOfRetraining
        });

        //failed件数パイチャートデータセット
        array.push({
            key: 'failed',
            y: numOfFailed
        });

        return array;
    }

    /**
     * 第2引数が、第1引数の指定文字列のタイプかどうかを判定するユーティリティメソッド
     */
    static isType(type, obj) {
        const clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
}

WatsonVisualRecognitionClassifierListController.$inject = ['$window', '$location', '$scope', '$log', '$translate', 'ngToast', 'uiGridConstants', 'GlobalConstants', 'SharedService', 'ModalService', 'WatsonVisualRecognitionV3Service'];
