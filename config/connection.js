const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://cyclemart:cyclemart123@cluster0.tmlsrkv.mongodb.net/cyclemart",{
    useNewUrlParser:true
}).then(()=>{
    console.log('connection Successfull')
}).catch((e)=>{
    console.log('No Connection');
})


// ?retryWrites=true&w=majority


