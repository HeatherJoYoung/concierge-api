const eventService = require('../services/events.service');

exports.getAllEvents = (req, res, next) => {
    console.log('in events controller');
    eventService.getAllEvents((error, results) => {
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