import './render'; // 初始化Canvas
import {SCREEN_WIDTH} from './render';
import {SCREEN_HEIGHT} from './render';
import Card from './npc/card'; // 导入卡片类
import Operator from './npc/operator'; // 导入运算符类
import Calculator from './npc/calculator'; // 导入计算器类
import Expression from './npc/expression'; // 导入表达式类
import BackGround from './runtime/background'; // 导入背景类
import GameInfo from './runtime/gameinfo'; // 导入游戏UI类
import Music from './runtime/music'; // 导入音乐类
import DataBus from './databus'; // 导入数据类
import Item, { ITEM_TYPES } from './npc/item'; // 导入道具类
import Feedback from './runtime/feedback'; // 导入反馈类

const ctx = canvas.getContext('2d'); // 获取canvas的2D绘图上下文
const OPERATORS = ['+', '-', '×', '÷']; // 运算符列表

GameGlobal.databus = new DataBus(); // 全局数据管理
GameGlobal.musicManager = new Music(); // 全局音乐管理

/**
 * 24点游戏主函数
 */
export default class Main {
  aniId = 0; // 用于存储动画帧的ID
  bg = new BackGround(); // 创建背景
  gameInfo = new GameInfo(); // 创建游戏UI显示
  cards = []; // 卡片数组
  operators = []; // 运算符数组
  expression = new Expression(); // 表达式
  timer = 0; // 游戏计时器
  timeLimit = 60; // 游戏时间限制（秒）
  level = 1; // 当前关卡
  
  constructor() {
    // 初始化反馈系统
    this.feedback = new Feedback();
    
    // 当开始游戏被点击时，重新开始游戏
    this.gameInfo.on('restart', this.start.bind(this));
    this.gameInfo.on('selectDifficulty', this.start.bind(this));
    
    // 初始化触摸事件
    this.initEvent();
    
    // 初始化游戏数据
    this.combo = 0; // 连击数
    this.maxCombo = 0; // 最大连击数
    this.difficulty = 'normal'; // 默认难度
    
    // 开始游戏
    this.start('normal');
    
    // 播放背景音乐
    // GameGlobal.musicManager.playBGM();
  }
  
