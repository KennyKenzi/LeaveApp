const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/leave-mgt-app',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify: false
})
.then(()=>{
    console.log('John is happy, it has connected')

})
.catch((e)=>{
    console.log(e)
})

module.exports = mongoose