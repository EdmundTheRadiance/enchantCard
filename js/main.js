import { SCREEN_WIDTH, SCREEN_HEIGHT } from './render';
import { drawStartScreen, layoutStartButton } from './scenes/startScreen';
import { drawBattleScene } from './scenes/battleScene';
import {
  createShuffledDeck,
  drawHandFromDeck,
  drawToHandWithReshuffle,
  moveToDiscardPile,
  sortHand,
} from './cards/deck';
import { evaluateHand } from './cards/handRank';
import { getSortButtonRect, getPlayButtonRect, getDiscardButtonRect, getCardPositions, hitTestCard } from './areas/handArea';
import { getRetryButtonRect } from './scenes/battleScene';

const ctx = canvas.getContext('2d');

/**
 * 游戏主入口：开始界面 + 对战场景
 */
export default class Main {
  scene = 'start';
  startButton = { x: 0, y: 0, width: 240, height: 72 };
  battle = {
    monsterName: '小怪',
    monsterHp: 300,
    monsterHpMax: 300,
    monsterImagePlaceholder: true,
    chips: 100,
    mult: 1,
    lastScore: 0,
    lastHandName: null,
    /** 抽牌堆：牌面朝下，从顶部抽牌 */
    drawPile: [],
    /** 手牌堆：当前手牌 */
    hand: [],
    /** 弃牌堆：已打出的牌 */
    discardPile: [],
    sortMode: 'rank',
    selectedCardIndices: [],
    cardDisplayOffset: [],
    /** 攻击动画：{ active, progress 0~1, score, isOverkill } */
    attackAnim: { active: false, progress: 0, score: 0, isOverkill: false },
    /** 失败流程：攻击未击败怪物时，怪物反击→全屏受击→展示失败。{ active, progress 0~1 } */
    failureAnim: { active: false, progress: 0 },
    /** 是否已进入失败状态（展示失败文案直至重新开始） */
    failed: false,
  };

  constructor() {
    this.layout();
    this.draw();
    this.bindTouch();
    this.loop();
  }

  loop = () => {
    if (this.scene === 'battle') this.updateBattleAnimation();
    this.draw();
    requestAnimationFrame(this.loop);
  };

  updateBattleAnimation() {
    const sel = new Set(this.battle.selectedCardIndices);
    const offsets = this.battle.cardDisplayOffset;
    const n = this.battle.hand.length;
    const speed = 0.2;
    for (let i = 0; i < n; i++) {
      const target = sel.has(i) ? 1 : 0;
      let cur = offsets[i] ?? 0;
      cur += (target - cur) * speed;
      offsets[i] = cur < 0.001 ? 0 : cur > 0.999 ? 1 : cur;
    }

    const atk = this.battle.attackAnim;
    if (atk.active) {
      if (atk.progress < 0.2 && atk.progress + 0.03 >= 0.2) {
        this.battle.monsterHp = Math.max(0, this.battle.monsterHp - atk.score);
      }
      atk.progress += 0.03;
      if (atk.progress >= 1) {
        atk.active = false;
        if (this.battle.monsterHp > 0) {
          this.battle.failureAnim = { active: true, progress: 0 };
        }
      }
    }
    const fail = this.battle.failureAnim;
    if (fail.active) {
      fail.progress += 0.018;
      if (fail.progress >= 1) {
        fail.active = false;
        this.battle.failed = true;
      }
    }
  }

  layout() {
    Object.assign(this.startButton, layoutStartButton(SCREEN_WIDTH, SCREEN_HEIGHT));
  }

  draw() {
    const w = SCREEN_WIDTH;
    const h = SCREEN_HEIGHT;
    if (this.scene === 'start') {
      drawStartScreen(ctx, w, h, this.startButton);
    } else if (this.scene === 'battle') {
      drawBattleScene(ctx, w, h, this.battle);
    }
  }

