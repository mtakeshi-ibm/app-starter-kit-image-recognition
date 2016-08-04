/**
 * AppConfigクラス
 */
class AppConfig {

  /**
   * コンストラクタ
   */
  constructor($logProvider, $locationProvider,$translateProvider) {

    //ログプロバイダー設定
    $logProvider.debugEnabled(true);
    //$logProvider.debugEnabled(false);

    //ロケーションプロバイダー設定 (html5モード利用を有効化)
    $locationProvider.html5Mode(
      {
        enabled: true,
        requireBase: false
      }
    );

    $translateProvider.useStaticFilesLoader({
      prefix : 'translate/lang_',
      suffix : '.json'
    });
    //translate設定 (自作のstaticメソッドで、ブラウザの優先言語の先頭2文字を取得してセット)
    $translateProvider.preferredLanguage(AppConfig.findPreferredLanguage());
    $translateProvider.fallbackLanguage('en');
    $translateProvider.useMissingTranslationHandlerLog();
    $translateProvider.useSanitizeValueStrategy(null);

    //$httpProvider.interceptors.push('HttpSpinInterceptor');
    //$modalProvider.options.animation = false;
  }

  /**
   * ブラウザの言語環境を元に、優先言語を決定して2文字で返す
   */
  static findPreferredLanguage(){
    try {
      return (navigator.browserLanguage || navigator.language || navigator.userLanguage).substr(0, 2)
    } catch(e){
      return "en";
    }
  }

  /**
   * インジェクション用クラスstaticのactivateメソッド
   */
  static activate($logProvider, $locationProvider, $translateProvider) {
    AppConfig.instance = new AppConfig($logProvider, $locationProvider,$translateProvider);
    return AppConfig.instance;
  }
}

//下記は、AppConfig.$inject = ... にするとng-strict-diでエラーになるので注意
AppConfig.activate.$inject = ['$logProvider', '$locationProvider','$translateProvider'];

//クラスをエクスポート
export default AppConfig;
