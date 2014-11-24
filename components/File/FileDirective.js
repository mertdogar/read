read.directive('file', function($rootScope) {
    function link(scope, $element, attrs) {
        var scrollable = $element[0].querySelector('main');


        scope.host = scope.options.host || '127.0.0.1';
        scope.port = scope.options.port || 22;
        scope.username = scope.options.username;
        scope.password = scope.options.password;
        scope.filename = scope.options.filename;
        scope.maxLines = scope.options.maxLines || 250;

        scope.id = scope.username + '@' + scope.host + ':' +
            scope.port + ':' + scope.filename;
        scope.query = localStorage[scope.id] ? localStorage[scope.id] : '';
        console.log(scope.id);
        scope.init()

        scope.$on('$destroy', function() {
            console.log('Closing ' + scope.id);
            localStorage[scope.id] = scope.query;
            scope.connection.end();
        });

        function toBottom_ () {
            if (!scope.stayAtBottom) return;
            scrollable.scrollTop = scrollable.scrollHeight;
        };

        scope.toBottom = throttle(toBottom_, 500,this);

        function throttle(fn, threshold, scope) {
            threshold || (threshold = 250);
            var last,
                deferTimer;

            return function() {
                var context = scope || this;
                var now = +new Date,
                    args = arguments;

                if (last && now < last + threshold) {
                    // hold on to it
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args);
                    }, threshold);
                } else {
                    last = now;
                    fn.apply(context, args);
                }
            };
        }
    };

    return {
        restrict: 'E',
        scope: {
            options: '='
        },
        templateUrl: 'components/File/File.html',
        controller: 'FileController',
        link: link
    };
});
