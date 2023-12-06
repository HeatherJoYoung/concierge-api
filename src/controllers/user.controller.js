const userService = require('../services/user.service');

exports.getAllUsers = (req, res, next) => {
    userService.getAllUsers((error, results) => {
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
