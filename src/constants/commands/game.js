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
};
