const diningService = require('../services/dining.service');

exports.getAllDiningCapacity = (req, res, next) => {
    
    diningService.getAllDiningCapacity((error, results) => {
        if (error) {
            console.log(error);
            return res.status(400).send({ success: 0, data: 'Bad Request' });
        }
        return res.status(200).send({
            success: 1,
            data: results.recordsets[0]
        });
    });
}