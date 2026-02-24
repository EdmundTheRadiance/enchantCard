/**
 * 附魔牌风格主题色与背景配置，供各场景/区域统一使用
 */
export const COLOR = {
  bgDark: '#1a0a2e',
  bgMid: '#16213e',
  bgBottom: '#0f0f23',
  primaryText: '#e8d5b7',
  primaryTextDim: 'rgba(232, 213, 183, 0.7)',
  accent: '#c9a227',
  arc: '#e83e3e',
  hpHigh: '#c41e3a',
  hpMid: '#e8a030',
  scoreBox: 'rgba(40, 30, 60, 0.85)',
  monsterImg: 'rgba(60, 40, 80, 0.9)',
  monsterImgIcon: 'rgba(232, 213, 183, 0.6)',
  hpBarBg: 'rgba(80, 40, 40, 0.9)',
  buttonText: '#1a0a2e',
  playButton: '#c41e3a',
  discardButton: '#6b7280',
};

/** 背景渐变：用于开始界面与对战场景 */
export const BACKGROUND_GRADIENT = [
  [0, COLOR.bgDark],
  [0.5, COLOR.bgMid],
  [1, COLOR.bgBottom],
];
