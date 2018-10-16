module.exports = {
	clearMocks: true,
	globalSetup: './tests/setup.js',
  coverageDirectory: 'coverage',
	testEnvironment: 'node',
	moduleDirectories: [
		'node_modules',
		'src'
	],
	moduleNameMapper: {
		'^@/(.*)': '<rootDir>/src/$1'
	}
};
