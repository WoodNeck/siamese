module.exports = {
	HITOMI: {
		CMD: '히토미',
		DESC: '히토미를 검색하고 볼 수 있다냥!',
		USAGE: '번호',
		PREVIEW_RECITAL_TIME: 30,
		READER_RECITAL_TIME: 60,
		ARTICLE_URL: num => `https://hitomi.la/galleries/${num}.html`,
	},
	HITOMI_RANDOM: {
		CMD: '랜덤',
		DESC: '무작위 번호를 이용하여 검색한다냥!',
		INDEX_URL: 'https://ltn.hitomi.la/index-korean.nozomi',
	},
};
