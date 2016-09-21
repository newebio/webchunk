var cellx = require('cellx');
var compile = require('./compile');
var write = require('./write');
var watch = require('./watch');
var resolve = require('./resolve');

module.exports = (files) => {
    //create cache
    var modules = {};
    //create module for every entry point
    files.map(addModule);
    //simple add with check cache
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
            //check if module was compiled and all dependencies also, then generate allDeps
            return deps() && modules() && modules().every(m => m()) ?
                deps().concat([].concat.apply([], modules().map(m => m()))) :
                void 0;
        });
        var writer = cellx(() => {
            return allDeps() && code() ? write(file, code(), allDeps()) : void 0;
        });
        writer("subscribe", () => { });
        function _compile() {
            compile(file, (err, code_, deps_) => {
                setTimeout(function () {
                    code(code_);
                    deps(deps_);
                });
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
        //Subscribe to change of file
        watch(file, _compile)
        //Start first compile    
        _compile();
        return {
            allDeps: allDeps
        }
    }
}