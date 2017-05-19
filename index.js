'use strict'

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const baseRoutes = require('./app/routes/baseRouter')
const fbRoutes = require('./app/routes/fbRouter');

const app = express();

const uristring = process.env.MONGODB_URI ||
			    process.env.MONGOHQ_URL ||
			    'mongodb://localhost/ECFS_BOT';

app.set('port', (process.env.PORT || 5550))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())
app.use(bodyParser.json());

//Routes
app.use('/', baseRoutes);
app.use('/webhook', fbRoutes);

//Connect to mongodb
mongoose.connect(uristring, (err, res) => {
      if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + uristring);
      }
  });

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})