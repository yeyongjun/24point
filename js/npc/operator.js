import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

// 运算符相关常量
const OPERATOR_WIDTH = 60;
const OPERATOR_HEIGHT = 60;
const OPERATORS = ['+', '-', '×', '÷'];
const OPERATOR_COLOR = '#673ab7'; // 紫色

/**
 * 运算符类
 * 用于表示24点游戏中的运算符
 */
export default class Operator extends Sprite {
  constructor(type, index) {
    super('', OPERATOR_WIDTH, OPERATOR_HEIGHT);
    
    this.type = type; // 运算符类型（+, -, ×, ÷）
    this.index = index; // 运算符的索引，用于确定位置
    this.selected = false; // 是否被选中
    
    // 初始化运算符位置
    this.init();
  }
  
  init() {
    // 根据索引计算运算符位置
    const gap = 20; // 运算符之间的间隔
    const totalWidth = OPERATOR_WIDTH * 4 + gap * 3; // 4个运算符的总宽度
    const startX = (SCREEN_WIDTH - totalWidth) / 2; // 起始X坐标
    
    this.x = startX + (OPERATOR_WIDTH + gap) * this.index;
    this.y = SCREEN_HEIGHT / 2 + 50; // 放在屏幕中下方
    
    this.selected = false;
    this.visible = true;
  }
  
  /**
   * 检查点击是否在运算符上
   */
  checkTap(x, y) {
    return x >= this.x && 
           x <= this.x + this.width && 
           y >= this.y && 
           y <= this.y + this.height;
  }
  
  /**
   * 选中运算符
   */
  select() {
    this.selected = true;
  }
  
  /**
   * 取消选中
   */
  deselect() {
    this.selected = false;
  }
  
  /**
   * 获取运算符的实际值
   */
  getValue() {
    switch(this.type) {
      case '+': return '+';
      case '-': return '-';
      case '×': return '*';
      case '÷': return '/';
      default: return '';
    }
  }
  
  /**
   * 绘制运算符
   */
  render(ctx) {
    if (!this.visible) return;
    
    // 绘制运算符背景
    ctx.fillStyle = this.selected ? '#9c27b0' : OPERATOR_COLOR;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制运算符边框
    ctx.strokeStyle = this.selected ? '#e91e63' : '#ffffff';
    ctx.lineWidth = this.selected ? 3 : 1;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 绘制运算符符号
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.type,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }
}