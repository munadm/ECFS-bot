'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const baseRoutes = require('./app/routes/baseRouter')
const fbRoutes = require('./app/routes/fbRouter');

const app = express();

app.set('port', (process.env.PORT || 5550))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())
app.use(bodyParser.json());

//Routes
app.use('/', baseRoutes);
app.use('/webhook', fbRoutes);

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})