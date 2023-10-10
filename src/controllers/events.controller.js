const eventsService = require('../services/events.service');

exports.createEvent = (req, res) => {
    const eventObj = req.body.eventObj

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