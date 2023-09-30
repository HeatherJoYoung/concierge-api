const spaService = require('../services/spa.service');

exports.getAllServices = (req, res, next) => {
    console.log('in services controller')
    spaService.getAllServices((error, results) => {
        if (error) {
            console.log(error);
            return res.status(400).send({ success: 0, data: 'Bad Request'});
        }
        return res.status(200).send({
            success: 1,
            data: results.recordsets[0]
        });
    });
}
