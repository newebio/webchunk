var cellx = require('cellx');
var compile = require('./compile');
module.exports = (file, addModule) => {
    var code = cellx();
    var deps = cellx();
    var modules;
    var allDeps = cellx(() => {
        //check if module was compiled and all dependencies also, then generate allDeps
        return deps() && modules && modules.every(m => m()) ?
            Array.from(new Set(deps().concat([].concat.apply([], modules.map(m => m()))))) :
            void 0;
    });
    var writer = cellx(() => {
        console.log("alldeps", allDeps())
        return allDeps() && code() ? write(file, code(), allDeps()) : void 0;
    });
    writer("subscribe", () => { });
    function _compile() {
        compile(file, (err, code_, deps_) => {
            if (err) {
                throw err;
            }
            setTimeout(function () {
                code(code_);
                deps(deps_);
                modules = createModules();
            });
        })
    }
    function createModules() {
        return deps().map((dep) => {
            return addModule(dep).allDeps;
        })
    }
    //Start first compile    
    _compile();
    return {
        allDeps: allDeps,
        compile: _compile
    }
}