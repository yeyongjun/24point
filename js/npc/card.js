import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

// 卡片相关常量
const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;
const CARD_COLORS = ['#f44336', '#2196f3', '#4caf50', '#ff9800']; // 红、蓝、绿、橙

/**
 * 数字卡片类
 * 用于表示24点游戏中的数字卡片
 */
export default class Card extends Sprite {
  constructor(number, index) {
    super('', CARD_WIDTH, CARD_HEIGHT);
    
    this.number = number; // 卡片上的数字
    this.index = index; // 卡片的索引，用于确定颜色和位置
    this.selected = false; // 是否被选中
    this.used = false; // 是否已被使用
    this.color = CARD_COLORS[index % CARD_COLORS.length]; // 卡片颜色
    
    // 初始化卡片位置
    this.init();
  }
  
  init() {
    // 根据索引计算卡片位置
    const gap = 20; // 卡片之间的间隔
    const totalWidth = CARD_WIDTH * 4 + gap * 3; // 4张卡片的总宽度
    const startX = (SCREEN_WIDTH - totalWidth) / 2; // 起始X坐标
    
    this.x = startX + (CARD_WIDTH + gap) * this.index;
    this.y = SCREEN_HEIGHT / 2 - CARD_HEIGHT / 2 - 100; // 放在屏幕中上方
    
    this.selected = false;
    this.used = false;
    this.visible = true;
  }
  
  /**
   * 检查点击是否在卡片上
   */
  checkTap(x, y) {
    return !this.used && 
           x >= this.x && 
           x <= this.x + this.width && 
           y >= this.y && 
           y <= this.y + this.height;
  }
  
  /**
   * 选中卡片
   */
  select() {
    if (!this.used) {
      this.selected = true;
    }
  }
  
  /**
   * 取消选中
   */
  deselect() {
    this.selected = false;
  }
  
  /**
   * 标记为已使用
   */
  markAsUsed() {
    this.used = true;
    this.selected = false;
  }
  
  /**
   * 重置卡片状态
   */
  reset() {
    this.used = false;
    this.selected = false;
  }
  
  /**
   * 绘制卡片
   */
  render(ctx) {
    if (!this.visible) return;
    
    // 绘制卡片背景
    ctx.fillStyle = this.used ? '#aaaaaa' : (this.selected ? '#ffeb3b' : this.color);
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 绘制卡片边框
    ctx.strokeStyle = this.selected ? '#ff5722' : '#ffffff';
    ctx.lineWidth = this.selected ? 3 : 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // 绘制卡片数字
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.number.toString(),
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }
}