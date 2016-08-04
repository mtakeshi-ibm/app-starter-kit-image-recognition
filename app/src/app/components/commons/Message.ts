/**
 * 画面表示メッセージを表現するクラス
 */
export default class Message {

  public level:string;
  public summaryMessage:string;
  public detailMessage:string;
  public targetId:string;

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
