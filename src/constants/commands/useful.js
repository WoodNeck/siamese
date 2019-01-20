const dedent = require('@/utils/dedent');
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
	BMI: {
		CMD: '비만도',
		DESC: '비만도를 측정한다냥!',
		USAGE: '키 몸무게',
		HEIGHT_MIN: 1,
		WEIGHT_MIN: 1,
		HEIGHT_MAX: 250,
		WEIGHT_MAX: 600,
		DIALOGUE_HEIGHT: {
			TITLE: '먼저 키를 알려달라냥!',
			DESC: '키가 몇 cm냥? 숫자만 알려주면 된다냥!',
			FOOTER: '예) 180',
		},
		DIALOGUE_WEIGHT: {
			TITLE: '다음은 몸무게를 알려달라냥!',
			DESC: '몸무게는 몇 kg이냥? 숫자만 알려주면 된다냥!',
			FOOTER: '예) 75',
		},
		CONVERSATION_TIME: 30,
		CLASS: {
			UNDERWEIGHT: {
				name: '저체중',
				max: 18.5,
			},
			NORMAL: {
				name: '정상',
				max: 23,
			},
			OVERWEIGHT: {
				name: '과체중',
				max: 25,
			},
			OBESE_1: {
				name: '1단계 비만',
				max: 30,
			},
			OBESE_2: {
				name: '2단계 비만',
				max: 35,
			},
			OBESE_3: {
				name: '고도비만',
				max: Infinity,
			},
		},
		RESULT: {
			TITLE: '비만도 정보다냥!',
			DESC: (height, weight, bmi, className) => dedent`
				${EMOJI.RULER} 키: ${height.toFixed(1)}cm
				${EMOJI.SCALES} 몸무게: ${weight.toFixed(1)}kg
				${EMOJI.BAR_CHART} BMI 측정값: ${bmi.toFixed(1)}
				${EMOJI.GREEN_CHECK} 비만도: ${strong(className)}`,
		},
	},
};
