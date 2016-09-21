var mock = require('mock2'), fixtures = require('fixture2'), f, compile = require('./../compile'), fs = require('fs');
describe("Compile", () => {
    beforeEach(() => {
        f = fixtures();
        mock.installSyncFS();
    })
    it("when file not empty, should transform all imports to dependencies[i]", () => {
        compile(f("entry", __dirname + "/fixtures/src/app1/index.js"), f("callback", jasmine.createSpy()));
        expect(f("callback").calls.count()).toBe(1);
        expect(f("callback").calls.argsFor(0)[0]).toBe(null);
        expect(f("callback").calls.argsFor(0)[2]).toEqual([require.resolve('./fixtures/src/app1/inc1')]);
        var code = f("callback").calls.argsFor(0)[1];
        f("require", jasmine.createSpy()).and.callFake((req) => {
            switch (req) {
                case f("dep0"):
                    return f("value0");
            }
        })
        expect(_eval.call(undefined, code, [f("dep0")], f("require")).default).toBe(f("value0") + f("value0") + f("value0"));
    })
    afterEach(() => {
        mock.uninstallSyncFS();
    })
})
function _eval() {
    var require = arguments[2];
    var exports = {};
    var module = {
        exports: exports
    }
    eval("(function(dependencies){ " + arguments[0] + " })(arguments[1])");
    return module.exports;
}