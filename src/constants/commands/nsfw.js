module.exports = {
	HITOMI: {
		CMD: '히토미',
		DESC: '이 채널의 랜덤한 메시지를 보여준다냥!',
		USAGE: '번호',
		PREVIEW_RECITAL_TIME: 30,
		READER_RECITAL_TIME: 60,
		ARTICLE_URL: num => `https://hitomi.la/galleries/${num}.html`,
		READER_URL: num => `https://hitomi.la/reader/${num}.html`,
		IMAGE_URL_ODD: (articleNum, imageName) => `https://ba.hitomi.la/galleries/${articleNum}/${imageName}`,
		IMAGE_URL_EVEN: (articleNum, imageName) => `https://aa.hitomi.la/galleries/${articleNum}/${imageName}`,
		READER_TITLE: (title, articleNum) => `${title}(${articleNum})`,
	},
};
