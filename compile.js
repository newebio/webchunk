
var fs = require('fs');
var babel = require('babel-core');
var nodeModuleInfo = require('node-module-info');
module.exports = function (file, callback) {
    var deps = [];
    fs.readFile(file, (err, content) => {
        if (err) {
            return callback(err);
        }
        transform("" + content);
    })
    function transform(source) {
        var code = babel.transform(source, {
            presets: ["es2015"],
            plugins: [function ({ types: t }) {
                return {
                    visitor: {
                        CallExpression(path) {
                            if (!path.isCallExpression()) return false;
                            if (!path.get("callee").isIdentifier({ name: "require" })) return false;
                            if (path.scope.getBinding("require")) return false;
                            var res = resolve(t, path.node.arguments);
                            if (res) {
                                path.node.arguments = res;
                            }
                        }
                    }
                }
            }]
        }).code;
        callback(null, code, deps);
    }
    function resolve(t, args) {
        if (args[0].type !== "StringLiteral") {
            return;
        }
        var info = nodeModuleInfo(args[0].value, file);
        var depFile = info.getResolvedPath();
        var num = deps.indexOf(depFile);
        if (num === -1) {
            deps.push(depFile);
            num = deps.length - 1;
        }
        return [t.memberExpression(t.identifier("dependencies"), t.numericLiteral(num), true)];
    }
}