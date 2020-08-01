const server = require('./server.js');
require('dotenv').config()


const cron = require('node-cron');
const axios = require('axios');
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});