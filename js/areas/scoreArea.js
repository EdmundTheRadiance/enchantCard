import { roundRect } from '../utils/draw';
import { COLOR } from '../constants/theme';

/**
 * 计分区：屏幕高度 15%，筹码 + 倍率
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - 屏宽
 * @param {number} h - 屏高
 * @param {number} scoreAreaY - 计分区顶部 Y
 * @param {number} scoreAreaH - 计分区高度
 * @param {object} battle - { chips, mult }
 */
export function drawScoreArea(ctx, w, h, scoreAreaY, scoreAreaH, battle) {
  const scoreBoxW = w * 0.88;
  const scoreBoxH = scoreAreaH - 16;
  const scoreBoxX = (w - scoreBoxW) / 2;
  const scoreBoxY = scoreAreaY + 8;
  const midY = scoreBoxY + scoreBoxH / 2;
  ctx.fillStyle = COLOR.scoreBox;
  ctx.strokeStyle = COLOR.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 10);
  ctx.fill();
  ctx.stroke();

  const leftCenterX = scoreBoxX + scoreBoxW * 0.25;
  const centerX = scoreBoxX + scoreBoxW * 0.5;
  const rightCenterX = scoreBoxX + scoreBoxW * 0.75;

  ctx.fillStyle = COLOR.primaryText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '16px sans-serif';
  ctx.fillText('筹码', leftCenterX, midY - 10);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(String(battle.chips), leftCenterX, midY + 10);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('×', centerX, midY);
  ctx.font = '16px sans-serif';
  ctx.fillText('倍率', rightCenterX, midY - 10);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(String(battle.mult), rightCenterX, midY + 10);

  if (battle.lastHandName != null) {
    ctx.font = '12px sans-serif';
    ctx.fillStyle = COLOR.primaryTextDim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const scoreText = `牌型: ${battle.lastHandName}  分数: ${battle.lastScore ?? battle.chips * battle.mult}`;
    ctx.fillText(scoreText, scoreBoxX + scoreBoxW / 2, scoreBoxY + scoreBoxH - 8);
  }
}
