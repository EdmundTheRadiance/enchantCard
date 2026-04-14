import { drawCardFanCentered, roundRect } from '../utils/draw';
import { COLOR } from '../constants/theme';

const SORT_BTN_HEIGHT = 36;
const SORT_BTN_PADDING = 24;
const SORT_BTN_GAP = 8;
const SELECTED_OFFSET_RATIO = 0.1;

/**
 * 手牌区：手牌沿弧线排布，选中牌向外偏移 10%（使用动画进度）；下方一个排序按钮
 * @param {number[]} selectedIndices - 当前选中的牌下标
 * @param {number[]} cardDisplayOffset - 每张牌当前偏移进度 0~1，用于选中/取消动画
 * @param {number} [discardsRemaining=5] - 本局剩余弃牌次数，0 时弃牌按钮灰显
 */
export function drawHandArea(ctx, w, h, handAreaY, handAreaH, hand, sortMode, selectedIndices = [], cardDisplayOffset = [], discardsRemaining = 5) {
  const handCenterY = handAreaY + handAreaH / 2;
  const n = hand.length;

  const chordWidth = w * 0.6;
  const arcRadius = 0.95 * w;
  const arcAlpha = Math.asin(Math.min(1, chordWidth / (2 * arcRadius)));
  const arcCx = w / 2;
  const arcCy = handCenterY + arcRadius;

  const cardH = Math.floor(handAreaH * 0.4);
  const cardW = Math.floor(cardH * 0.71);

  const selectedSet = new Set(selectedIndices);
  const offsetDist = cardW * SELECTED_OFFSET_RATIO;

  const drawOne = (i) => {
    const theta = n > 1 ? -arcAlpha + (i * 2 * arcAlpha) / (n - 1) : 0;
    let centerX = arcCx + arcRadius * Math.sin(theta);
    let centerY = arcCy - arcRadius * Math.cos(theta);
    const t = cardDisplayOffset[i] ?? (selectedSet.has(i) ? 1 : 0);
    if (t > 0) {
      const ux = (centerX - arcCx) / arcRadius;
      const uy = (centerY - arcCy) / arcRadius;
      centerX += offsetDist * t * ux;
      centerY += offsetDist * t * uy;
    }
    drawCardFanCentered(ctx, centerX, centerY, cardW, cardH, hand[i], theta);
  };

  for (let i = 0; i < n; i++) drawOne(i);

  const discardRect = getDiscardButtonRect(w, handAreaY, handAreaH);
  const sortRect = getSortButtonRect(w, handAreaY, handAreaH);
  const playRect = getPlayButtonRect(w, handAreaY, handAreaH);
  const r = 8;
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const discardDisabled = discardsRemaining <= 0;
  ctx.fillStyle = discardDisabled ? '#4a4a4a' : COLOR.discardButton;
  ctx.strokeStyle = COLOR.primaryText;
  roundRect(ctx, discardRect.x, discardRect.y, discardRect.width, discardRect.height, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = discardDisabled ? '#888' : COLOR.primaryText;
  ctx.fillText(discardsRemaining <= 0 ? '弃牌(0)' : `弃牌(${discardsRemaining})`, discardRect.x + discardRect.width / 2, discardRect.y + discardRect.height / 2);

  ctx.fillStyle = COLOR.accent;
  ctx.strokeStyle = COLOR.primaryText;
  ctx.lineWidth = 2;
  roundRect(ctx, sortRect.x, sortRect.y, sortRect.width, sortRect.height, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLOR.buttonText;
  ctx.fillText(sortMode === 'rank' ? '按点数' : '按花色', sortRect.x + sortRect.width / 2, sortRect.y + sortRect.height / 2);

  ctx.fillStyle = COLOR.playButton;
  ctx.strokeStyle = COLOR.primaryText;
  roundRect(ctx, playRect.x, playRect.y, playRect.width, playRect.height, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLOR.primaryText;
  ctx.fillText('出牌', playRect.x + playRect.width / 2, playRect.y + playRect.height / 2);
}

/** 返回每张牌的位置信息（用于点击检测），与绘制时的基准位置一致 */
export function getCardPositions(w, handAreaY, handAreaH, handLength) {
  const handCenterY = handAreaY + handAreaH / 2;
  const chordWidth = w * 0.6;
  const arcRadius = 0.95 * w;
  const arcAlpha = Math.asin(Math.min(1, chordWidth / (2 * arcRadius)));
  const arcCx = w / 2;
  const arcCy = handCenterY + arcRadius;
  const cardH = Math.floor(handAreaH * 0.4);
  const cardW = Math.floor(cardH * 0.71);
  const positions = [];
  for (let i = 0; i < handLength; i++) {
    const theta = handLength > 1 ? -arcAlpha + (i * 2 * arcAlpha) / (handLength - 1) : 0;
    positions.push({
      centerX: arcCx + arcRadius * Math.sin(theta),
      centerY: arcCy - arcRadius * Math.cos(theta),
      cardW,
      cardH,
      theta,
    });
  }
  return positions;
}

/** 检测点击 (x,y) 落在哪张牌上，返回 0~n-1 或 -1 */
export function hitTestCard(positions, x, y) {
  for (let i = positions.length - 1; i >= 0; i--) {
    const { centerX, centerY, cardW, cardH, theta } = positions[i];
    const dx = x - centerX;
    const dy = y - centerY;
    const localX = dx * Math.cos(theta) + dy * Math.sin(theta) + cardW / 2;
    const localY = -dx * Math.sin(theta) + dy * Math.cos(theta) + cardH / 2;
    if (localX >= 0 && localX <= cardW && localY >= 0 && localY <= cardH) return i;
  }
  return -1;
}

/** 底部一行三按钮从左到右：弃牌 | 排序 | 出牌 */
function getButtonLayout(w, handAreaY, handAreaH) {
  const rowY = handAreaY + handAreaH - SORT_BTN_HEIGHT - 10;
  const totalW = w - 2 * SORT_BTN_PADDING;
  const singleW = (totalW - 2 * SORT_BTN_GAP) / 3;
  return { rowY, singleW };
}

/** 返回弃牌按钮的碰撞矩形（最左侧），供 main 做触摸判定 */
export function getDiscardButtonRect(w, handAreaY, handAreaH) {
  const { rowY, singleW } = getButtonLayout(w, handAreaY, handAreaH);
  return { x: SORT_BTN_PADDING, y: rowY, width: singleW, height: SORT_BTN_HEIGHT };
}

/** 返回排序按钮的碰撞矩形（中间），供 main 做触摸判定 */
export function getSortButtonRect(w, handAreaY, handAreaH) {
  const { rowY, singleW } = getButtonLayout(w, handAreaY, handAreaH);
  return { x: SORT_BTN_PADDING + singleW + SORT_BTN_GAP, y: rowY, width: singleW, height: SORT_BTN_HEIGHT };
}

/** 返回出牌按钮的碰撞矩形（最右侧），供 main 做触摸判定 */
export function getPlayButtonRect(w, handAreaY, handAreaH) {
  const { rowY, singleW } = getButtonLayout(w, handAreaY, handAreaH);
  return { x: SORT_BTN_PADDING + 2 * (singleW + SORT_BTN_GAP), y: rowY, width: singleW, height: SORT_BTN_HEIGHT };
}
