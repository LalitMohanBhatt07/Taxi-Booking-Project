const mongoose=require('mongoose')

const DriverSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    vehicle:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
        default:0
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const Driver=mongoose.model('Driver',DriverSchema)

module.exports=Driver;