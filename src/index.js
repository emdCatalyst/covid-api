const app = (require('express'))(),
  routes = (require('require-dir'))('./routes'),
  dotenv = require('dotenv').config();

app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'));

app.get('/countries', (req, res) => routes.countries(req, res));

app.get('/summary', (req, res) => routes.summary(res));

app.get('/country', (req, res) => routes.country(req, res));

app.listen(process.env.port, () => console.log(`Listening on port : ${process.env.port}`));