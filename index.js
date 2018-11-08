'use strict';

// For require module alias, this should be required
// check package.json/_moduleAliases
require('module-alias/register');

// Load env file first before any of file, to load constants correctly
require('@/utils/loadenv');

// Create a new bot instance, setup and start it
const Tataru = require('@/tataru');
const option = require('@/tataru.option');
const tataru = new Tataru(option);

tataru.setup()
	.then(() => tataru.start())
	.catch(console.error);
