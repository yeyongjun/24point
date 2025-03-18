/**
 * 道具类
 * 用于表示24点游戏中的辅助道具
 */
import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

// 道具相关常量
const ITEM_WIDTH = 50;
const ITEM_HEIGHT = 50;
const ITEM_SHADOW_COLOR = 'rgba(0, 0, 0, 0.2)';
const ITEM_BORDER_RADIUS = 8;

// 道具类型及其颜色
const ITEM_TYPES = {
  HINT: {
    name: '提示',
    color: '#4fc3f7',
    description: '显示一个可能的解法'
  },
  SKIP: {
    name: '跳过',
    color: '#ff8a65',
    description: '跳过当前题目'
  },
  TIME: {
    name: '+10秒',
    color: '#81c784',
    description: '增加10秒时间'
  },
  WILD: {
    name: '万能',
    color: '#ffb74d',
    description: '可以代表任意数字1-13'
  }
};

export default class Item extends Sprite {
  constructor(type, index) {
    super('', ITEM_WIDTH, ITEM_HEIGHT);
    
    this.type = type; // 道具类型
    this.index = index; // 道具的索引，用于确定位置
    this.used = false; // 是否已被使用
    this.count = 1; // 道具数量
    
    // 初始化道具位置
    this.init();
  }
  
  init() {
    // 根据索引计算道具位置
    const gap = 10; // 道具之间的间隔
    const totalWidth = ITEM_WIDTH * 4 + gap * 3; // 4个道具的总宽度
    const startX = (SCREEN_WIDTH - totalWidth) / 2; // 起始X坐标
    
    this.x = startX + (ITEM_WIDTH + gap) * this.index;
    this.y = SCREEN_HEIGHT - ITEM_HEIGHT - 20; // 放在屏幕底部
    
    this.used = false;
    this.visible = true;
  }
  
  /**
   * 检查点击是否在道具上
   */
  checkTap(x, y) {
    return this.count > 0 && 
           x >= this.x && 
           x <= this.x + this.width && 
           y >= this.y && 
           y <= this.y + this.height;
  }
  
  /**
   * 使用道具
   */
  use() {
    if (this.count > 0) {
      this.count--;
      return true;
    }
    return false;
  }
  
  /**
   * 增加道具数量
   */
  addCount(amount = 1) {
    this.count += amount;
  }
  
  /**
   * 获取道具类型信息
   */
  getTypeInfo() {
    return ITEM_TYPES[this.type];
  }
  
  /**
   * 绘制道具
   */
  render(ctx) {
    if (!this.visible) return;
    
    ctx.save();
    
    // 绘制道具阴影
    ctx.shadowColor = ITEM_SHADOW_COLOR;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // 绘制道具背景（带圆角）
    ctx.beginPath();
    ctx.moveTo(this.x + ITEM_BORDER_RADIUS, this.y);
    ctx.lineTo(this.x + this.width - ITEM_BORDER_RADIUS, this.y);
    ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + ITEM_BORDER_RADIUS, ITEM_BORDER_RADIUS);
    ctx.lineTo(this.x + this.width, this.y + this.height - ITEM_BORDER_RADIUS);
    ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - ITEM_BORDER_RADIUS, this.y + this.height, ITEM_BORDER_RADIUS);
    ctx.lineTo(this.x + ITEM_BORDER_RADIUS, this.y + this.height);
    ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - ITEM_BORDER_RADIUS, ITEM_BORDER_RADIUS);
    ctx.lineTo(this.x, this.y + ITEM_BORDER_RADIUS);
    ctx.arcTo(this.x, this.y, this.x + ITEM_BORDER_RADIUS, this.y, ITEM_BORDER_RADIUS);
    ctx.closePath();
    
    // 设置道具颜色
    const typeInfo = this.getTypeInfo();
    ctx.fillStyle = this.count > 0 ? typeInfo.color : '#bdbdbd';
    ctx.fill();
    
    ctx.shadowColor = 'transparent'; // 关闭阴影，避免影响边框
    
    // 绘制道具边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 绘制道具名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加文字阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(
      typeInfo.name,
      this.x + this.width / 2,
      this.y + this.height / 2 - 8
    );
    
    // 绘制道具数量
    ctx.font = 'bold 14px Arial';
    ctx.fillText(
      `x${this.count}`,
      this.x + this.width / 2,
      this.y + this.height / 2 + 10
    );
    
    ctx.restore();
  }
}

// 导出道具类型常量
export { ITEM_TYPES };