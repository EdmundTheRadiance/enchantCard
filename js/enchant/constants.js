/**
 * 附魔效果类型与常量，供目录与后续结算逻辑使用
 */

/** 附魔效果类型：数值加成 */
export const EFFECT_CHIPS_ADD = 'chips_add';
export const EFFECT_MULT_ADD = 'mult_add';

/** 附魔效果类型：牌面视为（花色/点数） */
export const EFFECT_CARD_SUIT_AS = 'card_suit_as';
export const EFFECT_CARD_RANK_AS = 'card_rank_as';
export const EFFECT_CARD_IGNORE_RANK = 'card_ignore_rank';

/** 花色视为：红=红心/方片，黑=黑桃/梅花 */
export const SUIT_AS_RED = 'red';
export const SUIT_AS_BLACK = 'black';
export const SUIT_AS_ANY = 'any';
export const SUIT_AS_MAJORITY_PLAY = 'majority_in_play';

/** 点数视为：人头=J/Q/K，最高/最低=本手打出牌中的最大/最小点数，等 */
export const RANK_AS_FACE = 'face';
export const RANK_AS_ACE = 'A';
export const RANK_AS_10 = '10';
export const RANK_AS_MAX_IN_PLAY = 'max_in_play';
export const RANK_AS_MIN_IN_PLAY = 'min_in_play';
export const RANK_AS_MAX_MINUS_1 = 'max_minus_1';
export const RANK_AS_SAME_AS_RANDOM_IN_PLAY = 'same_as_random_in_play';
/** 点数可视为某集合中任意一个（结算时可选） */
export const RANK_AS_ANY_OF_A234 = 'any_of_A234';
export const RANK_AS_ANY_OF_456 = 'any_of_456';
export const RANK_AS_ANY_OF_789 = 'any_of_789';
export const RANK_AS_ANY = 'any';
export const RANK_AS_10_FOR_STRAIGHT = '10_for_straight';

/** 打出时完全复制打出牌中另一张牌的点数和花色 */
export const EFFECT_CARD_COPY_ANOTHER_IN_PLAY = 'card_copy_another_in_play';

/** 条件触发：当打出牌满足条件时应用子效果 */
export const EFFECT_CONDITION_PLAY_HAS_RANK = 'condition_play_has_rank';
export const EFFECT_CONDITION_PLAY_HAS_SUIT = 'condition_play_has_suit';
export const EFFECT_WHEN_IN_HAND = 'when_in_hand';

/** 牌组：人头牌 J/Q/K */
export const RANK_GROUP_FACE = 'face';
export const RANK_GROUP_ACE = 'A';

/** 花色下标：与 SUITS 顺序一致，0=黑桃 1=红桃 2=方片 3=梅花 */
export const SUIT_INDEX_SPADE = 0;
export const SUIT_INDEX_HEART = 1;
export const SUIT_INDEX_DIAMOND = 2;
export const SUIT_INDEX_CLUB = 3;

/** 绿色附魔条件类型：若这张牌是某花色/某点数/打出牌满足某条件则加成 */
export const EFFECT_IF_THIS_CARD_SUIT = 'if_this_card_suit';
export const EFFECT_IF_THIS_CARD_RED_BLACK = 'if_this_card_red_black';
export const EFFECT_IF_THIS_CARD_FACE = 'if_this_card_face';
export const EFFECT_IF_THIS_CARD_ACE = 'if_this_card_ace';
export const EFFECT_IF_THIS_CARD_RANK_EVEN = 'if_this_card_rank_even';
export const EFFECT_IF_THIS_CARD_RANK_ODD = 'if_this_card_rank_odd';
export const EFFECT_IF_THIS_CARD_RANK_LE5 = 'if_this_card_rank_le5';
export const EFFECT_IF_THIS_CARD_RANK_GE10 = 'if_this_card_rank_ge10';
export const EFFECT_IF_THIS_CARD_PRIME = 'if_this_card_prime';
export const EFFECT_CONDITION_PLAY_HAS_PAIR = 'condition_play_has_pair';
export const EFFECT_CONDITION_PLAY_HAS_RED = 'condition_play_has_red';
export const EFFECT_CONDITION_PLAY_HAS_FACE = 'condition_play_has_face';
export const EFFECT_WHEN_IN_HAND_NOT_PLAYED = 'when_in_hand_not_played';
export const EFFECT_CONDITION_PLAY_ALL_RED = 'condition_play_all_red';
export const EFFECT_CONDITION_PLAY_ALL_BLACK = 'condition_play_all_black';
export const EFFECT_CONDITION_PLAY_ALL_FOUR_SUITS = 'condition_play_all_four_suits';
export const EFFECT_CONDITION_PLAY_NO_SPADE = 'condition_play_no_spade';
export const EFFECT_CONDITION_PLAY_HEARTS_MOST = 'condition_play_hearts_most';
export const EFFECT_CONDITION_PLAY_ALL_RANK_LT7 = 'condition_play_all_rank_lt7';
export const EFFECT_THIS_CARD_SAME_RANK_AS_ANOTHER_IN_HAND = 'this_card_same_rank_as_another_in_hand';

/** 附魔等级：用于分类与界面展示 */
export const ENCHANT_TIER = {
  /** 绿色：不需要任何条件的直接倍率或筹码加成 */
  GREEN: 'green',
  /** 蓝色：花色、点数变化，用于凑牌型 */
  BLUE: 'blue',
  /** 紫色：需要一定条件才能触发的高倍率或筹码加成 */
  PURPLE: 'purple',
  /** 金色：需要一定条件才能触发的成长型 */
  GOLD: 'gold',
};

/** 各等级对应的展示颜色（边框/高亮用） */
export const ENCHANT_TIER_COLOR = {
  [ENCHANT_TIER.GREEN]: '#2ecc71',
  [ENCHANT_TIER.BLUE]: '#3498db',
  [ENCHANT_TIER.PURPLE]: '#9b59b6',
  [ENCHANT_TIER.GOLD]: '#f1c40f',
};
