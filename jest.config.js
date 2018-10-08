module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
	testEnvironment: "node",
	moduleNameMapper: {
		"^@/(.*)": "<rootDir>/src/$1"
	}
};
