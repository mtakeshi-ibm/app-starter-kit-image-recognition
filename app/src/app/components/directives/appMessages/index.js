/**
 * <app-messages> ディレクティブ。SharedService内のmessages情報を元に表示
 */
const AppMessagesDirective = function(SharedService) {
  //return Directive Definition Object.
  return {
    restrict : 'E',
    template: require('./template.html'),
    scope : true,
    link : function(scope, elements, attr) {
      //共通サービスであるところの SharedServiceを、ディレクティブのスコープとして生やす
      scope.SharedService = SharedService;
    }
  };
}

AppMessagesDirective.$inject = ['SharedService'];
export default AppMessagesDirective;
