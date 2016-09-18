var cellx = require('cellx');
var a = cellx(), test;
a("subscribe", () => {
    test = a();
});
a(1);
setTimeout(() => {
    console.assert(test === 1);
    a(2);
    setTimeout(() => {
        console.assert(test === 2);
    }, 1)
}, 1)
