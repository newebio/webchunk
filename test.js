var cellx = require('cellx');
var a = cellx();
var value = cellx((push, fail, oldValue) => {
    console.log("v")
    setTimeout(() => {
        push(15);
        setTimeout(() => {
            push(void 0);
            setTimeout(() => {
                
                push(16);
                setTimeout(() => {
                },100000);
            },5000);
        },1000);
    }, 5000);

    //return oldValue; // оставляем предыдущее значение на время повторных запросов
});
value("subscribe",()=>{

})

var currentlyLoading = cellx(() => {
    console.log(11, value('isPending', 0))
    // состояние загрузки определяем подписываясь на автоматически создаваемые подячейки
    return value('isPending', 0);//|| otherValue('isPending', 0);
});
currentlyLoading("subscribe", () => {
    console.log(currentlyLoading())
})