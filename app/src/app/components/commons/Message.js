/**
 * 画面表示メッセージを表現するクラス
 */
export default class Message {

  /**
   * コンストラクタ
   */
  constructor (level, summaryMessage, detailMessage) {
    this.level = level;
    this.summaryMessage = summaryMessage;
    this.detailMessage = detailMessage;
    this.targetId = null;
  }

}
