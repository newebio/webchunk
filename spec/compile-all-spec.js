var mock = require('mock2'), fixtures = require('fixture2'), f, originalNextTick, cellx = require('cellx');
//Cellx used nextTick, like process.nextTick for listeners, do it sync!
cellx.Cell._nextTick = (a) => a();
describe("Index", () => {
    beforeEach(() => {
        f = fixtures();
        jasmine.clock().install();
        f("index", mock.require("./../compile-all", {
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
                    return cb(null, f("code1"), [f("inc1"), f("inc2")]);
                case "entry2":
                    return cb(null, f("codeEntry2"), []);
                case "inc1":
                    return cb(null, f("code2"), [f("inc2")]);
                case "inc2":
                    f("i") == "i" ?
                        cb(null, f("code3"), []) :
                        cb(null, f("code3"), [f("inc3")]);
                    return f("i", "i2");
                case "inc3":
                    return cb(null, f("code4"), []);
            }
        });
        f("watch").and.callFake((file, cb) => {
            f("watch_" + file, cb);
        })
        f("index")(["index", "entry2"]);
        jasmine.clock().tick(2);
        expect(f("watch").calls.count()).toBe(4);
        expect(f("write").calls.argsFor(0)).toEqual(["entry2", f("codeEntry2"), []]);
        expect(f("write").calls.argsFor(1)).toEqual(["inc2", f("code3"), []]);
        expect(f("write").calls.argsFor(2)).toEqual(["inc1", f("code2"), [f("inc2")]]);
        expect(f("write").calls.argsFor(3)).toEqual(["index", f("code1"), [f("inc1"), f("inc2")]]);
        //Generate file changing
        expect(f("write").calls.count()).toBe(4);
        f("watch_inc2")();
        jasmine.clock().tick(10);
        expect(f("write").calls.count()).toBe(8);
        expect(f("write").calls.argsFor(4)).toEqual(["inc3", f("code4"), []]);
        expect(f("write").calls.argsFor(5)).toEqual(["inc2", f("code3"), [f("inc3")]]);
        expect(f("write").calls.argsFor(6)).toEqual(["inc1", f("code2"), [f("inc2"), f("inc3")]]);
        expect(f("write").calls.argsFor(7)).toEqual(["index", f("code1"), [f("inc1"), f("inc2"), f("inc3")]]);
    })
})