  /**
   * 初始化触摸事件
   */
  initEvent() {
    wx.onTouchStart((e) => {
      if (GameGlobal.databus.isGameOver) return;
      
      const { clientX: x, clientY: y } = e.touches[0];
      
      // 检查是否点击了卡片
      for (let i = 0; i < this.cards.length; i++) {
        if (this.cards[i].checkTap(x, y)) {
          this.selectCard(i);
          return;
        }
      }
      
      // 检查是否点击了运算符
      for (let i = 0; i < this.operators.length; i++) {
        if (this.operators[i].checkTap(x, y)) {
          this.selectOperator(i);
          return;
        }
      }
      
      // 检查是否点击了道具
      if (this.items) {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].checkTap(x, y)) {
            this.useItem(i);
            return;
          }
        }
      }
    });
  }
  
  /**
   * 选择卡片
   */
  selectCard(index) {
    const card = this.cards[index];
    
    // 如果卡片已被使用，则不做任何操作
    if (card.used) return;
    
    // 播放点击音效
    GameGlobal.musicManager.playClick();
    
    // 添加数字到表达式
    if (this.expression.addNumber(card.number, index)) {
      card.markAsUsed();
      
      // 检查表达式是否完整，如果完整则验证结果
      if (this.expression.isComplete()) {
        this.checkResult();
      }
    }
  }
  
  /**
   * 选择运算符
   */
  selectOperator(index) {
    const operator = this.operators[index];
    
    // 播放点击音效
    GameGlobal.musicManager.playClick();
    
    // 添加运算符到表达式
    if (this.expression.addOperator(operator.getValue())) {
      // 取消所有运算符的选中状态
      this.operators.forEach(op => op.deselect());
    }
  }
  
  /**
   * 检查表达式结果
   */
  checkResult() {
    const expression = this.expression.getExpression();
    const isCorrect = Calculator.validateExpression(expression);
    
    if (isCorrect) {
      // 播放正确音效
      GameGlobal.musicManager.playCorrect();
      
      // 增加连击数
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      
      // 计算分数（基础分 + 连击奖励 + 时间奖励）
      const baseScore = 10;
      const comboBonus = Math.min(this.combo * 2, 20); // 连击奖励，最高20分
      const timeBonus = Math.floor(40 * (this.timeLimit - this.timer) / this.timeLimit); // 时间奖励
      const totalScore = baseScore + comboBonus + timeBonus;
      
      // 更新分数
      GameGlobal.databus.score += totalScore;
      
      // 显示得分动画
      this.feedback.addScoreAnimation(totalScore, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 50);
      
      // 显示连击信息
      if (this.combo > 1) {
        this.feedback.addMessage(`${this.combo}连击！`, 'success');
      }
      
      // 随机奖励道具（概率与难度和连击数相关）
      if (this.items && this.combo >= 3) {
        const difficultyFactor = {
          'easy': 0.4,
          'normal': 0.3,
          'hard': 0.2
        }[this.difficulty];
        
        const comboFactor = Math.min(this.combo * 0.05, 0.3); // 连击因子，最高0.3
        const dropChance = difficultyFactor + comboFactor;
        
        if (Math.random() < dropChance) {
          // 随机选择一种道具
          const randomIndex = Math.floor(Math.random() * this.items.length);
          this.items[randomIndex].addCount(1);
          
          // 显示获得道具的消息
          const itemInfo = this.items[randomIndex].getTypeInfo();
          this.feedback.addMessage(`获得道具：${itemInfo.name}`, 'success');
        }
      }
      
      // 进入下一关
      this.nextLevel();
    } else {
      // 播放错误音效
      GameGlobal.musicManager.playWrong();
      
      // 重置连击
      this.combo = 0;
      
      // 显示错误消息
      this.feedback.addMessage('答案错误', 'error');
      
      // 答案错误，重置当前关卡
      this.resetLevel();
    }
  }
  
  /**
   * 进入下一关
   */
  nextLevel() {
    this.level++;
    // 播放升级音效
    GameGlobal.musicManager.playLevelUp();
    this.resetLevel();
  }
  
  /**
   * 重置当前关卡
   */
  resetLevel() {
    // 重置表达式
    this.expression.reset();
    
    // 重置卡片
    this.cards.forEach(card => card.reset());
    
    // 生成新的数字
    const numbers = Calculator.generateValidProblem();
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].number = numbers[i];
    }
    
    // 重置计时器
    this.timer = 0;
  }
  
  /**
   * 开始或重启游戏
   * @param {string} difficulty - 难度级别：easy, normal, hard
   */
  start(difficulty = 'normal') {
    GameGlobal.databus.reset(); // 重置数据
    this.level = 1; // 重置关卡
    this.timer = 0; // 重置计时器
    this.combo = 0; // 重置连击
    this.maxCombo = 0; // 重置最大连击
    this.difficulty = difficulty; // 设置难度
    
    // 根据难度设置时间限制
    switch(difficulty) {
      case 'easy':
        this.timeLimit = 90; // 简单模式：90秒
        break;
      case 'normal':
        this.timeLimit = 60; // 普通模式：60秒
        break;
      case 'hard':
        this.timeLimit = 45; // 困难模式：45秒
        break;
    }
    
    // 初始化卡片
    this.cards = [];
    const numbers = Calculator.generateValidProblem();
    for (let i = 0; i < 4; i++) {
      this.cards.push(new Card(numbers[i], i));
    }
    
    // 初始化运算符
    this.operators = [];
    for (let i = 0; i < 4; i++) {
      this.operators.push(new Operator(OPERATORS[i], i));
    }
    
    // 初始化道具
    this.items = [];
    const itemTypes = Object.keys(ITEM_TYPES);
    for (let i = 0; i < itemTypes.length; i++) {
      this.items.push(new Item(itemTypes[i], i));
    }
    
    // 根据难度给予初始道具
    if (difficulty === 'easy') {
      // 简单模式：每种道具1个
      this.items.forEach(item => item.addCount(1));
    } else if (difficulty === 'normal') {
      // 普通模式：提示和时间道具各1个
      this.items.forEach(item => {
        if (item.type === 'HINT' || item.type === 'TIME') {
          item.addCount(1);
        }
      });
    }
    // 困难模式不给初始道具
    
    // 重置表达式
    this.expression.reset();
    
    // 显示难度信息
    const difficultyText = {
      'easy': '简单',
      'normal': '普通',
      'hard': '困难'
    }[difficulty];
    this.feedback.addMessage(`难度：${difficultyText}`, 'info');
    
    // 开始游戏循环
    cancelAnimationFrame(this.aniId);
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }
  
  /**
   * 更新游戏状态
   */
  update() {
    if (GameGlobal.databus.isGameOver) return;
    
    // 更新背景
    this.bg.update();
    
    // 更新反馈系统
    this.feedback.update();
    
    // 更新计时器
    if (GameGlobal.databus.frame % 60 === 0) { // 每秒更新一次
      this.timer++;
      
      // 时间到，游戏结束
      if (this.timer >= this.timeLimit) {
        GameGlobal.databus.gameOver();
        // 播放游戏结束音效
        GameGlobal.musicManager.playGameOver();
        this.feedback.addMessage('时间到！游戏结束', 'error');
      }
    }
  }
  
  /**
   * 使用道具
   * @param {number} index - 道具索引
   */
  useItem(index) {
    const item = this.items[index];
    if (!item || !item.use()) return;
    
    // 播放点击音效
    GameGlobal.musicManager.playClick();
    
    const itemInfo = item.getTypeInfo();
    
    // 根据道具类型执行不同效果
    switch (item.type) {
      case 'HINT': // 提示道具
        // 获取当前数字的一个可能解法
        const numbers = this.cards.map(card => card.number);
        const solution = Calculator.findOneSolution(numbers);
        if (solution) {
          this.feedback.addHint(solution);
        } else {
          this.feedback.addMessage('无法找到解法', 'error');
          item.addCount(1); // 退还道具
        }
        break;
        
      case 'SKIP': // 跳过道具
        this.feedback.addMessage('跳过当前题目', 'info');
        this.resetLevel();
        break;
        
      case 'TIME': // 时间道具
        this.timer = Math.max(0, this.timer - 10); // 减少10秒计时
        this.feedback.addMessage('+10秒时间', 'success');
        break;
        
      case 'WILD': // 万能牌道具
        // 实现万能牌逻辑：替换一张卡片为任意数字
        this.feedback.addMessage('选择一张卡片替换为万能牌', 'info');
        this.wildCardMode = true;
        break;
    }
  }
  
  /**
   * 渲染游戏画面
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
    
    this.bg.render(ctx); // 绘制背景
    
    // 绘制卡片
    this.cards.forEach(card => card.render(ctx));
    
    // 绘制运算符
    this.operators.forEach(op => op.render(ctx));
    
    // 绘制表达式
    this.expression.render(ctx);
    
    // 绘制道具
    if (this.items) {
      this.items.forEach(item => item.render(ctx));
    }
    
    // 绘制反馈效果
    this.feedback.render(ctx, canvas.width, canvas.height);
    
    // 绘制游戏信息
    this.gameInfo.render(ctx);
    
    // 绘制关卡和时间信息
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`关卡: ${this.level}`, 10, 60);
    ctx.fillText(`时间: ${this.timeLimit - this.timer}秒`, 10, 90);
    
    // 绘制连击信息
    if (this.combo > 1) {
      ctx.fillText(`连击: ${this.combo}`, 10, 120);
    }
    
    // 绘制难度信息
    const difficultyText = {
      'easy': '简单',
      'normal': '普通',
      'hard': '困难'
    }[this.difficulty];
    ctx.fillText(`难度: ${difficultyText}`, 10, 150);
  }
  
  /**
   * 游戏循环
   */
  loop() {
    GameGlobal.databus.frame++; // 更新帧计数器
    
    this.update(); // 更新游戏状态
    this.render(); // 渲染游戏画面
    
    // 继续下一帧
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }
}