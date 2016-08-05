import GlobalConstants from './GlobalConstants';
import Message from './Message';

class ServerResponse {

    /**
     * コンストラクタ
     */
    constructor() {
        this.content = null;
        this.result = null;
        this.responseMessages = [];
        this.httpStatus = null;
        this.stackTraceString = null;
    }

    /**
     * サーバーAPI呼び出しの成否判定
     */
    isSuccess() {
        if (typeof(this.result) === 'undefined' || this.result == null) {
            return (200 <= this.httpStatus && this.httpStatus < 300) ? true : false;
        } else {
            // resultフィールドがある場合(つまり、サーバーAPIの応答)
            // resultフィールドの内容が、"success"(大文字小文字問わない)かどうかで判定する。
            return this.result.toUpperCase() === GlobalConstants.RESULT_SUCCESS.toUpperCase();
        }
    }

    /**
     * メッセージを追加します。
     */
    addMessage(level, message, detailMessage) {
      const msg = new Message(level, message, detailMessage);
      this.responseMessages.push(msg);
    }

    /**
     * 通知メッセージを追加します。
     */
    addInfoMessage(message, detailMessage) {
      this.addMessage('INFO', message, detailMessage);
    }

    /**
     * 警告メッセージを追加します。
     */
    addWarnMessage(message, detailMessage) {
      this.addMessage('WARN', message, detailMessage);
    }

    /**
     * エラーメッセージを追加します。
     */
    addErrorMessage(message, detailMessage) {
      this.addMessage('ERROR', message, detailMessage);
    }

    /**
     * 致命的メッセージを追加します。
     */
    addFatalMessage(message, detailMessage) {
      this.addMessage('FATAL', message, detailMessage);
    }
}

export default ServerResponse;
