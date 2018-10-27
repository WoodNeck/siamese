module.exports = {
	clearMocks: true,
	testRegex: 'tests/.*\\.(js|jsx)$',
	setupFiles: ['<rootDir>/tests/setups/init.js'],
	setupTestFrameworkScriptFile: '<rootDir>/tests/setups/beforeEach.js',
  coverageDirectory: 'coverage',
	testEnvironment: 'node',
	modulePathIgnorePatterns: [
		'<rootDir>/tests/setups',
	],
	moduleDirectories: [
		'node_modules',
		'src'
	],
	moduleNameMapper: {
		'^@/(.*)': '<rootDir>/src/$1'
	}
};
