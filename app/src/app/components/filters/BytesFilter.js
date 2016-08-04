import angular from 'angular';

export default class ByteFilter {

    constructor() {

        //フィルタ処理を行う関数オブジェクトを返す
        return (bytes, precision) => {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
                return '-';
            }
            if (angular.isUndefined(precision)) {
                precision = 1;
            }
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
            var num = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(num))).toFixed(precision) + ' ' + units[num];
        }

    }

    /**
     * strict DI対応
     */
    static activate() {
        ByteFilter.instance = new ByteFilter();
        return ByteFilter.instance;
    }
}

ByteFilter.activate.$inject = [];