  bindTouch() {
    const onTouchStart = (e) => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const x = touch.clientX ?? touch.x;
      const y = touch.clientY ?? touch.y;
      if (this.scene === 'start' && this.hitStartButton(x, y)) {
        this.onStartGame();
      } else if (this.scene === 'battle') {
        this.onBattleTouch(x, y);
      }
    };
    if (typeof canvas !== 'undefined' && typeof canvas.addEventListener === 'function') {
      canvas.addEventListener('touchstart', onTouchStart);
    } else if (typeof wx !== 'undefined' && typeof wx.onTouchStart === 'function') {
      wx.onTouchStart(onTouchStart);
    }
  }

  onBattleTouch(x, y) {
    const w = SCREEN_WIDTH;
    const h = SCREEN_HEIGHT;
    if (this.battle.failed) {
      const retryRect = getRetryButtonRect(w, h);
      if (this.hitRect(x, y, retryRect)) {
        this.onRestartGame();
      }
      return;
    }
    const handAreaY = h * 0.65;
    const handAreaH = h * 0.35;

    const sortRect = getSortButtonRect(w, handAreaY, handAreaH);
    if (this.hitRect(x, y, sortRect)) {
      this.battle.sortMode = this.battle.sortMode === 'rank' ? 'suit' : 'rank';
      sortHand(this.battle.hand, this.battle.sortMode);
      this.battle.selectedCardIndices = [];
      this.updateScoreFromSelection();
      return;
    }

    const playRect = getPlayButtonRect(w, handAreaY, handAreaH);
    if (this.hitRect(x, y, playRect)) {
      this.onPlayCards();
      return;
    }

    const discardRect = getDiscardButtonRect(w, handAreaY, handAreaH);
    if (this.hitRect(x, y, discardRect)) {
      this.onDiscardCards();
      return;
    }

    const positions = getCardPositions(w, handAreaY, handAreaH, this.battle.hand.length);
    const index = hitTestCard(positions, x, y);
    if (index < 0) return;

    const sel = this.battle.selectedCardIndices;
    const at = sel.indexOf(index);
    if (at >= 0) {
      sel.splice(at, 1);
    } else if (sel.length < 5) {
      sel.push(index);
    }
    this.updateScoreFromSelection();
  }

  /** 根据当前选中牌实时计算并更新筹码、倍率、分数与牌型名 */
  updateScoreFromSelection() {
    const sel = this.battle.selectedCardIndices;
    if (sel.length === 0) {
      this.battle.chips = 0;
      this.battle.mult = 1;
      this.battle.lastScore = 0;
      this.battle.lastHandName = null;
      return;
    }
    const played = sel.slice().sort((a, b) => a - b).map((i) => this.battle.hand[i]);
    const result = evaluateHand(played);
    this.battle.chips = result.chips;
    this.battle.mult = result.mult;
    this.battle.lastScore = result.chips * result.mult;
    this.battle.lastHandName = result.name;
  }

  /** 将牌格式化为可读字符串，如 "A♠"、"10♥" */
  formatCard(card) {
    return card ? `${card.rank}${card.suit.symbol}` : '';
  }

  /** 当牌堆发生变化时，将抽牌堆、手牌堆、弃牌堆所包含的牌打印到控制台 */
  logPiles() {
    const { drawPile, hand, discardPile } = this.battle;
    console.log('[牌堆]', {
      抽牌堆: drawPile.map((c) => this.formatCard(c)),
      手牌堆: hand.map((c) => this.formatCard(c)),
      弃牌堆: discardPile.map((c) => this.formatCard(c)),
    });
  }

  hitRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  hitStartButton(x, y) {
    const b = this.startButton;
    return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
  }

  onPlayCards() {
    const sel = this.battle.selectedCardIndices;
    if (sel.length === 0) return;
    this.updateScoreFromSelection();
    const score = this.battle.lastScore ?? 0;
    if (score <= 0) return;
    const playedCount = sel.length;
    // 打出的牌进入弃牌堆，并从抽牌堆抽取打出数量张牌补回手牌（不足时先抽完抽牌堆，再将弃牌堆洗牌放入抽牌堆后继续抽）
    moveToDiscardPile(this.battle.hand, sel.slice().sort((a, b) => a - b), this.battle.discardPile);
    this.battle.selectedCardIndices = [];
    drawToHandWithReshuffle(this.battle.drawPile, this.battle.discardPile, this.battle.hand, playedCount);
    sortHand(this.battle.hand, this.battle.sortMode);
    this.battle.cardDisplayOffset = this.battle.hand.map(() => 0);
    this.logPiles();
    // 以当前分数对怪物发起攻击，触发攻击动画（分数>=怪物血量时为强力一击）
    this.battle.attackAnim = {
      active: true,
      progress: 0,
      score,
      isOverkill: score >= this.battle.monsterHp,
    };
  }

  /** 弃牌：将选中的手牌放入弃牌堆，并从抽牌堆抽取相同数量补回（不足时按抽一轮牌规则） */
  onDiscardCards() {
    const sel = this.battle.selectedCardIndices;
    if (sel.length === 0) return;
    const discardCount = sel.length;
    moveToDiscardPile(this.battle.hand, sel.slice().sort((a, b) => a - b), this.battle.discardPile);
    this.battle.selectedCardIndices = [];
    drawToHandWithReshuffle(this.battle.drawPile, this.battle.discardPile, this.battle.hand, discardCount);
    sortHand(this.battle.hand, this.battle.sortMode);
    this.battle.cardDisplayOffset = this.battle.hand.map(() => 0);
    this.updateScoreFromSelection();
    this.logPiles();
  }

  onStartGame() {
    if (this.scene !== 'start') return;
    this.scene = 'battle';
    this.resetBattle();
  }

  /** 重置对战状态并开局（新牌堆、满血），用于开始游戏或失败后「再来一次」 */
  resetBattle() {
    this.battle.drawPile = createShuffledDeck();
    this.battle.discardPile = [];
    this.battle.hand = drawHandFromDeck(this.battle.drawPile);
    this.battle.monsterHp = this.battle.monsterHpMax;
    this.battle.selectedCardIndices = [];
    this.battle.cardDisplayOffset = this.battle.hand.map(() => 0);
    this.battle.attackAnim = { active: false, progress: 0, score: 0, isOverkill: false };
    this.battle.failureAnim = { active: false, progress: 0 };
    this.battle.failed = false;
    sortHand(this.battle.hand, this.battle.sortMode);
    this.updateScoreFromSelection();
    this.logPiles();
    this.draw();
  }

  /** 失败后点击「再来一次」：重新开始本局游戏 */
  onRestartGame() {
    if (!this.battle.failed) return;
    this.resetBattle();
  }
}
