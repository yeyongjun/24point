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
    ctx.save();
    
    // 绘制表达式背景（带阴影）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // 绘制圆角矩形背景
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(this.x + radius, this.y);
    ctx.lineTo(this.x + this.width - radius, this.y);
    ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + radius, radius);
    ctx.lineTo(this.x + this.width, this.y + this.height - radius);
    ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - radius, this.y + this.height, radius);
    ctx.lineTo(this.x + radius, this.y + this.height);
    ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - radius, radius);
    ctx.lineTo(this.x, this.y + radius);
    ctx.arcTo(this.x, this.y, this.x + radius, this.y, radius);
    ctx.closePath();
    
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();
    
    ctx.shadowColor = 'transparent'; // 关闭阴影，避免影响边框
    
    // 绘制表达式边框
    ctx.strokeStyle = 'rgba(158, 158, 158, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 绘制表达式文本
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.expression || '请选择卡片和运算符',
      this.x + this.width / 2,
      this.y + this.height / 2
    );
    
    ctx.restore();
  }
}