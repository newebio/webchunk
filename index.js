var cellx = require('cellx');
var compile = require('./compile');
var write = require('./write');
var resolve = require('./resolve');

module.exports = (files) => {
    var modules = files.map((file) => {
        return addModule(file);
    })
}
var modules = {};
function addModule(file) {
    if (!modules[file]) {
        modules[file] = mod(file);
    }
    return modules[file];
}

function mod(file) {
    var code = cellx();
    var deps = cellx();
    var modules = cellx(() => {
        return deps() ? createModules() : undefined;
    })
    var allDeps = cellx(() => {
        var allD = deps() && modules() && modules().every(m => m()) ? deps().concat([].concat.apply([], modules().map(m => m()))) : void 0;
        return allD;
    });
    var writer = cellx(() => {
        return code() && allDeps();
    });
    writer("subscribe", () => {
        write(file, code(), allDeps());
    });
    function start() {
        compile(file, (err, code_, deps_) => {
            code(code_);
            deps(deps_);
        })
    }
    function createModules() {
        return deps().map((dep) => {
            var mod = addModule(dep.file);
            return cellx(() => {
                return mod.allDeps();
            });
        })
    }
    start();
    return {
        allDeps: allDeps
    }
}