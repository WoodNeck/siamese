const path = require('path');
const { readdirSync } = require('fs');

const prototypeDir = path.join(__dirname, '..', 'prototype');
readdirSync(prototypeDir)
	.forEach(file => {
		// load each prototype redefinitions
		require(`@/prototype/${file}`);
	});
