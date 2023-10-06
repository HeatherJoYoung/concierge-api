const { param } = require('../routes/user.route');
const spaService = require('../services/spa.service');


exports.getAllServices = (req, res) => {
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

exports.createService =  async (req, res) => {
    console.log("Create service controller");

    const { title, descript } = req.body;

    if (!title || !descript) {
        return res.status(400).json({
          status: 0,
          message: "Both 'title' and 'descript' are required fields.",
        });
    }

    spaService.createService(title, descript, (error, result) => {
        if(error){
           return res.status(400).json({
                status: 0,
                message: err.message
            });
        }
        return res.status(200).json({
            status: 1,
            message: result.recordsets[0]
        })
    })
};


exports.deleteService =  (req, res) => {

    const id = req.body.id;

    if(!id){
        return res.status(400).json({
            status: 0,
            message: "'id' is required and must be an integer"
        })
    }

    spaService.deleteService(id, (error, result) => {
        if(error) {
            return res.status(400).json({
                status: 0,
                message: error.message
            });
        }
        return res.status(201).json({
            status: 1,
            message: "Record deleted"
        })
    })
}