var cellx = require('cellx');
var compile = require('./compile');
module.exports = (file, addModule) => {
    var code = cellx();
    var deps = cellx();
    var modules = cellx(() => {
        return deps() ? createModules() : undefined;
    })
    var allDeps = cellx(() => {
        console.log("aaa", modules() ? console.log(modules().length) || modules().map(m => console.log(m())) : null)
        //check if module was compiled and all dependencies also, then generate allDeps
        return deps() && modules() && modules().every(m => m()) ?
            Array.from(new Set(deps().concat([].concat.apply([], modules().map(m => m()))))) :
            void 0;
    });
    var writer = cellx(() => {
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
            });
        })
    }
    function createModules() {
        return deps().map((dep) => {
            var mod = addModule(dep);
            return cellx((push) => {
                mod.allDeps("subscribe", () => {
                    console.log("subscribe")
                    push(mod.allDeps())
                });
            });
        })
    }
    //Start first compile    
    _compile();
    return {
        allDeps: allDeps,
        compile: _compile
    }
}