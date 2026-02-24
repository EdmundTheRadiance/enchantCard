/**
 * 牌型：德州扑克 + 五条/同花葫芦/同花五条
 * 从大到小：同花五条 > 同花葫芦 > 五条 > 皇家同花顺 > 同花顺 > 四条 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 一对 > 高牌
 * 顺子：仅当恰好五张牌且点数连续时成立（三张/四张连续不算顺子）。
 */
export const HAND_TYPES = {
  FLUSH_FIVE_OF_A_KIND: 'flush_five_of_a_kind',
  FLUSH_FULL_HOUSE: 'flush_full_house',
  FIVE_OF_A_KIND: 'five_of_a_kind',
  ROYAL_FLUSH: 'royal_flush',
  STRAIGHT_FLUSH: 'straight_flush',
  FOUR_OF_A_KIND: 'four_of_a_kind',
  FULL_HOUSE: 'full_house',
  FLUSH: 'flush',
  STRAIGHT: 'straight',
  THREE_OF_A_KIND: 'three_of_a_kind',
  TWO_PAIR: 'two_pair',
  ONE_PAIR: 'one_pair',
  HIGH_CARD: 'high_card',
};

/** 各牌型默认基础筹码与倍率（按牌型强度递增） */
export const HAND_TYPE_CONFIG = {
  [HAND_TYPES.HIGH_CARD]: { name: '高牌', chips: 5, mult: 1 },
  [HAND_TYPES.ONE_PAIR]: { name: '一对', chips: 10, mult: 2 },
  [HAND_TYPES.TWO_PAIR]: { name: '两对', chips: 20, mult: 2 },
  [HAND_TYPES.THREE_OF_A_KIND]: { name: '三条', chips: 30, mult: 3 },
  [HAND_TYPES.STRAIGHT]: { name: '顺子', chips: 30, mult: 4 },
  [HAND_TYPES.FLUSH]: { name: '同花', chips: 35, mult: 4 },
  [HAND_TYPES.FULL_HOUSE]: { name: '葫芦', chips: 40, mult: 4 },
  [HAND_TYPES.FOUR_OF_A_KIND]: { name: '四条', chips: 60, mult: 7 },
  [HAND_TYPES.STRAIGHT_FLUSH]: { name: '同花顺', chips: 100, mult: 8 },
  [HAND_TYPES.ROYAL_FLUSH]: { name: '皇家同花顺', chips: 100, mult: 8 },
  [HAND_TYPES.FIVE_OF_A_KIND]: { name: '五条', chips: 120, mult: 12 },
  [HAND_TYPES.FLUSH_FULL_HOUSE]: { name: '同花葫芦', chips: 140, mult: 14 },
  [HAND_TYPES.FLUSH_FIVE_OF_A_KIND]: { name: '同花五条', chips: 160, mult: 16 },
};

/** 将 rankIndex 转为点数权值（A=14, 2=2, ..., K=13），顺子时 A 可当 1 */
function rankValue(rankIndex) {
  return rankIndex === 0 ? 14 : rankIndex + 1;
}

/**
 * 根据牌型取出「计分的牌」（只计构成牌型的那部分牌的点数）
 * 如三条只取三张相同点数的牌，两对取两对共四张，高牌只取最大的一张。
 */
function getScoringCards(cards, handType, rankCounts) {
  if (cards.length === 0) return [];
  const rv = (c) => rankValue(c.rankIndex);
  const byRank = (ri) => cards.filter((c) => c.rankIndex === ri);
  switch (handType) {
    case HAND_TYPES.HIGH_CARD: {
      const best = cards.slice().sort((a, b) => rv(b) - rv(a))[0];
      return [best];
    }
    case HAND_TYPES.ONE_PAIR:
      return byRank(rankCounts[0][1]);
    case HAND_TYPES.TWO_PAIR:
      return [...byRank(rankCounts[0][1]), ...byRank(rankCounts[1][1])];
    case HAND_TYPES.THREE_OF_A_KIND:
      return byRank(rankCounts[0][1]);
    case HAND_TYPES.STRAIGHT:
    case HAND_TYPES.FLUSH:
    case HAND_TYPES.FULL_HOUSE:
    case HAND_TYPES.STRAIGHT_FLUSH:
    case HAND_TYPES.ROYAL_FLUSH:
    case HAND_TYPES.FIVE_OF_A_KIND:
    case HAND_TYPES.FLUSH_FULL_HOUSE:
    case HAND_TYPES.FLUSH_FIVE_OF_A_KIND:
      return cards.slice();
    case HAND_TYPES.FOUR_OF_A_KIND:
      return byRank(rankCounts[0][1]);
    default:
      return cards.slice();
  }
}

/** 在基础筹码上加上计分牌的点数，返回最终筹码 */
function chipsWithScoringPoints(cards, handType, rankCounts, baseChips) {
  const scoring = getScoringCards(cards, handType, rankCounts);
  const add = scoring.reduce((sum, c) => sum + rankValue(c.rankIndex), 0);
  return baseChips + add;
}

/** 取牌面点数列表（用于顺子判断，A 可当 1 或 14） */
function rankValuesForStraight(rankIndexes) {
  const vals = rankIndexes.map((r) => (r === 0 ? 14 : r + 1));
  if (vals.includes(14)) vals.push(1);
  return [...new Set(vals)].sort((a, b) => a - b);
}

