import { BACKGROUND_GRADIENT } from '../constants/theme';

/** 绘制游戏背景渐变（开始界面与对战场景共用） */
export function drawGameBackground(ctx, w, h) {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  BACKGROUND_GRADIENT.forEach(([pos, color]) => gradient.addColorStop(pos, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/** 绘制圆角矩形路径（不 fill/stroke），需由调用方 fill/stroke */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** 绘制单张扑克牌，中心 (cx, cy)，宽高 (cardW, cardH) */
export function drawCard(ctx, cx, cy, cardW, cardH, card) {
  const x = cx - cardW / 2;
  const y = cy - cardH / 2;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, cardW, cardH, 4);
  ctx.fill();
  ctx.stroke();

  const suit = card.suit;
  const rank = card.rank;
  ctx.fillStyle = suit.color;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(rank, cx, cy - cardH * 0.2);
  ctx.font = '16px sans-serif';
  ctx.fillText(suit.symbol, cx, cy);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText(rank, cx, cy + cardH * 0.28);
}

/**
 * 扇形握牌（以牌中心为支点）：中心点在弧线上，绕中心旋转，点数/花色在左上角和右下角
 */
export function drawCardFanCentered(ctx, centerX, centerY, cardW, cardH, card, angleRad) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angleRad);
  ctx.translate(-cardW / 2, -cardH / 2);
  roundRect(ctx, 0, 0, cardW, cardH, 4);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();

  const suit = card.suit;
  const rank = card.rank;
  const pad = 5;
  ctx.fillStyle = suit.color;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(rank, pad, pad);
  ctx.font = '16px sans-serif';
  ctx.fillText(suit.symbol, pad, pad + 22);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(rank, cardW - pad, cardH - pad);
  ctx.font = '16px sans-serif';
  ctx.fillText(suit.symbol, cardW - pad, cardH - pad - 22);
  ctx.restore();
}
