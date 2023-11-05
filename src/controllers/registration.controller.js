const registrationService = require('../services/registration.service')

exports.registerGuest = (req, res) => {
    user = req.body.user
    registrationService.createGuestUser(user, (error, result) => {
        if(error){
            return res.status(400).json({
                status: 0,
                message: error
            })
        }

        return res.status(201).json({
            status: 1,
            message: "Guest created"
        })

    })
}

exports.registerEmployee = (req, res) => {
    user = req.body.user
    registrationService.createEmployeeUser(user, (error, result) => {
        if(error){
            return res.status(400).json({
                status: 0,
                message: error
            })
        }

        return res.status(201).json({
            status: 1,
            message: "Employee created"
        })

    })
}