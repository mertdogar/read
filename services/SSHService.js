var feed = require('feed-read'),
  async = require('async'),
  _ = require('underscore');

var Connection = require('ssh2');


read.factory('SSHService', function($rootScope) {

  function tail(host, port, username, password, filename, lines, onData, onErrData, callback) {
    var id = username + '@' + host + ':' + port + ':' + filename;
    var conn = new Connection();
    try {
      conn.on('ready', function() {
        console.log('Connection [' + id + ']:: ready');
        callback('ready');
        conn.exec('tail -f -n ' + lines + ' ' + filename, function(err, stream) {
          if (err) throw err;
          stream.on('exit', function(code, signal) {
            callback('exit', code, signal);
          }).on('close', function() {
            conn.end();
            callback('close');
          }).on('data', onData).stderr.on('data', onErrData);
        });
      }).on('error', function(err) {
        if (err) console.log(err);
        callback('err', err);
      }).connect({
        host: host,
        port: port,
        username: username,
        password: password
      });
    } catch (e) {
      callback('exception', e);
    }
    return conn;
  }


  return {
      tail: tail
  };
});
