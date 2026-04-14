import { drawGameBackground, roundRect } from '../utils/draw';
import { COLOR } from '../constants/theme';
import { ENCHANT_TIER_COLOR } from '../enchant/constants';

const AREA_HEIGHT_RATIO = 0.4;
const TOP_BOTTOM_MARGIN_RATIO = 0.06;
const ENCHANT_BUTTON_HEIGHT_RATIO = 0.08;
const ENCHANT_BUTTON_WIDTH = 160;

/**
 * 商店场景：选牌区、功能区、附魔按钮。选牌区与功能区各占屏高 40%，附魔按钮在功能区下方，上下留白相同。
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w - 屏宽
 * @param {number} h - 屏高
 * @param {object} shop - { options, selectedOptionIndex, functionOptions, selectedFunctionIndex }
 */
export function drawShopScene(ctx, w, h, shop) {
  drawGameBackground(ctx, w, h);

  const topMargin = h * TOP_BOTTOM_MARGIN_RATIO;
  const areaH = h * AREA_HEIGHT_RATIO;
  const cardAreaY = topMargin;
  const functionAreaY = topMargin + areaH;
  const enchantZoneY = topMargin + areaH * 2;
  const enchantZoneH = h * ENCHANT_BUTTON_HEIGHT_RATIO;
  const buttonH = Math.min(48, enchantZoneH * 0.9);
  const enchantButtonY = enchantZoneY + (enchantZoneH - buttonH) / 2;

  drawCardSelectionArea(ctx, w, cardAreaY, areaH, shop.options, shop.selectedOptionIndex);
  drawFunctionArea(ctx, w, functionAreaY, areaH, shop.functionOptions || [], shop.selectedFunctionIndex ?? -1);
  drawEnchantButton(ctx, w, enchantButtonY, buttonH);
}

