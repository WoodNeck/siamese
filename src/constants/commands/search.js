const dedent = require('@/utils/dedent');
const EMOJI = require('@/constants/emoji');
const { strong, code, strike } = require('@/utils/markdown');


module.exports = {
	IMAGE: {
		CMD: '이미지',
		DESC: '구글 이미지를 검색해용!',
		USAGE: '검색어',
		TARGET: '이미지',
		RECITAL_TIME: 30,
		SEARCH_URL: 'https://www.google.co.kr/search',
		SEARCH_PARAMS: query => {
			return {
				q: query,
				tbm: 'isch',
			};
		},
	},
	YOUTUBE: {
		CMD: '유튜브',
		DESC: '유튜브 동영상을 검색해용!',
		USAGE: '검색어',
		TARGET: '동영상',
		TIME_NOT_DEFINED: '??:??',
		RECITAL_TIME: 30,
		MAX_RESULTS: 10,
		VIDEO_URL: videoId => `https://youtu.be/${videoId}`,
		VIDEO_URL_WITH_TIME: (videoId, videoLength) => `https://youtu.be/${videoId} ${code(videoLength)}`,
	},
	KIN: {
		CMD: '지식인',
		DESC: '네이버 지식인을 검색해용!',
		USAGE: '검색어',
		TARGET: '지식인 항목',
		ITEMS_PER_PAGE: 5,
		RECITAL_TIME: 30,
		SEARCH_URL: 'https://openapi.naver.com/v1/search/kin.json',
		SEARCH_PARAMS: query => {
			return {
				query: query,
				display: 50,
				sort: 'sim',
			};
		},
	},
	CHEAPEST: {
		CMD: '최저가',
		DESC: '게임 최저가를 검색해용!',
		USAGE: '게임명',
		TARGET: '게임',
		RECITAL_TIME: 30,
		SEARCH_URL: 'https://www.cheapshark.com/api/1.0/deals',
		SEARCH_PARAMS: query => {
			return {
				title: query,
				pageSize: 10,
				pageNumber: 0,
			};
		},
		REDIRECT_URL: id => `https://www.cheapshark.com/redirect.php?dealID=${id}`,
		GAME_DESC: (price, originalPrice, savings, metaScore) => dedent`
			${EMOJI.DOLLAR} ${strong(price)} / ${strike(originalPrice)} (${savings}% 할인)
			${metaScore ? '메타 점수: ' + metaScore : ''}`,
		REVIEW_TEXT: {
			'Overwhelmingly Positive': '압도적으로 긍정적',
			'Very Positive': '매우 긍정적',
			'Positive': '긍정적',
			'Mostly Positive': '대체로 긍정적',
			'Mixed': '복합적',
			'Mostly Negative': '대체로 부정적',
			'Negative': '부정적',
			'Very Negative': '매우 부정적',
			'Overwhelmingly Negative': '압도적으로 부정적',
		},
		REVIEW_FOOTER: (text, percent, count) => text ? `${text} - 전체 사용자 평가 ${count}건 중 ${percent}%가 긍정적이에용!` : undefined,
		REVIEW_ICON: percent => percent
			? (percent >= 70) ? 'https://www.cheapshark.com/img/reviews/positive.png'
				: (percent >= 40) ? 'https://www.cheapshark.com/img/reviews/mixed.png'
					: 'https://www.cheapshark.com/img/reviews/negative.png'
			: undefined,
	},
};
