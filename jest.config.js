module.exports = {
	clearMocks: true,
	testRegex: 'tests/.*\\.(js|jsx)$',
	setupTestFrameworkScriptFile: '<rootDir>/tests/setups/setup.js',
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
