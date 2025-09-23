const Event = require("../Model/EventModel");

const getAllEvents = async (req, res, next) => {
    let Events;

    try{
        events =  await Event.find();
    }catch (err) {
        console.log(err);
    }
    //not found
    if(!events){
        return res.status(404).json({message:"Event not found"});
    }
    //display all events
    return res.status(200).json({events});
};

//data insert
const addEvents = async (req, res, next) => {

    const {name,type,description,venue,date,time,maxParticipants,participants,registrationDeadline,bannerUrl,livestreamUrl,staffAssigned,tournamentBracket,leaderboard,status} = req.body;

    let events;

    try{
        events = new Event({name,type,description,venue,date,time,maxParticipants,participants,registrationDeadline,bannerUrl,livestreamUrl,staffAssigned,tournamentBracket,leaderboard,status});
        await events.save();
    }catch (err) {
        console.log(err);
    }

    //not insert events
    if(!events){
        return res.status(404).send({message:"unable to add events"});

    }
    return res.status(200).json({ events });


};

//get by id
const getById = async (req, res,next) => {

    const id = req.params.id;

    let event;

    try{
        event = await Event.findById(id);
    }catch (err) {
        console.log(err);
    }
    //not available events
    if(!event){
        return res.status(404).send({message:"event not found"});

    }
    return res.status(200).json({ event });

}
//update event details
const updateEvent = async (req, res,next) => {

     const id = req.params.id;

     const {name,type,description,venue,date,time,maxParticipants,participants,registrationDeadline,bannerUrl,livestreamUrl,staffAssigned,tournamentBracket,leaderboard,status} = req.body;

     let events;

     try {
        events = await Event.findByIdAndUpdate(id,
            {name,type,description,venue,date,time,maxParticipants,participants,registrationDeadline,bannerUrl,livestreamUrl,staffAssigned,tournamentBracket,leaderboard,status}

        );
        events = await events.save();
     }catch(err) {
        console.log(err);
     }

      //not available events
    if(!events){
        return res.status(404).send({message:"unable to update user details"});

    }
    return res.status(200).json({ events });

};


//delete event details
const deleteEvent = async (req, res, next) => {
    const id = req.params.id;

    let event;


    try{
        event = await Event.findByIdAndDelete(id)
    }catch (err) {
        console.log(err);
    }

     //not available events
    if(!events){
        return res.status(404).send({message:"unable to delete event details"});

    }
    return res.status(200).json({ event });


};



exports.getAllEvents = getAllEvents;
exports.addEvents = addEvents;
exports.getById = getById;
exports.updateEvent=updateEvent;
exports.deleteEvent = deleteEvent;