/** 选牌区：标题 + 4 个选项（随机一张A/K/…/2 或 随机一张黑桃/…/方片），2×2 排列；选项与边框留空，选项为按钮样式，区分选中/未选中 */
function drawCardSelectionArea(ctx, w, areaY, areaH, options, selectedOptionIndex) {
  const padding = 16;
  const innerPadding = 24;
  const titleH = 32;
  const boxY = areaY + padding;
  const boxH = areaH - padding * 2;
  const innerY = boxY + titleH + 8 + innerPadding;
  const innerW = w - padding * 2 - innerPadding * 2;
  const innerH = boxH - titleH - 16 - innerPadding * 2;

  ctx.fillStyle = COLOR.scoreBox;
  ctx.strokeStyle = COLOR.primaryText;
  ctx.lineWidth = 2;
  roundRect(ctx, padding, boxY, w - padding * 2, boxH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLOR.primaryText;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('请选择一种牌进行附魔', w / 2, boxY + titleH / 2 + 8);

  const n = options.length;
  if (n === 0) {
    ctx.fillStyle = COLOR.primaryTextDim;
    ctx.font = '14px sans-serif';
    ctx.fillText('暂无可选牌', w / 2, innerY + innerH / 2);
    return;
  }

  const gap = 14;
  const cols = 2;
  const rows = 2;
  const optionW = (innerW - gap) / cols;
  const optionH = (innerH - gap) / rows;
  const contentW = cols * optionW + gap;
  const contentH = rows * optionH + gap;
  const leftEdge = padding + innerPadding + (innerW - contentW) / 2;
  const topEdge = innerY + (innerH - contentH) / 2;
  const optionRadius = 10;

  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rectX = leftEdge + col * (optionW + gap);
    const rectY = topEdge + row * (optionH + gap);
    const cx = rectX + optionW / 2;
    const cy = rectY + optionH / 2;
    const opt = options[i];
    const selected = selectedOptionIndex === i;
    if (selected) {
      ctx.fillStyle = COLOR.accent;
      ctx.strokeStyle = COLOR.primaryText;
      ctx.lineWidth = 2;
      roundRect(ctx, rectX, rectY, optionW, optionH, optionRadius);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLOR.buttonText;
      ctx.font = 'bold 18px sans-serif';
    } else {
      ctx.fillStyle = COLOR.discardButton;
      ctx.strokeStyle = COLOR.primaryText;
      ctx.lineWidth = 1.5;
      roundRect(ctx, rectX, rectY, optionW, optionH, optionRadius);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLOR.primaryText;
      ctx.font = '18px sans-serif';
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const line1 = '随机一张';
    const line2 = opt.label.length > 4 ? opt.label.substring(4) : opt.label;
    const lineHeight = 22;
    ctx.fillText(line1, cx, cy - lineHeight / 2);
    ctx.fillText(line2, cx, cy + lineHeight / 2);
  }
}

/** 将长文案按每行最多 maxChars 字拆成两行（用于功能区选项） */
function wrapLabel(label, maxChars = 10) {
  if (label.length <= maxChars) return [label, ''];
  return [label.slice(0, maxChars), label.slice(maxChars)];
}

/** 功能区：标题 + 4 个附魔效果选项（2×2），来自 js/enchant/catalog；选项与边框留空，按钮样式，区分选中/未选中 */
function drawFunctionArea(ctx, w, areaY, areaH, functionOptions, selectedFunctionIndex) {
  const padding = 16;
  const innerPadding = 24;
  const titleH = 32;
  const boxY = areaY + padding;
  const boxH = areaH - padding * 2;
  const innerY = boxY + titleH + 8 + innerPadding;
  const innerW = w - padding * 2 - innerPadding * 2;
  const innerH = boxH - titleH - 16 - innerPadding * 2;

  ctx.fillStyle = COLOR.scoreBox;
  ctx.strokeStyle = COLOR.primaryText;
  ctx.lineWidth = 2;
  roundRect(ctx, padding, boxY, w - padding * 2, boxH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = COLOR.primaryText;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('请选择一种附魔效果', w / 2, boxY + titleH / 2 + 8);

  const n = functionOptions.length;
  if (n === 0) {
    ctx.fillStyle = COLOR.primaryTextDim;
    ctx.font = '14px sans-serif';
    ctx.fillText('暂无可选效果', w / 2, innerY + innerH / 2);
    return;
  }

  const gap = 14;
  const cols = 2;
  const rows = 2;
  const optionW = (innerW - gap) / cols;
  const optionH = (innerH - gap) / rows;
  const contentW = cols * optionW + gap;
  const contentH = rows * optionH + gap;
  const leftEdge = padding + innerPadding + (innerW - contentW) / 2;
  const topEdge = innerY + (innerH - contentH) / 2;
  const optionRadius = 10;
  const lineHeight = 14;

  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rectX = leftEdge + col * (optionW + gap);
    const rectY = topEdge + row * (optionH + gap);
    const cx = rectX + optionW / 2;
    const cy = rectY + optionH / 2;
    const opt = functionOptions[i];
    const selected = selectedFunctionIndex === i;
    const tierColor = (opt.tier && ENCHANT_TIER_COLOR[opt.tier]) ? ENCHANT_TIER_COLOR[opt.tier] : COLOR.primaryText;
    const [line1, line2] = wrapLabel(opt.label, 10);
    if (selected) {
      ctx.fillStyle = COLOR.accent;
      ctx.strokeStyle = tierColor;
      ctx.lineWidth = 2.5;
      roundRect(ctx, rectX, rectY, optionW, optionH, optionRadius);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLOR.buttonText;
      ctx.font = 'bold 12px sans-serif';
    } else {
      ctx.fillStyle = COLOR.discardButton;
      ctx.strokeStyle = tierColor;
      ctx.lineWidth = 2;
      roundRect(ctx, rectX, rectY, optionW, optionH, optionRadius);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COLOR.primaryText;
      ctx.font = '12px sans-serif';
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (line2) {
      ctx.fillText(line1, cx, cy - lineHeight / 2);
      ctx.fillText(line2, cx, cy + lineHeight / 2);
    } else {
      ctx.fillText(line1, cx, cy);
    }
  }
}

/** 附魔按钮 */
function drawEnchantButton(ctx, w, buttonY, buttonH) {
  const x = (w - ENCHANT_BUTTON_WIDTH) / 2;
  const y = buttonY;
  const r = 10;
  ctx.fillStyle = COLOR.accent;
  ctx.strokeStyle = COLOR.primaryText;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, ENCHANT_BUTTON_WIDTH, buttonH, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLOR.buttonText;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('附魔', w / 2, y + buttonH / 2);
}

/** 附魔按钮碰撞矩形，供 main 做触摸判定（与绘制布局一致：功能区下方、上下留白相同） */
export function getEnchantButtonRect(w, h) {
  const topMargin = h * TOP_BOTTOM_MARGIN_RATIO;
  const areaH = h * AREA_HEIGHT_RATIO;
  const enchantZoneY = topMargin + areaH * 2;
  const enchantZoneH = h * ENCHANT_BUTTON_HEIGHT_RATIO;
  const buttonH = Math.min(48, enchantZoneH * 0.9);
  const y = enchantZoneY + (enchantZoneH - buttonH) / 2;
  return {
    x: (w - ENCHANT_BUTTON_WIDTH) / 2,
    y,
    width: ENCHANT_BUTTON_WIDTH,
    height: buttonH,
  };
}

/** 选牌区选项布局与碰撞（2×2，与绘制一致：innerPadding、选项与边框留空）：返回 (x,y) 落在哪个选项的下标 0~3，-1 表示未命中 */
export function getShopOptionIndexAt(w, h, options, x, y) {
  const topMargin = h * TOP_BOTTOM_MARGIN_RATIO;
  const areaH = h * AREA_HEIGHT_RATIO;
  const cardAreaY = topMargin;
  const padding = 16;
  const innerPadding = 24;
  const titleH = 32;
  const boxY = cardAreaY + padding;
  const boxH = areaH - padding * 2;
  const innerY = boxY + titleH + 8 + innerPadding;
  const innerW = w - padding * 2 - innerPadding * 2;
  const innerH = boxH - titleH - 16 - innerPadding * 2;
  const n = options.length;
  if (n === 0) return -1;
  const gap = 14;
  const cols = 2;
  const rows = 2;
  const optionW = (innerW - gap) / cols;
  const optionH = (innerH - gap) / rows;
  const contentW = cols * optionW + gap;
  const contentH = rows * optionH + gap;
  const leftEdge = padding + innerPadding + (innerW - contentW) / 2;
  const topEdge = innerY + (innerH - contentH) / 2;
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rectX = leftEdge + col * (optionW + gap);
    const rectY = topEdge + row * (optionH + gap);
    if (x >= rectX && x <= rectX + optionW && y >= rectY && y <= rectY + optionH) return i;
  }
  return -1;
}

/** 功能区选项布局与碰撞（2×2，与绘制一致）：返回 (x,y) 落在哪个选项的下标 0~3，-1 表示未命中 */
export function getShopFunctionOptionIndexAt(w, h, functionOptions, x, y) {
  const topMargin = h * TOP_BOTTOM_MARGIN_RATIO;
  const areaH = h * AREA_HEIGHT_RATIO;
  const functionAreaY = topMargin + areaH;
  const padding = 16;
  const innerPadding = 24;
  const titleH = 32;
  const boxY = functionAreaY + padding;
  const boxH = areaH - padding * 2;
  const innerY = boxY + titleH + 8 + innerPadding;
  const innerW = w - padding * 2 - innerPadding * 2;
  const innerH = boxH - titleH - 16 - innerPadding * 2;
  const n = functionOptions.length;
  if (n === 0) return -1;
  const gap = 14;
  const cols = 2;
  const rows = 2;
  const optionW = (innerW - gap) / cols;
  const optionH = (innerH - gap) / rows;
  const contentW = cols * optionW + gap;
  const contentH = rows * optionH + gap;
  const leftEdge = padding + innerPadding + (innerW - contentW) / 2;
  const topEdge = innerY + (innerH - contentH) / 2;
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rectX = leftEdge + col * (optionW + gap);
    const rectY = topEdge + row * (optionH + gap);
    if (x >= rectX && x <= rectX + optionW && y >= rectY && y <= rectY + optionH) return i;
  }
  return -1;
}
