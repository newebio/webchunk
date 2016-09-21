var mock = require('mock2'), fixtures = require('fixture2'), f, cellx = require('cellx');
//Cellx used nextTick, like process.nextTick for listeners, do it sync!
cellx.Cell._nextTick = (a) => a();
fdescribe("Module", () => {
    beforeEach(() => {
        f = fixtures();
        jasmine.clock().install();
        f("module", mock.require("./../module", {
            "./../compile": f("compile", jasmine.createSpy())
        }));
    })
    it("when call first time, should call compile, create all sub-modules and fill allDeps field", () => {
        f("moduleIndex", f("module")(f("index"), f("createModule", jasmine.createSpy())));
        f("dep1AllDeps", cellx([]));
        f("dep2AllDeps", cellx([]));
        f("createModule").and.callFake((file) => {
            switch (file) {
                case f("dep1"):
                    return {
                        allDeps: f("dep1AllDeps")
                    }
                case f("dep2"):
                    return {
                        allDeps: f("dep2AllDeps")
                    }
            }
        })
        //Should call compile
        expect(f("compile").calls.count()).toBe(1);
        expect(f("compile").calls.argsFor(0)[0]).toBe(f("index"));
        expect(f("compileCallback", f("compile").calls.argsFor(0)[1])).toEqual(jasmine.any(Function));
        //compile ready: (error, code:string, deps:Array<string>)
        f("compileCallback")(null, f("code1"), [f("dep1"), f("dep2")]);
        //After compile cells setted async in setTimeout
        jasmine.clock().tick(1);
        //should create sub modules
        expect(f("createModule").calls.count()).toBe(2);
        jasmine.clock().tick(100);
        //Wait for compile sub modules
        f("dep1AllDeps")([f("dep3"), f("dep4")]);
        f("dep2AllDeps")([f("dep5"), f("dep6")]);
        //
        jasmine.clock().tick(100);
        expect(f("moduleIndex").allDeps()).toEqual([f("dep1"), f("dep2"), f("dep2"), f("dep2"), f("dep2"), f("dep2")])
    })
    afterEach(() => {
        jasmine.clock().uninstall();
    })
})