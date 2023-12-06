const eventsService = require('../services/events.service');

exports.getAllEvents = (req, res, next) => {
    eventsService.getAllEvents((error, results) => {
        if (error) {
            console.log(error);
            return res.status(400).send({ success: 0, data: 'Bad Request' });
        }
        return res.status(200).send({
            success: 1,
            data: results.recordsets[0]
        });
    });
};

function parseRequestBody(obj) {
    return {
        capacity: parseInt(obj.capacity),
        contact_email: obj.contactEmail,
        contact_name: obj.contactName,
        contact_phone: obj.contactPhone,
        descript: obj.descript,
        event_location: obj.eventLocation,
        title: obj.title,
        start_time: obj.startTime,
        end_time: obj.endTime
    }
}

exports.createEvent = (req, res) => {
    const eventObj = parseRequestBody(req.body)

    eventsService.createEvent (eventObj, (error, result) => { 
        if(error){
            return res.status(400).json({
                status: 0,
                message: error.message
            })
        }

        return res.status(201).json({
            status: 1,
            message: result.recordsets[0]
        })
    })
}

exports.deleteEvent = (req, res) => {
    const eventId = req.query.id

    eventsService.deleteEvent (eventId, (error, result) => { 
        if(error){
            return res.status(400).json({
                status: 0,
                message: error.message
            })
        }

        return res.status(200).json({
            status: 1,
            message: "Record deleted"
        })
    })
}