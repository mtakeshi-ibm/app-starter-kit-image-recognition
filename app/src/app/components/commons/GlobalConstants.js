/**
 * グローバル定数をインスタンスフィールドとして持つクラス
 */
class GlobalConstants {

    /**
     * コンストラクタ
     */
    constructor() {
        //
        //キャッシュされたクラス分類器の配列オブジェクトが格納されているキー文字列
        this.CASHED_CLASSIFIERS = "_CACHED_CLASSIFIERS_";

        //現在選択中のクラス分類器の配列を、appScopeに格納するキー名
        this.SELECTED_CLASSIFIERS = "_SELECTED_CLASSIFIERS_";

        this.TARGET_CLASS_TYPE_ALL = "ALL";

        this.TARGET_CLASS_TYPE_SPECIFIED = "SPECIFIED";

        //画像分類APIにおける、1つの画像ファイルサイズの制限(※単位はBytes.なお、これは分類器生成時の制限ではないことに注意)
        this.IMAGE_CLASSIFICATION_SIZE_LIMIT_PER_FILE = 2097152;

        //ラジオボタンで利用する値文字列
        this.UPLOAD_FILETYPE_ZIP = "ZIP";
        this.UPLOAD_FILETYPE_SEPARATED_FILE = "SEPARATED_FILE";

        this.POSITIVE = true;
        this.NEGATIVE = false;

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
