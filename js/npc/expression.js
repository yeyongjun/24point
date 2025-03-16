import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

/**
 * 表达式类
 * 用于管理24点游戏中玩家构建的表达式
 */
export default class Expression {
  constructor() {
    this.reset();
    
    // 表达式显示区域
    this.x = SCREEN_WIDTH / 2 - 150;
    this.y = SCREEN_HEIGHT / 2 - 20;
    this.width = 300;
    this.height = 40;
  }
  
  /**
   * 重置表达式
   */
  reset() {
    this.expression = ''; // 当前表达式
    this.usedCards = []; // 已使用的卡片
    this.lastOperator = null; // 上一个使用的运算符
  }
  
  /**
   * 添加数字到表达式
   */
  addNumber(number, cardIndex) {
    // 如果表达式为空或上一个是运算符，直接添加数字
    if (this.expression === '' || this.lastOperator) {
      this.expression += number;
      this.usedCards.push(cardIndex);
      this.lastOperator = null;
      return true;
    }
    return false; // 不能连续添加两个数字
  }
  
  /**
   * 添加运算符到表达式
   */
  addOperator(operator) {
    // 如果表达式不为空且上一个不是运算符，可以添加运算符
    if (this.expression !== '' && !this.lastOperator) {
      this.expression += operator;
      this.lastOperator = operator;
      return true;
    }
    return false; // 不能在表达式开头添加运算符或连续添加两个运算符
  }
  
  /**
   * 检查表达式是否完整
   * 完整的表达式应该包含4个数字和3个运算符
   */
  isComplete() {
    return this.usedCards.length === 4 && !this.lastOperator;
  }
  
  /**
   * 获取当前表达式
   */
  getExpression() {
    return this.expression;
  }
  
  /**
   * 获取已使用的卡片索引
   */
  getUsedCards() {
    return [...this.usedCards];
  }
  
  /**
   * 绘制表达式
   */
  render(ctx) {
    // 绘制表达式背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 绘制表达式边框
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // 绘制表达式文本
    ctx.fillStyle = '#212121';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.expression || '请选择卡片和运算符',
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }
}