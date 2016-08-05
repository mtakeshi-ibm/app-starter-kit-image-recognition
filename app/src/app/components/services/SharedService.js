import Message from '../commons/Message';

/**
 * 共有サービスを提供するクラス
 */
class SharedService {

  /**
   * コンストラクタ
   */
  constructor($log, GlobalConstants) {
    'ngInject';
    this.GlobalConstants = GlobalConstants;
    this.messages = [];
    this.$log = $log;
    this.appScope = {};
  }

  /**
   * メッセージをセットします。
   */
  setMessages(messages) {
    if (messages && messages.length > 0) {
      this.messages = messages;
    }
  }

  /**
   * 致命的レベルのメッセージを追加します。
   */
  addFatalMessage(summaryMessage, detailMessage) {
    this.addMessage('FATAL', summaryMessage, detailMessage);
  }

  /**
   * エラーレベルのメッセージを追加します。
   */
  addErrorMessage(summaryMessage, detailMessage) {
    this.addMessage('ERROR', summaryMessage, detailMessage);
  }

  /**
   * 警告レベルのメッセージを追加します。
   */
  addWarnMessage(summaryMessage, detailMessage) {
    this.addMessage('WARN', summaryMessage, detailMessage);
  }

  /**
   * 情報レベルのメッセージを追加します。
   */
  addInfoMessage(summaryMessage, detailMessage) {
    this.addMessage('INFO', summaryMessage, detailMessage);
  }

  /**
   * メッセージを追加します。
   */
  addMessage(level, summaryMessage, detailMessage) {
    const msg = new Message(level, summaryMessage, detailMessage);
    this.messages.push(msg);
  }

  /**
   * メッセージを全てクリアします。
   */
  clearMessages() {
    if (this.messages) {
      this.messages.length = 0;
    }
  }

  /**
   * アプリケーションスコープからデータを取得します。
   */
  getApplicationAttribute(name){

    return this.appScope[name];
  }

  /**
   * アプリケーションスコープにデータをセットします。
   */
  setApplicationAttribute(name, value) {
    if (!name) {
      return;
    }

    this.appScope[name] = value;
  }

  /**
   * アプリケーションスコープからデータを除去します。
   */
  removeApplicationAttribute(name) {
    if (!name && this.appScope.hasOwnProperty(name)) {
      delete this.appScope[name];
    }
  }

  static activate($log, GlobalConstants) {
    SharedService.instance = new SharedService($log, GlobalConstants);
    return SharedService.instance;
  }
}

SharedService.activate.$inject = ['$log', 'GlobalConstants'];
export default SharedService;
