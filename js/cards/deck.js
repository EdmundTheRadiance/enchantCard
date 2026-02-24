import { SUITS, RANKS } from './constants';

/** 牌堆类型：抽牌堆、手牌堆、弃牌堆。每张牌只存在于其中一个堆中。 */
export const PILE = {
  DRAW: 'draw',   // 抽牌堆
  HAND: 'hand',   // 手牌堆
  DISCARD: 'discard', // 弃牌堆
};

/** 游戏开始时的手牌数量：从抽牌堆抽取该张数进入手牌堆 */
export const INITIAL_HAND_SIZE = 10;

/** Fisher-Yates 洗牌（不修改原数组，返回新数组） */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 创建一副牌并洗牌，返回新数组（作为初始抽牌堆使用） */
export function createShuffledDeck() {
  const deck = [];
  for (let s = 0; s < SUITS.length; s++) {
    for (let r = 0; r < RANKS.length; r++) {
      deck.push({ suitIndex: s, rankIndex: r, suit: SUITS[s], rank: RANKS[r] });
    }
  }
  return shuffleArray(deck);
}

/**
 * 从抽牌堆顶部取牌
 * @param {Array} drawPile - 抽牌堆（会被修改）
 * @param {number} count - 要抽取的张数
 * @returns {Array} 取出的牌（按顺序）
 */
export function drawFromDrawPile(drawPile, count) {
  const n = Math.min(count, drawPile.length);
  return drawPile.splice(0, n);
}

/**
 * 从抽牌堆抽取 count 张牌到手牌；抽牌堆不足时执行「抽一轮牌」：
 * 先将抽牌堆剩余全部抽入手牌，再将弃牌堆洗牌后放入抽牌堆，然后继续抽直到凑满 count 或无牌可抽。
 * @param {Array} drawPile - 抽牌堆（会被修改）
 * @param {Array} discardPile - 弃牌堆（会被修改）
 * @param {Array} hand - 手牌堆（会被修改，牌追加到末尾）
 * @param {number} count - 需要抽取的张数
 * @returns {number} 实际抽到手牌的张数
 */
export function drawToHandWithReshuffle(drawPile, discardPile, hand, count) {
  let added = 0;
  while (added < count) {
    if (drawPile.length >= count - added) {
      const take = count - added;
      hand.push(...drawPile.splice(0, take));
      return added + take;
    }
    if (drawPile.length > 0) {
      const n = drawPile.length;
      hand.push(...drawPile.splice(0, n));
      added += n;
    }
    if (discardPile.length > 0) {
      drawPile.push(...shuffleArray(discardPile));
      discardPile.length = 0;
    } else {
      return added;
    }
  }
  return added;
}

/**
 * 将手牌中选中的牌移到弃牌堆
 * @param {Array} hand - 手牌堆（会被修改）
 * @param {number[]} selectedIndices - 选中的牌在手牌中的下标（升序）
 * @param {Array} discardPile - 弃牌堆（会被修改，牌追加到堆顶/末尾）
 */
export function moveToDiscardPile(hand, selectedIndices, discardPile) {
  const indices = [...selectedIndices].sort((a, b) => b - a);
  for (const i of indices) {
    const card = hand.splice(i, 1)[0];
    if (card) discardPile.push(card);
  }
}

/** 游戏开始时从抽牌堆抽取手牌数量张牌进入手牌堆 */
export function drawHandFromDeck(drawPile) {
  return drawFromDrawPile(drawPile, INITIAL_HAND_SIZE);
}

/** 点数排序权值：A 最大=14，K=13…2 最小=2（大牌在左） */
function rankSortValue(rankIndex) {
  return rankIndex === 0 ? 14 : rankIndex + 1;
}

/**
 * 手牌排序：按点数（同点按花色）或按花色（同花按点数 A>K>…>2）
 * @param {Array} hand - 手牌数组，每张牌含 suitIndex, rankIndex
 * @param {'rank'|'suit'} mode - 'rank' 先按点数降序，同点数按花色；'suit' 先按花色，同花色按点数降序
 */
export function sortHand(hand, mode) {
  if (mode === 'rank') {
    hand.sort((a, b) => {
      const va = rankSortValue(a.rankIndex);
      const vb = rankSortValue(b.rankIndex);
      return vb !== va ? vb - va : a.suitIndex - b.suitIndex;
    });
  } else {
    hand.sort((a, b) => {
      if (a.suitIndex !== b.suitIndex) return a.suitIndex - b.suitIndex;
      const va = rankSortValue(a.rankIndex);
      const vb = rankSortValue(b.rankIndex);
      return vb - va;
    });
  }
  return hand;
}
