import { COLOR } from '../constants/theme';

/**
 * 怪物区：屏幕高度 50%，名字 + 形象占位 + 血量条；攻击时受击闪光与 Overkill；失败时怪物放大表示反击
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - 屏宽
 * @param {number} h - 屏高
 * @param {number} monsterAreaH - 怪物区高度
 * @param {object} battle - { monsterName, monsterHp, monsterHpMax, attackAnim, failureAnim }
 */
export function drawMonsterArea(ctx, w, h, monsterAreaH, battle) {
  ctx.fillStyle = COLOR.primaryText;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(battle.monsterName, w / 2, 32);

  const imgH = monsterAreaH * 0.72;
  const imgW = Math.min(w * 0.55, imgH);
  const imgSize = Math.min(imgW, imgH);
  const imgX = (w - imgSize) / 2;
  const imgY = 44;
  const centerX = imgX + imgSize / 2;
  const centerY = imgY + imgSize / 2;

  let monsterScale = 1;
  const fail = battle.failureAnim;
  if (fail?.active && fail.progress < 0.35) {
    monsterScale = fail.progress < 0.2 ? 1 + 1.2 * (fail.progress / 0.2) : 2.2;
  }
  ctx.save();
  if (monsterScale !== 1) {
    ctx.translate(centerX, centerY);
    ctx.scale(monsterScale, monsterScale);
    ctx.translate(-centerX, -centerY);
  }
  ctx.fillStyle = COLOR.monsterImg;
  ctx.strokeStyle = COLOR.accent;
  ctx.lineWidth = 2;
  ctx.fillRect(imgX, imgY, imgSize, imgSize);
  ctx.strokeRect(imgX, imgY, imgSize, imgSize);
  ctx.fillStyle = COLOR.monsterImgIcon;
  ctx.font = `${Math.floor(imgSize * 0.42)}px sans-serif`;
  ctx.fillText('\uD83D\uDC79', w / 2, imgY + imgSize / 2);
  ctx.restore();

  // 攻击效果全部绘制在怪物图片上，表示受到伤害的是怪物
  const atk = battle.attackAnim;
  if (atk?.active && atk.progress >= 0.08 && atk.progress <= 0.55) {
    const hitPeak = 0.2;
    const dist = Math.abs(atk.progress - hitPeak);
    const hitAlpha = atk.isOverkill
      ? Math.max(0, 0.7 * (1 - dist / 0.25))
      : Math.max(0, 0.5 * (1 - dist / 0.2));
    if (hitAlpha > 0) {
      ctx.fillStyle = atk.isOverkill ? `rgba(255, 50, 30, ${hitAlpha})` : `rgba(255, 255, 240, ${hitAlpha})`;
      ctx.fillRect(imgX, imgY, imgSize, imgSize);
    }
    if (atk.isOverkill && atk.progress >= 0.15 && atk.progress <= 0.5) {
      const glowAlpha = 0.25 * (1 - Math.abs(atk.progress - 0.28) / 0.22);
      if (glowAlpha > 0) {
        ctx.strokeStyle = `rgba(255, 80, 60, ${glowAlpha})`;
        ctx.lineWidth = 8;
        ctx.strokeRect(imgX + 4, imgY + 4, imgSize - 8, imgSize - 8);
      }
    }
    ctx.strokeStyle = COLOR.accent;
    ctx.lineWidth = 2;
  }
  if (atk?.active && atk.isOverkill && atk.progress >= 0.25 && atk.progress <= 0.7) {
    const textAlpha = atk.progress < 0.4 ? (atk.progress - 0.25) / 0.15 : Math.max(0, (0.7 - atk.progress) / 0.3);
    ctx.save();
    ctx.globalAlpha = textAlpha;
    ctx.fillStyle = '#ff4444';
    ctx.strokeStyle = '#1a0a2e';
    ctx.lineWidth = 4;
    ctx.font = 'bold 28px sans-serif';
    ctx.strokeText('OVERKILL', w / 2, imgY + imgSize / 2 - 8);
    ctx.fillText('OVERKILL', w / 2, imgY + imgSize / 2 - 8);
    ctx.restore();
  }

  const barW = w * 0.7;
  const barX = (w - barW) / 2;
  const barY = imgY + imgSize + 12;
  const barHeight = 14;
  ctx.fillStyle = COLOR.hpBarBg;
  ctx.fillRect(barX, barY, barW, barHeight);
  const hpRatio = Math.max(0, battle.monsterHp / battle.monsterHpMax);
  ctx.fillStyle = hpRatio > 0.5 ? COLOR.hpHigh : hpRatio > 0.25 ? COLOR.hpMid : COLOR.primaryText;
  ctx.fillRect(barX, barY, barW * hpRatio, barHeight);
  ctx.strokeStyle = COLOR.primaryText;
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barHeight);
  ctx.fillStyle = COLOR.primaryText;
  ctx.font = '12px sans-serif';
  ctx.fillText(`${battle.monsterHp} / ${battle.monsterHpMax}`, w / 2, barY + barHeight + 12);
}
