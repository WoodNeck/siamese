const dedent = require('@/utils/dedent');
const EMOJI = require('@/constants/emoji');
const { strong, code, strike } = require('@/utils/markdown');


module.exports = {
	IMAGE: {
		CMD: '이미지',
		DESC: '구글 이미지를 검색한다냥!',
		USAGE: '검색어',
		TARGET: '이미지',
		RECITAL_TIME: 30,
		SEARCH_URL: isSafeSearch => isSafeSearch
			? 'https://www.google.co.kr/search'
			: 'https://www.google.com/ncr',
		SEARCH_PARAMS: (query, isSafeSearch) => {
			// nfpr: enable no auto query correction(ex: museuk -> museum)
			// safe: enable safe searching
			return isSafeSearch
				? {
					q: query,
					tbm: 'isch',
					nfpr: '1',
					safe: 'active',
				}
				: {
					prev: `/search?q=${query}&tbm=isch&nfpr=1`,
				};
		},
	},
	YOUTUBE: {
		CMD: '유튜브',
		DESC: '유튜브 동영상을 검색한다냥!',
		USAGE: '검색어',
		TARGET: '동영상',
		TIME_NOT_DEFINED: '??:??',
		RECITAL_TIME: 30,
		MAX_RESULTS: 10,
		VIDEO_URL: videoId => `https://youtu.be/${videoId}`,
		VIDEO_URL_WITH_TIME: (videoId, videoLength) => `https://youtu.be/${videoId} ${code(videoLength)}`,
		API_SEARCH_URL: endpoint => `https://www.googleapis.com/youtube/v3/${endpoint}`,
		SEARCH_OPTION: isSafeSearch => {
			return {
				safeSearch: isSafeSearch ? 'strict' : 'none',
			};
		},
	},
	KIN: {
		CMD: '지식인',
		DESC: '네이버 지식인을 검색한다냥!',
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
		DESC: '게임 최저가를 검색한다냥!',
		USAGE: '게임명',
		TARGET: '게임',
		RECITAL_TIME: 30,
		SEARCH_URL: 'https://www.cheapshark.com/api/1.0/deals',
		SEARCH_PARAMS: query => {
			// Sort by savings percentage desc
			return {
				title: query,
				sortBy: 'Savings',
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
		REVIEW_FOOTER: (text, percent, count) => text ? `${text} - 전체 사용자 평가 ${count}건 중 ${percent}%가 긍정적이다냥!` : undefined,
		REVIEW_ICON: percent => percent
			? (percent >= 70) ? 'https://www.cheapshark.com/img/reviews/positive.png'
				: (percent >= 40) ? 'https://www.cheapshark.com/img/reviews/mixed.png'
					: 'https://www.cheapshark.com/img/reviews/negative.png'
			: undefined,
	},
	SHOPPING: {
		CMD: '쇼핑',
		DESC: '네이버 쇼핑에 상품을 검색한다냥!',
		USAGE: '상품명',
		TARGET: '상품',
		RECITAL_TIME: 30,
		SEARCH_URL: 'https://openapi.naver.com/v1/search/shop.json',
		SEARCH_PARAMS: query => {
			return {
				query: query,
				display: 10,
			};
		},
		PRICE: (low, high) => dedent`
			${high ? `${EMOJI.SMALL_WHITE_SQUARE}최저 ${low}원 ~ ${high}원` : `${EMOJI.SMALL_WHITE_SQUARE}${low}원`}`,
		PRODUCT_TYPE: {
			1: '일반상품',
			2: '일반상품',
			3: '일반상품',
			4: '중고상품',
			5: '중고상품',
			6: '중고상품',
			7: '단종상품',
			8: '단종상품',
			9: '단종상품',
			10: '판매예정상품',
			11: '판매예정상품',
			12: '판매예정상품',
		},
	},
	NAMUWIKI: {
		CMD: '나무위키',
		DESC: '나무위키 문서를 검색한다냥!',
		USAGE: '검색어',
		TARGET: '문서',
		RECITAL_TIME: 60,
		URL_BASE: 'https://namu.wiki',
		SEARCH_URL: searchText => `https://namu.wiki/w/${searchText}`,
		ICON_URL: 'https://everipedia-storage.s3-accelerate.amazonaws.com/ProfilePics/%EB%82%98%EB%AC%B4%EC%9C%84%ED%82%A4__52321.png',
		NOT_FOUND_URL: 'https://i.pinimg.com/originals/b9/09/f8/b909f84754eb25f055165d05509ed5b0.png',
		TITLE: title => `${EMOJI.SMALL_BLUE_DIAMOND} ${title}`,
		CATEGORY: categories => `${EMOJI.BOOKS} 분류: ${categories.join(' | ')}`,
		TOC_ENTRY: ($, el) => `${'  '.repeat(el.level - 1)}${EMOJI.SMALL_WHITE_SQUARE}${$(el).text()}`,
	},
};
