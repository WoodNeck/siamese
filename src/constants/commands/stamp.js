const dedent = require('@/utils/dedent');

module.exports = {
	MANAGE: {
		CMD: '스탬프',
		DESC: dedent`
			스탬프를 관리할 수 있는 사이트 링크를 출력한다냥!
			스탬프는 자주 사용하는 이미지를 등록해서 채팅창에 간편하게 출력할 수 있는 기능이다냥!
			${global.env.FILE_MANAGEMENT_URL}/stamp 에서 더 알아볼 수 있다냥!`,
	},
	LIST: {
		CMD: '목록',
		DESC: dedent`
			폴더 안의 스탬프 목록을 표시한다냥!
			폴더명을 주지 않을 경우 기본 폴더에 있는 스탬프 목록을 표시한다냥!`,
		USAGE: '폴더명',
		IMAGE_PER_PAGE: 10,
		RECITAL_TIME: 30,
	},
};