/** 是否形成顺子（连续点数），vals 已去重并排序 */
function isStraightValues(vals, needLen) {
  if (vals.length < needLen) return false;
  for (let i = 0; i <= vals.length - needLen; i++) {
    let ok = true;
    for (let j = 1; j < needLen; j++) {
      if (vals[i + j] - vals[i] !== j) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

/** 统计各点数出现次数，返回降序的 [count, rankIndex][] */
function countRanks(cards) {
  const count = {};
  cards.forEach((c) => {
    count[c.rankIndex] = (count[c.rankIndex] || 0) + 1;
  });
  return Object.entries(count)
    .map(([r, n]) => [Number(n), Number(r)])
    .sort((a, b) => b[0] - a[0] || b[1] - a[1]);
}

/** 是否同花 */
function isFlush(cards) {
  const s = cards[0].suitIndex;
  return cards.every((c) => c.suitIndex === s);
}

/**
 * 评估选中的牌组成的牌型，返回 { handType, handTypeName, chips, mult }
 * @param {Array} cards - 选中的牌，每张 { suitIndex, rankIndex }
 */
export function evaluateHand(cards) {
  const n = cards.length;
  if (n === 0) return { handType: HAND_TYPES.HIGH_CARD, handTypeName: '无牌', chips: 0, mult: 1 };

  const rankCounts = countRanks(cards);
  const flush = isFlush(cards);
  const rankIndexes = cards.map((c) => c.rankIndex);
  const straightVals = rankValuesForStraight(rankIndexes);
  const straight = isStraightValues(straightVals, n);

  if (n >= 5) {
    const five = rankCounts[0]?.[0] === 5;
    const four = rankCounts[0]?.[0] === 4;
    const three = rankCounts[0]?.[0] === 3;
    const two1 = rankCounts[0]?.[0] === 2;
    const two2 = rankCounts[1]?.[0] === 2;

    let handType;
    if (five && flush) handType = HAND_TYPES.FLUSH_FIVE_OF_A_KIND;
    else if (five) handType = HAND_TYPES.FIVE_OF_A_KIND;
    else if (three && two2 && flush) handType = HAND_TYPES.FLUSH_FULL_HOUSE;
    else if (flush && straight) {
      const high = Math.max(...rankIndexes.map((r) => (r === 0 ? 14 : r + 1)));
      handType = high === 14 && rankIndexes.includes(12) && rankIndexes.includes(11) && rankIndexes.includes(10) && rankIndexes.includes(9)
        ? HAND_TYPES.ROYAL_FLUSH
        : HAND_TYPES.STRAIGHT_FLUSH;
    }
    else if (four) handType = HAND_TYPES.FOUR_OF_A_KIND;
    else if (three && two2) handType = HAND_TYPES.FULL_HOUSE;
    else if (flush) handType = HAND_TYPES.FLUSH;
    else if (straight) handType = HAND_TYPES.STRAIGHT;
    else if (three) handType = HAND_TYPES.THREE_OF_A_KIND;
    else if (two1 && two2) handType = HAND_TYPES.TWO_PAIR;
    else if (two1) handType = HAND_TYPES.ONE_PAIR;
    else handType = HAND_TYPES.HIGH_CARD;
    const config = HAND_TYPE_CONFIG[handType];
    return { ...config, handType, chips: chipsWithScoringPoints(cards, handType, rankCounts, config.chips) };
  }

  if (n === 4) {
    const four = rankCounts[0]?.[0] === 4;
    const three = rankCounts[0]?.[0] === 3;
    const twoCount = rankCounts.filter(([c]) => c === 2).length;
    let handType;
    if (four) handType = HAND_TYPES.FOUR_OF_A_KIND;
    else if (flush) handType = HAND_TYPES.FLUSH;
    else if (three) handType = HAND_TYPES.THREE_OF_A_KIND;
    else if (twoCount >= 2) handType = HAND_TYPES.TWO_PAIR;
    else if (twoCount === 1) handType = HAND_TYPES.ONE_PAIR;
    else handType = HAND_TYPES.HIGH_CARD;
    const config = HAND_TYPE_CONFIG[handType];
    return { ...config, handType, chips: chipsWithScoringPoints(cards, handType, rankCounts, config.chips) };
  }

  if (n === 3) {
    const three = rankCounts[0]?.[0] === 3;
    const two = rankCounts[0]?.[0] === 2;
    let handType;
    if (three) handType = HAND_TYPES.THREE_OF_A_KIND;
    else if (flush) handType = HAND_TYPES.FLUSH;
    else if (two) handType = HAND_TYPES.ONE_PAIR;
    else handType = HAND_TYPES.HIGH_CARD;
    const config = HAND_TYPE_CONFIG[handType];
    return { ...config, handType, chips: chipsWithScoringPoints(cards, handType, rankCounts, config.chips) };
  }

  if (n === 2) {
    const two = rankCounts[0]?.[0] === 2;
    const handType = two ? HAND_TYPES.ONE_PAIR : HAND_TYPES.HIGH_CARD;
    const config = HAND_TYPE_CONFIG[handType];
    return { ...config, handType, chips: chipsWithScoringPoints(cards, handType, rankCounts, config.chips) };
  }

  const handType = HAND_TYPES.HIGH_CARD;
  const config = HAND_TYPE_CONFIG[handType];
  return { ...config, handType, chips: chipsWithScoringPoints(cards, handType, rankCounts, config.chips) };
}
