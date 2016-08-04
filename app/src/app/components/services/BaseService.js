import ServerResponse from '../commons/ServerResponse';

export default class BaseService {

  /**
   * コンストラクタ
   */
  constructor ($log, $translate, $location, $http, GlobalConstants) {
    this.$log = $log;
    this.$translate = $translate;
    this.$location = $location;
    this.$http = $http;
    this.GlobalConstants = GlobalConstants;
  }

  /**
   *
   */
  callApiService(method, fullApiUrl, sendData) {

    this.$log.debug("start to callApiService, fullApiUrl=" + fullApiUrl + ", sendData=" + angular.toJson(sendData));

    const httpCommand = {};

    httpCommand.method = method;
    httpCommand.cache = false;
    httpCommand.url = fullApiUrl;
    httpCommand.responseType = 'json';
    const methodUppercase = method.toUpperCase();
    if (methodUppercase === 'GET' ||  methodUppercase === 'DELETE' || methodUppercase === 'HEAD' ) {
      //GETまたはDELETEまたはHEADの場合はdataプロパティではなく、paramsプロパティにkey=valueオブジェクトをセットする
      //(クエリパラメータにする場合はparamsにセットするのが$httpの仕様)
      httpCommand.params = sendData;
    } else {
      //GETまたはDELETE以外の場合(=POST, PUT, PATCH想定)の場合は、dataプロパティにkey=valueオブジェクトをセット。
      httpCommand.data = sendData;
    }

    //実際に$httpサービスを使ってサーバー通信を実行。非同期的にPromiseでの結果を受け取り。
    const resultPromise = this.$http(httpCommand).then(
      //thenで一度チェーンさせている(結果データを加工し、ServerResponseを生成してそれを結果とするため)
      (resp) => {
        //resolve時、通常のServerResponseオブジェクトを結果データとしたPromiseを返す
        const response = this._createNormalServerResponse(resp);
        return response;
      },
      (resp) => {
        //reject時、HTTP応答エラーメッセージがセットされたServerResponseオブジェクトを結果データとしたPromiseを返す
        const response = this._createRejectedServerResponse(resp);
        return response;
      }
    );


    //Promiseオブジェクトを返す。
    //このPromiseは、$http()が返したPromiseではなく、.thenで一度チェーンさせた方のPromiseである
    //(結果データを加工し、ServerResponseオブジェクトを結果データとしてコントローラ側に返す構造にするため)
    return resultPromise;

  }

  /**
   * HTTPレスポンスが得られた場合で
   */
  _createNormalServerResponse(response) {

    const svrresp = new ServerResponse();

    angular.copy(response.data, svrresp);
    svrresp.httpStatus = response.status;

    return svrresp;
  }

  /**
   * HTTPレスポンスが得られなかった場合
   */
  _createRejectedServerResponse(response) {

    const svrresp = new ServerResponse();

    if (typeof(response.data) !== 'undefined' ) {
      angular.copy(response.data, svrresp);
    }

    svrresp.httpStatus = response.status;
    svrresp.result = this.GlobalConstants.RESULT_FALSE;

    return svrresp;

  }


}
