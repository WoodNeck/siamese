// For require module alias, this should be required
// check package.json/_moduleAliases
require('module-alias/register');

// Create a new bot instance, setup and start it
const Tataru = require('@/tataru');
const option = require('@/tataru.option');
const tataru = new Tataru(option);

tataru.setup();
tataru.start();
