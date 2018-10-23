module.exports = (errorMsg, locale) => {
	const { FORMAT } = require('@/constants')(locale);


	return {
		by: user => `${FORMAT.ERROR_MSG(user)}${errorMsg}`,
	};
};
