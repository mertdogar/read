read.controller('MainController', function($scope, $rootScope, SSHService, SettingsService) {
    console.log('MainController initialized.');

    //
    console.log('Main Controler.');

    $scope.files = [];

    $scope.tabs = [];

    $scope.selectFile = function($event, file) {
        delete $scope.selectedFile;
        $scope.files.forEach(function(item) {
            if (item == file) {
                item.selected = true;
                $scope.selectedFile = item;
                $event.stopPropagation();
            } else {
                item.selected = false;
            }
        });
    };

    $scope.deleteFile = function(file) {
        $scope.closeFile(file);

        var index = -1;
        $scope.files.forEach(function(item, i) {
            if (item == file)
                index = i;
        });

        if (index == -1) return;

        $scope.files.splice(index, 1);
    };

    $scope.openFile = function(file) {
        var hasOpened = $scope.tabs.some(function(item) {
            return item == file;
        });

        if (hasOpened) return $scope.onClickTab(file);

        $scope.tabs.push(file);
        $scope.onClickTab(file);
        $scope.sidebarOpen = false;
    };

    $scope.closeFile = function(file) {
        var index = -1;
        $scope.tabs.forEach(function(item, i) {
            if (item == file)
                index = i;
        });

        if (index == -1) return;

        $scope.tabs.splice(index, 1);

        if (index > 0)
            $scope.onClickTab($scope.tabs[index - 1]);
    };

    $scope.onClickTab = function(tab) {
        $scope.tabs.forEach(function(item) {
            if (item == tab) item.active = true;
            else item.active = false;
        })
    };

    $scope.sidebarMouseUp = function($event) {
        if ($event.button != 2) return;
        $event.preventDefault();
        sidebarMenu.popup($event.pageX, $event.pageY);
    }

    $scope.popupAction = function() {
        if ($scope.draft && $scope.draft.title && $scope.draft.username && $scope.draft.password && $scope.draft.filename) {
            if ($scope.fileModify_) {
                $scope.fileModify_.title = $scope.draft.title;
                $scope.fileModify_.connectionOptions.host = $scope.draft.host;
                $scope.fileModify_.connectionOptions.port = $scope.draft.port;
                $scope.fileModify_.connectionOptions.username = $scope.draft.username;
                $scope.fileModify_.connectionOptions.password = $scope.draft.password;
                $scope.fileModify_.connectionOptions.maxLines = $scope.draft.lines;
            } else {
                var file = {
                    title: $scope.draft.title,
                    active: false,
                    connectionOptions: {
                        host: $scope.draft.host,
                        port: $scope.draft.port,
                        username: $scope.draft.username,
                        password: $scope.draft.password,
                        filename: $scope.draft.filename
                    }
                };

                $scope.files.push(file);
            }

            $scope.dumpFiles();
            $scope.popupDispose();
        } else {
            alert('Missing parameter');
        }
    };

    $scope.dumpFiles = function() {
        var data = $scope.files.map(function(item) {
            return {
                title: item.title,
                connectionOptions: {
                    host: item.connectionOptions.host,
                    port: item.connectionOptions.port,
                    username: item.connectionOptions.username,
                    password: item.connectionOptions.password,
                    filename: item.connectionOptions.filename,
                    maxLines: item.connectionOptions.maxLines,
                }
            };
        });

        localStorage.files = JSON.stringify(data);
    };

    $scope.restoreFiles = function() {
        $scope.files = localStorage.files ? JSON.parse(localStorage.files) : [];
    };

    $scope.showPopup = function(obj) {
        if (obj) {
            $scope.fileModify_ = obj;

            $scope.draft = {
                title: obj.title,
                host: obj.connectionOptions.host,
                port: obj.connectionOptions.port,
                username: obj.connectionOptions.username,
                password: obj.connectionOptions.password,
                filename: obj.connectionOptions.filename,
                lines: obj.connectionOptions.maxLines
            };

        } else {
            delete $scope.draft;
        }

        $scope.showPopup_ = true;
    };

    $scope.popupDispose = function() {
        delete $scope.draft;
        delete $scope.fileModify_;
        $scope.showPopup_ = false;
    };

    $scope.editFile = function() {
        if (!$scope.selectedFile) return;
        $scope.showPopup($scope.selectedFile);
    };

    $scope.deleteConfirm = function() {
        if (!$scope.selectedFile) return;
        var result = window.confirm('Are you sure?');
        if (result) {
            $scope.deleteFile($scope.selectedFile);
            $scope.$digest();
        }
    };


    function SidebarMenu() {
        var gui = require('nw.gui'),
            menu = new gui.Menu(),
            cut = new gui.MenuItem({
                label: "Edit",
                click: function() {
                    if (!$scope.selectedFile) return;

                    $scope.showPopup($scope.selectedFile);
                    $scope.$digest();
                }
            }),
            copy = new gui.MenuItem({
                label: "Delete",
                click: function() {
                    $scope.deleteConfirm();
                }
            });

        menu.append(cut);
        menu.append(copy);

        return menu;
    }

    var sidebarMenu = new SidebarMenu();
    $scope.restoreFiles();
});
