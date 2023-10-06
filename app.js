const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./src/routes/user.route');
const spaRoutes = require('./src/routes/spa.route');


app.use(express.json());

app.use('/users', userRoutes);
app.use('/spa/services', spaRoutes)


app.listen(port, () => {
    console.log('Server listening on PORT:', port)
})

app.get('/status', (req, res) => {
    const status = {
        'Status': 'Running'
    }
    res.send(status);
});
