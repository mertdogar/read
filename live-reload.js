var watchTree = require("fs-watch-tree").watchTree;

function reload() {
    if (location.reload) location.reload();
    else setTimeout(reload, 100);
}

var watch = watchTree("./", reload);
