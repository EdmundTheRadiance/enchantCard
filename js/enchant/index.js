/**
 * 附魔模块入口：常量、选牌区选项（点数/花色）、功能区选项（效果目录）及随机抽取
 */
import { shuffleArray } from '../cards/deck';
import { RANKS, SUITS } from '../cards/constants';
import { FUNCTION_ENCHANT_CATALOG } from './catalog';

export { FUNCTION_ENCHANT_CATALOG } from './catalog';
export * from './constants';

/**
 * 选牌区选项池：13 种点数 + 4 种花色，每项 { type, rank? | suitIndex?, label }
 * 用于商店选牌区「请选择一种牌进行附魔」
 */
export function getCardTypeOptionPool() {
  return [
    ...RANKS.map((r) => ({ type: 'rank', rank: r, label: `随机一张${r}` })),
    ...SUITS.map((s, i) => ({ type: 'suit', suitIndex: i, label: `随机一张${s.name}` })),
  ];
}

/**
 * 从选牌区选项池中随机抽取 n 个（不重复）
 * @param {number} n
 * @returns {{ type: string, rank?: string, suitIndex?: number, label: string }[]}
 */
export function getRandomCardTypeOptions(n = 4) {
  const pool = getCardTypeOptionPool();
  return shuffleArray(pool).slice(0, n);
}

/**
 * 从功能区附魔目录中随机抽取 n 个（不重复）
 * @param {number} n
 * @returns {{ id: string, label: string, effect: object }[]}
 */
export function getRandomFunctionOptions(n = 4) {
  return shuffleArray([...FUNCTION_ENCHANT_CATALOG]).slice(0, n);
}
