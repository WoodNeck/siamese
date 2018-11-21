const DateDiff = require('date-diff');
const { strong } = require('@/utils/markdown');
const EMOJI = require('@/constants/emoji');


module.exports = {
	STEAM: {
		CMD: '스팀',
		SEARCH_BY_COMMUNITY_ID_URL: 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/',
		SEARCH_BY_GAME_NAME_URL: 'https://store.steampowered.com/api/storesearch/',
		SUMMARY_URL: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002',
		BAN_URL: 'http://api.steampowered.com/ISteamUser/GetPlayerBans/v1',
		RECENT_GAME_URL: 'http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1',
		LEVEL_URL: 'http://api.steampowered.com/IPlayerService/GetSteamLevel/v1',
		FRIEND_URL: 'http://api.steampowered.com/ISteamUser/GetFriendList/v1',
		OWNING_GAME_URL: 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v1',
		ICON_URL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png',
		PROFILE_GAME_URL: baseUrl => `${baseUrl}games/?tab=all`,
		GAME_IMG_URL: (appid, url) => `http://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${url}.jpg`,
		SEARCH_BY_COMMUNITY_ID_PARAMS: query => {
			return {
				vanityurl: query,
				key: global.env.STEAM_API_KEY,
			};
		},
		SEARCH_BY_GAME_NAME_PARAMS: query => {
			return {
				term: query,
			};
		},
		STEAM_IDS_PARAMS: id => {
			return {
				steamids: id,
				key: global.env.STEAM_API_KEY,
			};
		},
		RECENT_GAME_PARAMS: id => {
			return {
				steamid: id,
				key: global.env.STEAM_API_KEY,
				count: 3,
			};
		},
		STEAM_ID_PARAMS: id => {
			return {
				steamid: id,
				key: global.env.STEAM_API_KEY,
			};
		},
		OWNING_GAME_PARAMS: (id, isDetailed) => {
			return {
				steamid: id,
				key: global.env.STEAM_API_KEY,
				include_appinfo: isDetailed ? '1' : '0',
				include_played_free_games: '1',
			};
		},
		FRIEND_PARAMS: id => {
			return {
				steamid: id,
				key: global.env.STEAM_API_KEY,
				relationship: 'friend',
			};
		},
		PLAYTIME: minute => `총 플레이 시간: ${minute ? (minute / 60).toFixed(1) : 0}시간`,
		PLAYTIME_SHORT: minute => `${minute ? (minute / 60).toFixed(1) : 0}시간`,
	},
	PROFILE: {
		CMD: '프로필',
		DESC: '프로필 정보를 요약해서 보여준다냥!',
		USAGE: '커뮤니티_ID',
		PERSONA_STATE: {
			0: '오프라인',
			1: '온라인',
			2: '바쁨',
			3: '자리 비움',
			4: '수면 중',
			5: '거래할 사람 찾는 중',
			6: '같이 게임해요',
		},
		PLAYING_STATE: game => `${strong(game)}플레이 중`,
		REGISTERED: timestamp => {
			const date = new Date(timestamp);
			return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월에 가입`;
		},
		LAST_LOGOFF: timestamp => {
			const dateDiff = new DateDiff(new Date(), new Date(timestamp));
			const diff = {
				year: Math.floor(dateDiff.years()),
				month: Math.floor(dateDiff.months() % 12),
				week: Math.floor(dateDiff.weeks()),
				// If days over 31 it won't be a problem as we're not using this value then
				day: Math.floor(dateDiff.days() % 31),
				hour: Math.floor(dateDiff.hours() % 24),
				minute: Math.floor(dateDiff.minutes() % 60),
			};

			const last = diff.year > 1
				? `${diff.year}년`
				: diff.year && diff.month
					? `${diff.year}년 ${diff.month}개월`
					: diff.month > 1
						? `${diff.month}개월`
						: diff.week
							? `${diff.week}주`
							: diff.day > 1
								? `${diff.day}일`
								: diff.day && diff.hour
									? `${diff.day}일 ${diff.hour}시간`
									: diff.hour > 1
										? `${diff.hour}시간`
										: diff.hour && diff.minute
											? `${diff.hour}시간 ${diff.minute}분`
											: `${Math.max(diff.minute, 1)}분`;
			return `마지막 접속: ${last} 전`;
		},
		TITLE: (name, flag) => `${flag}${name}`,
		FIELD_DETAIL: '유저 정보',
		FIELD_BAN: '밴 기록',
		FIELD_RECENT_GAME: '최근 플레이 게임 (지난 2주간)',
		BAN_COMMUNITY: '커뮤니티 밴',
		BAN_VAC: 'VAC 밴',
		BAN_GAME: '게임 밴',
		BAN_ECONOMY: '거래 밴',
		LEVEL: level => `LEVEL - ${strong(level.toString())}`,
		FRIENDS: friends => `친구 - ${strong(friends.length.toString())}명`,
		GAMES: gamesCount => `게임 - ${strong(gamesCount.toString())}개`,
		GAME_DESC: game => `${EMOJI.SMALL_WHITE_SQUARE} ${strong(game.name)} - ${(game.playtime_2weeks / 60).toFixed(1)}시간`,
	},
	RANDOM: {
		CMD: '랜덤',
		DESC: '계정에서 무작위 게임을 가져와서 보여준다냥!',
		USAGE: '커뮤니티_ID',
	},
	LIBRARY: {
		CMD: '라이브러리',
		DESC: '계정의 게임들을 플레이 시간이 높은 것부터 보여준다냥!',
		USAGE: '커뮤니티_ID',
		GAMES_PER_PAGE: 10,
		MAX_PAGES: 5,
		RECITAL_TIME: 30,
	},
};
