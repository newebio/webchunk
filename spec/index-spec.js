var mock = require('mock2'), fixtures = require('fixture2'), async = require('async'), f, originalNextTick, cellx = require('cellx');
//Cellx used nextTick, like process.nextTick for listeners, do it sync!
cellx.Cell._nextTick = (a) => a();
describe("Index", () => {
    beforeEach(() => {
        f = fixtures();
        jasmine.clock().install();
        f("index", mock.require("./../index", {
            "./../compile": f("compile", jasmine.createSpy()),
            "./../write": f("write", jasmine.createSpy()),
            "./../watch": f("watch", jasmine.createSpy()),
            "./../resolve": ""
        }));
    })
    it("when files not empty, should create cell on every file", () => {
        f("compile").and.callFake((file, cb) => {
            switch (file) {
                case "index":
                    return cb(null, f("code1"), f("internalDeps", [f("dep1", { file: "inc1" }), f("dep2", { file: "inc2" })]));
                case "inc1":
                    return cb(null, f("code2"), f("internalDeps", [f("dep3", { file: "inc2" })]));
                case "inc2":
                    f("i") == "i" ?
                        cb(null, f("code3"), f("internalDeps", [])) :
                        cb(null, f("code3"), f("internalDeps", [f("dep4", { file: "inc3" })]));
                    return f("i", "i2");
                case "inc3":
                    return cb(null, f("code4"), f("internalDeps", []));
            }

        });
        f("index")(["index"]);
        jasmine.clock().tick(2);
        expect(f("watch").calls.count()).toBe(3);
        expect(f("write").calls.argsFor(0)).toEqual(["inc2", f("code3"), []]);
        expect(f("write").calls.argsFor(1)).toEqual(["inc1", f("code2"), [f("dep3")]]);
        expect(f("write").calls.argsFor(2)).toEqual(["index", f("code1"), [f("dep1"), f("dep2"), f("dep3")]]);
        //Generate file changing
        expect(f("write").calls.count()).toBe(3);
        f("watch").calls.argsFor(2)[1]();
        jasmine.clock().tick(2);
        expect(f("write").calls.count()).toBe(7);
        expect(f("write").calls.argsFor(3)).toEqual(["inc3", f("code4"), []]);
        expect(f("write").calls.argsFor(4)).toEqual(["inc2", f("code3"), [f("dep4")]]);
        expect(f("write").calls.argsFor(5)).toEqual(["inc1", f("code2"), [f("dep3"), f("dep4")]]);
        expect(f("write").calls.argsFor(2)).toEqual(["index", f("code1"), [f("dep1"), f("dep2"), f("dep3"), f("dep4")]]);
    })
})