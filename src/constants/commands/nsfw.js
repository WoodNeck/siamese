module.exports = {
	HITOMI: {
		CMD: '히토미',
		DESC: '히토미를 검색하고 볼 수 있다냥!',
		USAGE: '번호',
		PREVIEW_RECITAL_TIME: 30,
		READER_RECITAL_TIME: 60,
		ARTICLE_URL: num => `https://hitomi.la/galleries/${num}.html`,
		READER_URL: num => `https://hitomi.la/reader/${num}.html`,
		IMAGE_URL_ODD: (articleNum, imageName) => `https://ba.hitomi.la/galleries/${articleNum}/${imageName}`,
		IMAGE_URL_EVEN: (articleNum, imageName) => `https://aa.hitomi.la/galleries/${articleNum}/${imageName}`,
		READER_TITLE: (title, articleNum) => `${title}(${articleNum})`,
	},
	HITOMI_RANDOM: {
		CMD: '랜덤',
		DESC: '무작위 번호를 이용한다냥!',
		RANDOM_URL: 'https://hiyobi.me/random',
		ARTICLE_NUM_MAX: 10000000,
	},
};
