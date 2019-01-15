const { strong } = require('@/utils/markdown');
const EMOJI = require('@/constants/emoji');


module.exports = {
	HANGANG: {
		CMD: '한강물',
		DESC: '한강물 온도를 확인한다냥!',
		URL: 'http://hangang.dkserver.wo.tc/',
		DATE: date => `${date} GMT+0900`,
		RESULT: temperature => `${EMOJI.THERMOMETER} 현재 한강 수온은 ${strong(temperature)}℃ 다냥!`,
	},
};
