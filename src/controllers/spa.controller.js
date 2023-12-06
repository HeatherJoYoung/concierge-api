const spaService = require('../services/spa.service');

exports.getAllServices = (req, res) => {
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
  const id = req.query.id

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
    return res.status(200).json({
      status: 1,
      message: "Record deleted"
    })
  })
}

exports.getAllTherapists = (req, res) => {
  spaService.getAllTherapists((error, results) => {
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

exports.createTherapist =  async (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({
      status: 0,
      message: "Both 'firstName' and 'lastName' are required fields.",
    });
  }

  spaService.createTherapist(req.body, (error, result) => {
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

exports.deleteTherapist =  (req, res) => {
  const id = req.query.id

  if(!id){
    return res.status(400).json({
      status: 0,
      message: "'id' is required and must be an integer"
    })
  }

  spaService.deleteTherapist(id, (error, result) => {
    if(error) {
      return res.status(400).json({
        status: 0,
        message: error.message
      });
    }
    return res.status(200).json({
      status: 1,
      message: "Record deleted"
    })
  })
}