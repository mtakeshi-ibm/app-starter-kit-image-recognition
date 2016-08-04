/**
 * グローバル定数をインスタンスフィールドとして持つクラス
 */
class GlobalConstants {

    /**
     * コンストラクタ
     */
    constructor() {
        //
        this.SAMPLE_PREDICTIVE_DATA_STRUCTURE_INCOME_LEVELS = ["Low", "Medium", "High"];
        this.SAMPLE_PREDICTIVE_DATA_STRUCTURE_NUM_OF_CREDIT_CARDS_LEVELS = ["Less than 5", "5 or more"];
        this.SAMPLE_PREDICTIVE_DATA_STRUCTURE_EDUCATION_LEVELS = ["College", "High school"];
        this.SAMPLE_PREDICTIVE_DATA_STRUCTURE_CAR_LOANS_LEVELS = ["None or 1", "More than 2"];

        this.SAMPLE_PREDICTIVE_CREDIT_RATING_RESULT_KEY_NAME = "$R-Credit rating";
        this.SAMPLE_PREDICTIVE_CREDIT_RATING_RESULT_CONFIDENCE_KEY_NAME = "$RC-Credit rating";

    }

    /**
     * strict DI対応
     */
    static activate() {
        GlobalConstants.instance = new GlobalConstants();
        return GlobalConstants.instance;
    }
}

// インジェクション用$injectプロパティへの設定(インジェクション対象なし)
GlobalConstants.activate.$inject = [];

// static定数としてのセット(staticキーワードを用いたクラス変数はES6では定義されていない。TypeScriptでは可能)
GlobalConstants.RESULT_SUCCESS = 'success';
GlobalConstants.RESULT_FALSE = 'false';

// クラスをエクスポート(export default class GlobalConstants { ...} としても良い)
export default GlobalConstants;
