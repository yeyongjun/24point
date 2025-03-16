import './render'; // 初始化Canvas
import Card from './npc/card'; // 导入卡片类
import Operator from './npc/operator'; // 导入运算符类
import Calculator from './npc/calculator'; // 导入计算器类
import Expression from './npc/expression'; // 导入表达式类
import BackGround from './runtime/background'; // 导入背景类
import GameInfo from './runtime/gameinfo'; // 导入游戏UI类
import Music from './runtime/music'; // 导入音乐类
import DataBus from './databus'; // 导入数据类

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
    // 当开始游戏被点击时，重新开始游戏
    this.gameInfo.on('restart', this.start.bind(this));
    
    // 初始化触摸事件
    this.initEvent();
    
    // 开始游戏
    this.start();
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
    });
  }
  
  /**
   * 选择卡片
   */
  selectCard(index) {
    const card = this.cards[index];
    
    // 如果卡片已被使用，则不做任何操作
    if (card.used) return;
    
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
      // 答案正确，增加分数并进入下一关
      GameGlobal.databus.score += Math.max(10, Math.floor(50 * (this.timeLimit - this.timer) / this.timeLimit));
      this.nextLevel();
    } else {
      // 答案错误，重置当前关卡
      this.resetLevel();
    }
  }
  
  /**
   * 进入下一关
   */
  nextLevel() {
    this.level++;
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
   */
  start() {
    GameGlobal.databus.reset(); // 重置数据
    this.level = 1; // 重置关卡
    this.timer = 0; // 重置计时器
    
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
    
    // 重置表达式
    this.expression.reset();
    
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
    
    // 更新计时器
    if (GameGlobal.databus.frame % 60 === 0) { // 每秒更新一次
      this.timer++;
      
      // 时间到，游戏结束
      if (this.timer >= this.timeLimit) {
        GameGlobal.databus.gameOver();
      }
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
    
    // 绘制游戏信息
    this.gameInfo.render(ctx);
    
    // 绘制关卡和时间信息
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`关卡: ${this.level}`, 10, 60);
    ctx.fillText(`时间: ${this.timeLimit - this.timer}秒`, 10, 90);
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