const reservationService = require('../services/reservation.service')

exports.getReservations = (req, res) => {
    const table = req.params.table
    const tables = ["event", "dining", "spa"]

    if(tables.includes(table)){
        const query_table = table + "_reservations"
        reservationService.getReservations(query_table, (error, result) => {
            if(error){
                return res.status(400).json({
                    status: 0,
                    message: error.message
                })
            }

            return res.status(200).json({
                status: 1,
                data: result.recordsets[0]
            })
        })
    } else {
        return res.status(400).json({
            status: 0,
            message: "Table does not exist"
        })
    }
}

exports.createReservation = (req, res) => {
    const table = req.params.table;
    const dataObj = req.body.dataObj;
  
    const tableToService = {
      event: reservationService.createEventReservation,
      dining: reservationService.createDiningReservation,
      spa: reservationService.createSpaReservation,
    };
  
    const reservationFunction = tableToService[table];
  
    if (reservationFunction) {
      reservationFunction(dataObj, (error, result) => {
        if (error) {
          return res.status(400).json({
            status: 0,
            message: error.message,
          });
        }
  
        return res.status(201).json({
          status: 1,
          message: result.recordsets[0],
        });
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Table does not exist",
      });
    }
  };

  exports.deleteReservation = (req, res) => {
    const table = req.params.table;
    const dataObj = req.body.dataObj;
  
    const tableToService = {
      event: reservationService.deleteEventReservation,
      dining: reservationService.deleteDiningReservation,
      spa: reservationService.deleteSpaReservation,
    };
  
    const reservationFunction = tableToService[table];
  
    if (reservationFunction) {
      reservationFunction(dataObj.id, (error, result) => {
        if (error) {
          return res.status(400).json({
            status: 0,
            message: error.message,
          });
        }
  
        return res.status(201).json({
          status: 1,
          message: 'Reservation successfully deleted.',
        });
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Table does not exist",
      });
    }
  };

  exports.updateReservation = (req, res) => {
    const table = req.params.table;
    const dataObj = req.body.dataObj;
  
    const tableToService = {
      event: reservationService.updateEventReservation,
      dining: reservationService.updateDiningReservation,
      spa: reservationService.updateSpaReservation,
    };
  
    const reservationFunction = tableToService[table];
  
    if (reservationFunction) {
      reservationFunction(dataObj, (error, result) => {
        if (error) {
          return res.status(400).json({
            status: 0,
            message: error.message,
          });
        }
  
        return res.status(201).json({
          status: 1,
          data: result.recordsets[0],
        });
      });
    } else {
      return res.status(400).json({
        status: 0,
        message: "Table does not exist",
      });
    }
  };