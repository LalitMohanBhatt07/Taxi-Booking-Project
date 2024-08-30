const mongoose=require('mongoose')

const CustomerSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true})


const Customer=mongoose.model('Customer',CustomerSchema)
module.exports=Customer