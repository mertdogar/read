var async = require('async'),
  _ = require('underscore');


read.factory('SettingsService', function($rootScope) {
  var settings;

  function save() {
    localStorage.settings = JSON.stringify(settings);
  };

  function load() {
    if (!localStorage.settings) localStorage.settings = '{}'

    settings = JSON.parse(localStorage.settings);

    if (!settings.files) settings.files = [];
  }

  function set(a, b) {
    var tmp;
    try {
      tmp = JSON.stringify(b);
    } catch (e) {
      return false;
    }

    settings[a] = b;

    return true;
  };

  function get(a) {
    return settings[a];
  };

  load();

  return {
    get: get,
    set: set,
    save: save,
    load: load
  };
});
