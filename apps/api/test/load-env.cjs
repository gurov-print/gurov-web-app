const path = require('node:path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env.example'),
  quiet: true,
});
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
