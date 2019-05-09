const dedent = require('@/utils/dedent');
const { strong } = require('@/utils/markdown');
const EMOJI = require('@/constants/emoji');


module.exports = {
	STONESOUP: {
		CMD: '돌죽',
		DESC: '돌죽 trunk의 영안실을 조회한다냥!',
		USAGE: '닉네임',
		TARGET: {
			USER: '유저',
			GAMES: '플레이한 게임',
		},
		MAX_GAMES_TO_SHOW: 10,
		RECITAL_TILE: 30,
		TRUNK_URL: name => `https://webzook.net/soup/morgue/trunk/${name}/`,
		DETAIL_URL: (name, file) => `https://webzook.net/soup/morgue/trunk/${name}/${file}`,
		INVENTORY: '인벤토리',
		MUTATION: '능력과 돌연변이',
		MESSAGE_HISTORY: '메시지 기록',
	},
	WOW: {
		CMD: '와우',
		USER_SEARCH_URL: 'https://worldofwarcraft.com/ko-kr/search',
		USER_SEARCH_PARAM: username => {
			return {
				q: username,
			};
		},
		LOGO_ALLIANCE: 'https://worldofwarcraft.akamaized.net/static/components/Logo/Logo-alliance.png',
		LOGO_HORDE: 'https://worldofwarcraft.akamaized.net/static/components/Logo/Logo-horde.png',
		PROFILE: {
			CMD: '프로필',
			DESC: '와우 프로필을 검색한다냥!',
			USAGE: '닉네임',
			BASE_URL: 'https://worldofwarcraft.com',
			SELECT_TIME: 30,
			CHECK_TIME: 60,
			DETAIL: (detail) => dedent`
				${EMOJI.CROSSED_SWORDS} ${detail.ilvl}
				${EMOJI.SHIELD} ${detail.achievement}`,
			ITEM_FALLBACK_URL: [
				'https://i.imgur.com/PuDqhMW.png',
				'https://i.imgur.com/s1NMfKc.png',
				'https://i.imgur.com/OVF6e4g.png',
				'https://i.imgur.com/x1hRoIS.png',
				'https://i.imgur.com/l22gLRL.png',
				'https://i.imgur.com/sxRzaCV.png',
				'https://i.imgur.com/X6je0R4.png',
				'https://i.imgur.com/4n1BOoI.png',
				'https://i.imgur.com/deGQBDC.png',
				'https://i.imgur.com/p4hF4gP.png',
				'https://i.imgur.com/a00zEhT.png',
				'https://i.imgur.com/Yenvyi0.png',
				'https://i.imgur.com/PwB4Jbp.png',
				'https://i.imgur.com/PwB4Jbp.png',
				'https://i.imgur.com/5VExQRM.png',
				'https://i.imgur.com/5VExQRM.png',
				'https://i.imgur.com/y4P0vfG.png',
				'https://i.imgur.com/y3WBcdU.png',
			],
		},
	},
	LOL: {
		CMD: '롤',
		PROFILE: {
			CMD: '프로필',
			DESC: 'op.gg에서 롤 프로필 정보를 검색한다냥!',
			USAGE: '소환사명',
			URL: {
				OVERALL: userName => `https://www.op.gg/summoner/userName=${encodeURIComponent(userName)}`,
			},
			MSG: {
				LEVEL: level => `LEVEL - ${strong(level)}`,
				LADDER: (rank, percentage) => rank
					? `래더 랭킹 ${strong(rank)}위 (상위 ${strong(percentage)})`
					: '',
				TIER: ({ rank, leagueName, leaguePoints, win, lose, winRatio }) => leaguePoints
					? dedent`
					${strong(rank)}
					${leaguePoints} / ${win} ${lose}
					${winRatio}
					${leagueName}`
					: strong(rank),
				RECENT_MATCHES: '최근 전적',
				RECENT_STAT: ({ total, win, lose, kill, death, assist }) => dedent`
					${total}전 ${win}승 ${lose}패
					🅚 ${kill} / 🅓 ${death} / 🅐 ${assist}
				`,
			},
		},
	},
};
