import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

// 卡片相关常量
const CARD_WIDTH = 80;
const CARD_HEIGHT = 120;
// 扁平化设计的颜色方案 - 更柔和的色调
const CARD_COLORS = ['#e57373', '#64b5f6', '#81c784', '#ffb74d']; // 浅红、浅蓝、浅绿、浅橙
const CARD_SHADOW_COLOR = 'rgba(0, 0, 0, 0.2)'; // 阴影颜色
const CARD_BORDER_RADIUS = 8; // 圆角半径

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
    
    ctx.save();
    
    // 绘制卡片阴影
    ctx.shadowColor = CARD_SHADOW_COLOR;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 绘制卡片背景（带圆角）
    ctx.beginPath();
    ctx.moveTo(this.x + CARD_BORDER_RADIUS, this.y);
    ctx.lineTo(this.x + this.width - CARD_BORDER_RADIUS, this.y);
    ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + CARD_BORDER_RADIUS, CARD_BORDER_RADIUS);
    ctx.lineTo(this.x + this.width, this.y + this.height - CARD_BORDER_RADIUS);
    ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - CARD_BORDER_RADIUS, this.y + this.height, CARD_BORDER_RADIUS);
    ctx.lineTo(this.x + CARD_BORDER_RADIUS, this.y + this.height);
    ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - CARD_BORDER_RADIUS, CARD_BORDER_RADIUS);
    ctx.lineTo(this.x, this.y + CARD_BORDER_RADIUS);
    ctx.arcTo(this.x, this.y, this.x + CARD_BORDER_RADIUS, this.y, CARD_BORDER_RADIUS);
    ctx.closePath();
    
    // 设置卡片颜色
    if (this.used) {
      ctx.fillStyle = '#bdbdbd'; // 已使用的卡片颜色
    } else if (this.selected) {
      ctx.fillStyle = '#fff176'; // 选中的卡片颜色
    } else {
      ctx.fillStyle = this.color;
    }
    
    ctx.fill();
    ctx.shadowColor = 'transparent'; // 关闭阴影，避免影响边框
    
    // 绘制卡片边框
    if (this.selected) {
      ctx.strokeStyle = '#fb8c00';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
    }
    ctx.stroke();
    
    // 绘制卡片数字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加文字阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(
      this.number.toString(),
      this.x + this.width / 2,
      this.y + this.height / 2
    );
    
    ctx.restore();
  }
}