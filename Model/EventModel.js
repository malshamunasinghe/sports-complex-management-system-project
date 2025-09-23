const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({

    name:{
        type:String,  //dataType
        required:true, //validate
    },
    type:{
        type:String,  //dataType
        required:true, //validate
    },
    description:{
        type:String,  //dataType
        required:true, //validate
    },
    venue:{
        type:String,  //dataType
        required:true, //validate
    },
    date:{
        type:String,  //dataType
        required:true, //validate
    },
    time:{
        type:String,  //dataType
        required:true, //validate
    },
    maxParticipants:{
        type:Number,
        required:true,
    },
    participants:{
        type:Number,
        required:true,
    },
    registrationDeadline:{
        type:String,
        required:true,
    },
    bannerUrl:{
        type:String,
        required:true,
    },
    livestreamUrl:{
        type:String,
        required:true,
    },
    staffAssigned:{
        type:String,
        required:true,
    },
    tournamentBracket:{
        type:String,
        required:true,
    },
    leaderboard:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
    },



});

module.exports = mongoose.model(
    "EventModel", //file name
    eventSchema //function name
)