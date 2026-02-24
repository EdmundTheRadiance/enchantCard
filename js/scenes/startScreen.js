import { drawGameBackground } from '../utils/draw';
import { COLOR } from '../constants/theme';

/**
 * 开始界面：背景 + 标题 + 「开始游戏」按钮
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - 屏宽
 * @param {number} h - 屏高
 * @param {object} startButton - { x, y, width, height }
 */
export function drawStartScreen(ctx, w, h, startButton) {
  drawGameBackground(ctx, w, h);

  ctx.fillStyle = COLOR.primaryText;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('小丑牌', w / 2, h / 2 - 100);

  ctx.fillStyle = COLOR.primaryTextDim;
  ctx.font = '20px sans-serif';
  ctx.fillText('Balatro', w / 2, h / 2 - 58);

  const btn = startButton;
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(btn.x + r, btn.y);
  ctx.lineTo(btn.x + btn.width - r, btn.y);
  ctx.arcTo(btn.x + btn.width, btn.y, btn.x + btn.width, btn.y + r, r);
  ctx.lineTo(btn.x + btn.width, btn.y + btn.height - r);
  ctx.arcTo(btn.x + btn.width, btn.y + btn.height, btn.x + btn.width - r, btn.y + btn.height, r);
  ctx.lineTo(btn.x + r, btn.y + btn.height);
  ctx.arcTo(btn.x, btn.y + btn.height, btn.x, btn.y + btn.height - r, r);
  ctx.lineTo(btn.x, btn.y + r);
  ctx.arcTo(btn.x, btn.y, btn.x + r, btn.y, r);
  ctx.closePath();
  ctx.fillStyle = COLOR.accent;
  ctx.fill();
  ctx.strokeStyle = COLOR.primaryText;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = COLOR.buttonText;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('开始游戏', btn.x + btn.width / 2, btn.y + btn.height / 2);
}

/** 计算开始按钮布局，返回 { x, y, width, height } */
export function layoutStartButton(w, h) {
  const width = 240;
  const height = 72;
  return {
    x: w / 2 - width / 2,
    y: h / 2 - height / 2,
    width,
    height,
  };
}
