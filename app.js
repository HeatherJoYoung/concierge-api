const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./routes/user.route');

app.use('/users', userRoutes);

app.use(express.json());

app.listen(port, () => {
    console.log('Server listening on PORT:', port)
})

app.get('/status', (req, res) => {
    const status = {
        'Status': 'Running'
    }
    res.send(status);
});
