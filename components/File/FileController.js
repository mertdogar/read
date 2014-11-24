read.controller('FileController', function($scope, $rootScope, SSHService, $timeout) {
    var residual = '';
    $scope.infoType = true;
    $scope.connected = false;
    $scope.skimming = false;
    $scope.stayAtBottom = true;
    $scope.lines = [];

    $scope.init = function() {
        $scope.infoMessageText = 'Connecting...';
        $scope.connection = SSHService.tail(
            $scope.host,
            $scope.port,
            $scope.username,
            $scope.password,
            $scope.filename,
            $scope.maxLines,
            function(data) {
                var element = {
                    data: data.toString()
                };
                var content = residual + data.toString();
                var parsedContent = content.match(/[^\r\n]+/g);

                if (parsedContent.length > 1)
                    residual = parsedContent.splice(parsedContent.length - 1, 1)[0];
                else
                    residual = '';


                var bucket = parsedContent.map(function(line) {
                    return {
                        data: line
                    };
                });

                $scope.lines = $scope.lines.concat(bucket);

                var extraLines = $scope.lines.length - $scope.maxLines;
                if (extraLines > 0) {
                    var toBeDeletedLines = $scope.lines.slice(0, extraLines);
                    $scope.lines = $scope.lines.slice(extraLines, $scope.maxLines);
                }

                var filtered = execute($scope.pipe, bucket);

                if (toBeDeletedLines) {
                    var numOfDeletedFilteredLines = execute($scope.pipe, toBeDeletedLines).length;

                    if (numOfDeletedFilteredLines > 0)
                        $scope.filtered = $scope.filtered.slice(numOfDeletedFilteredLines, $scope.filtered.length - numOfDeletedFilteredLines);
                }

                $scope.filtered = $scope.filtered.concat(filtered);

                $scope.$digest();
                $scope.toBottom();
            },
            function(errData) {
                console.log('Err: ' + errData);
            },
            function(type, code, signal) {
                console.log(type, code, signal);

                if (type == 'ready') {
                    $scope.connected = true;
                } else if (type == 'close') {
                    $scope.connected = false;
                } else if (type == 'exit') {
                    $scope.connected = false;
                }
                $scope.$digest();

            });
    };

    function doMatch(input, filter) {
        var match = filter.match(new RegExp('^/(.*?)/([gimy]*)$'));

        if (!match || match.length < 2)
            return input.indexOf(filter) != -1;

        var regex = new RegExp(match[1], match[2]);
        return input.match(regex);
    };

    function execute(pipe, opt_base) {
        var filtered = opt_base || $scope.lines;

        if (pipe.filter) {
            filtered = filtered.filter(function(line) {
                delete line.marker;
                return doMatch(line.data, pipe.filter);
            });
        }

        if (pipe.marker) {
            var markers;
            if (!(pipe.marker instanceof Array)) {
                markers = [pipe.marker];
            } else {
                markers = pipe.marker;
            }

            markers.forEach(function(marker) {
                if (!marker.filter) return console.log('Err: Marker filter not found');
                if (!marker.color) return console.log('Err: Marker color not found');

                filtered.forEach(function(item) {
                    if (doMatch(item.data, marker.filter))
                        item.marker = marker.color;
                });
            });

        }

        return filtered;
    }

    function applyProcessed(filtered) {
        $scope.filtered = filtered;
        $scope.toBottom();
    }

    $scope.mouseDown = function($event) {
        if ($event.button != 2) return;
        console.log($event);
        $event.preventDefault();
        menu.popup($event.pageX, $event.pageY);
    };

    $scope.clearView = function() {
        $scope.lines = [];
        $scope.filtered = $scope.lines;
    };

    $scope.getInfo = function() {
        if ($scope.infoType) {
            if ($scope.filtered.length == $scope.lines.length) {
                return $scope.lines.length;
            } else {
                return Math.ceil(($scope.filtered.length / $scope.lines.length) * 100) + '%';
            }
        } else {
            if ($scope.filtered.length == $scope.lines.length) {
                return $scope.lines.length;
            } else {
                return $scope.filtered.length + '/' + $scope.lines.length;
            }
        }

    }

    $scope.$watch('skiming', function(value) {
        //applyProcessed(execute($scope.pipe));
    });

    $scope.$watch('query', function(query) {
        var pipe;

        try {
            pipe = JSON.parse(query);
        } catch (e) {
            pipe = {filter: query};
        }

        $scope.pipe = pipe;

        if ($scope.pipe.err) {
            $scope.queryInvalid = true;
        } else {
            $scope.queryInvalid = false;
            applyProcessed(execute($scope.pipe));
        }
    });
});
