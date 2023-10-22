const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./src/routes/user.route');
const spaRoutes = require('./src/routes/spa.route');
const diningRoutes = require('./src/routes/dining.route');
const eventsRoutes = require('./src/routes/events.route');
const reservationRoutes = require('./src/routes/reservation.route')

app.use(express.json());

app.use('/users', userRoutes);
app.use('/spa/services', spaRoutes);
app.use('/events', eventsRoutes);
app.use('/dining', diningRoutes);
app.use('/reservation', reservationRoutes)

app.listen(port, () => {
    console.log('Server listening on PORT:', port)
})

app.get('/status', (req, res) => {
    const status = {
        'Status': 'Running'
    }
    res.send(status);
});