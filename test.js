var cellx = require('cellx');
var a1 = cellx();
var a2 = cellx();
var a3 = cellx();
var c = [a1, a2, a3];
a1(true)
a2(true)
console.log(c.every(a => a()))
a3(true)
console.log(c.every(a => a()))
