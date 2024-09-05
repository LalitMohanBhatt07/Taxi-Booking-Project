const mongoose=require('mongoose')

const DriverSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    vehicle:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Vehicle',
        required:true,
    },
    rating:{
        type:Number,
        default:0,
        min: [0, 'Rating cannot be less than 0.'],
        max: [5, 'Rating cannot be more than 5.']
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const Driver=mongoose.model('Driver',DriverSchema)

module.exports=Driver;