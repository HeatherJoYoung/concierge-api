const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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