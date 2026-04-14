import { drawGameBackground, roundRect } from '../utils/draw';
import { COLOR } from '../constants/theme';
import { drawMonsterArea } from '../areas/monsterArea';
import { drawScoreArea } from '../areas/scoreArea';
import { drawHandArea } from '../areas/handArea';

/** 对战场景背景（与开始界面共用渐变） */
export function drawBattleBackground(ctx, w, h) {
  drawGameBackground(ctx, w, h);
}

/**
 * 根据攻击动画进度计算本帧屏幕震动偏移（弱击/强击）
 */
function getAttackShake(attackAnim) {
  if (!attackAnim?.active) return { x: 0, y: 0 };
  const p = attackAnim.progress;
  if (p < 0.1 || p > 0.55) return { x: 0, y: 0 };
  const peak = 0.22;
  const decay = Math.max(0, 1 - (p - peak) / 0.35);
  const magnitude = attackAnim.isOverkill ? 14 : 4;
  const t = p * 50;
  return {
    x: Math.sin(t * 2.1) * magnitude * decay,
    y: Math.cos(t * 1.7) * magnitude * decay,
  };
}

/**
 * 失败流程：玩家受击时的全屏猛烈震动（progress 0.2~0.5）
 */
function getFailureShake(failureAnim) {
  if (!failureAnim?.active) return { x: 0, y: 0 };
  const p = failureAnim.progress;
  if (p < 0.2 || p > 0.52) return { x: 0, y: 0 };
  const peak = 0.35;
  const decay = Math.max(0, 1 - Math.abs(p - peak) / 0.2);
  const magnitude = 22;
  const t = p * 80;
  return {
    x: Math.sin(t * 2.3) * magnitude * decay,
    y: Math.cos(t * 1.9) * magnitude * decay,
  };
}

/**
 * 失败流程：玩家受击时的全屏红色闪光透明度（progress 0.2~0.5）
 */
function getFailureFlashAlpha(failureAnim) {
  if (!failureAnim?.active) return 0;
  const p = failureAnim.progress;
  if (p < 0.22 || p > 0.5) return 0;
  const peak = 0.32;
  const dist = Math.abs(p - peak);
  return Math.max(0, 0.75 * (1 - dist / 0.18));
}

/**
 * 对战场景：背景 + 怪物区 + 计分区 + 手牌区；攻击时震动与怪物受击；失败时全屏受击后展示「失败」
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - 屏宽
 * @param {number} h - 屏高
 * @param {object} battle - 对战状态（含 attackAnim, failureAnim, failed）
 */
export function drawBattleScene(ctx, w, h, battle) {
  const shakeAttack = getAttackShake(battle.attackAnim);
  const shakeFailure = getFailureShake(battle.failureAnim);
  const shake = { x: shakeAttack.x + shakeFailure.x, y: shakeAttack.y + shakeFailure.y };
  ctx.save();
  ctx.translate(shake.x, shake.y);

  drawBattleBackground(ctx, w, h);

  const monsterAreaH = h * 0.5;
  const scoreAreaH = h * 0.15;
  const handAreaH = h * 0.35;
  const scoreAreaY = monsterAreaH;
  const handAreaY = monsterAreaH + scoreAreaH;

  drawMonsterArea(ctx, w, h, monsterAreaH, battle);
  drawScoreArea(ctx, w, h, scoreAreaY, scoreAreaH, battle);
  drawHandArea(ctx, w, h, handAreaY, handAreaH, battle.hand, battle.sortMode, battle.selectedCardIndices, battle.cardDisplayOffset, battle.discardsRemaining);

  ctx.restore();

  const flashAlpha = getFailureFlashAlpha(battle.failureAnim);
  if (flashAlpha > 0) {
    ctx.fillStyle = 'rgba(180, 20, 20, ' + flashAlpha + ')';
    ctx.fillRect(0, 0, w, h);
  }

  const showFailure = battle.failed || (battle.failureAnim?.active && battle.failureAnim.progress >= 0.5);
  if (showFailure) {
    const p = battle.failureAnim?.progress ?? 1;
    const fadeIn = p >= 0.5 ? Math.min(1, (p - 0.5) / 0.2) : 0;
    ctx.fillStyle = 'rgba(0, 0, 0, ' + 0.6 * fadeIn + ')';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = '#e8d5b7';
    ctx.strokeStyle = '#c41e3a';
    ctx.lineWidth = 4;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('失败', w / 2, h / 2 - 40);
    ctx.fillText('失败', w / 2, h / 2 - 40);
    const retryRect = getRetryButtonRect(w, h);
    ctx.fillStyle = COLOR.playButton;
    ctx.strokeStyle = COLOR.primaryText;
    ctx.lineWidth = 2;
    roundRect(ctx, retryRect.x, retryRect.y, retryRect.width, retryRect.height, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLOR.buttonText;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('再来一次', retryRect.x + retryRect.width / 2, retryRect.y + retryRect.height / 2);
    ctx.restore();
  }
}

/** 失败界面「再来一次」按钮的碰撞矩形，供 main 做点击判定 */
export function getRetryButtonRect(w, h) {
  const width = 200;
  const height = 52;
  return {
    x: (w - width) / 2,
    y: h / 2 + 20,
    width,
    height,
  };
}
