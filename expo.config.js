// expo.config.js
module.exports = {
  ...require('./app.json').expo,
  metro: {
    config: './metro.config.cjs'
  }
};