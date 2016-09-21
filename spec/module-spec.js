var mock = require('mock2'), fixtures = require('fixture2'), f, cellx = require('cellx');
//Cellx used nextTick, like process.nextTick for listeners, do it sync!
cellx.Cell._nextTick = (a) => a();
fdescribe("Module", () => {
    beforeEach(() => {
        setTimeout = (cb) => cb()
        f = fixtures();
        //jasmine.clock().install();
        f("module", mock.require("./../module", {
            "./../compile": f("compile", jasmine.createSpy())
        }));
        f("dep1AllDeps", cellx());
        f("dep2AllDeps", cellx());
    })
    it("when call first time, should call compile, create all sub-modules and fill allDeps field", () => {
        f("moduleIndex", f("module")(f("index"), f("createModule", jasmine.createSpy())));
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
        //should create sub modules
        expect(f("createModule").calls.count()).toBe(2);
        //Wait for compile sub modules
        f("dep1AllDeps")([f("dep3"), f("dep4")]);
        f("dep2AllDeps")([f("dep5", f("dep3")), f("dep6")]);
        expect(f("moduleIndex").allDeps()).toEqual([f("dep1"), f("dep2"), f("dep3"), f("dep4"), f("dep6")])
    })
    afterEach(() => {
        jasmine.clock().uninstall();
    })
})