// For require module alias, this should be required
// check package.json/_moduleAliases
require('module-alias/register');

// Create a new bot instance, setup and start it
const Tataru = require('@/tataru');
const tataru = new Tataru();

tataru.setup();
tataru.start();
