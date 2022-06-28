const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://cyclemart:cyclemart123@cluster0.tmlsrkv.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser:true
}).then(()=>{
    console.log('connection Successfull')
}).catch((e)=>{
    console.log('No Connection');
})