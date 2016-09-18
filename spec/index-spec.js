var mock = require('mock2'), fixtures = require('fixture2'), async = require('async'), f;
describe("Index", () => {
    beforeEach(() => {
        f = fixtures();
        f("index", mock.require("./../index", {
            "./../compile": f("compile", jasmine.createSpy()),
            "./../write": f("write", jasmine.createSpy()),
            "./../resolve": ""
        }));
    })
    it("when files not empty, should create cell on every file", (done) => {
        f("index")(["index"]);
        f("compile").calls.argsFor(0)[1](null, f("code1"), f("internalDeps", [f("dep1", { file: "inc1" }), f("dep2", { file: "inc2" })]));
        async.series([
            process.nextTick.bind(this, (cb) => {
                f("compile").calls.argsFor(1)[1](null, f("code2"), f("internalDeps", [f("dep3", { file: "inc2" })]));
                cb();
            }),
            process.nextTick.bind(this, (cb) => {
                f("compile").calls.argsFor(2)[1](null, f("code3"), f("internalDeps", []));
                cb();
            }),
            process.nextTick.bind(this, () => {
                expect(f("compile").calls.count()).toBe(3);
                expect(f("write").calls.allArgs()).toEqual([
                    ["inc2", f("code3"), []],
                    ["inc1", f("code2"), [f("dep3")]],
                    ["index", f("code1"), [f("dep1"), f("dep2"), f("dep3")]]
                ])
                done();
            })
        ])

    })
})