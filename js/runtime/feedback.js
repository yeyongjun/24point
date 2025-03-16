/**
 * 结果反馈类
 * 用于显示24点游戏中答案正确或错误的反馈效果
 */
export default class Feedback {
  constructor() {
    this.visible = false;
    this.isCorrect = false;
    this.alpha = 0; // 透明度
    this.scale = 0.5; // 缩放比例
    this.duration = 1500; // 动画持续时间（毫秒）
    this.startTime = 0; // 动画开始时间
  }
  
  /**
   * 显示反馈
   * @param {boolean} isCorrect - 答案是否正确
   */
  show(isCorrect) {
    this.visible = true;
    this.isCorrect = isCorrect;
    this.alpha = 0;
    this.scale = 0.5;
    this.startTime = Date.now();
    
    // 播放对应的音效
    if (isCorrect) {
      GameGlobal.musicManager.playCorrect();
    } else {
      GameGlobal.musicManager.playWrong();
    }
  }
  
  /**
   * 更新反馈动画
   */
  update() {
    if (!this.visible) return;
    
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // 更新透明度和缩放
    this.alpha = progress < 0.8 ? progress * 1.25 : (1 - progress) * 5;
    this.scale = 0.5 + progress * 0.5;
    
    // 动画结束
    if (progress >= 1) {
      this.visible = false;
    }
  }
  
  /**
   * 绘制反馈
   */
  render(ctx, screenWidth, screenHeight) {
    if (!this.visible) return;
    
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // 绘制背景圆
    const radius = 100 * this.scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.isCorrect ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)';
    ctx.fill();
    
    // 绘制图标
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.floor(60 * this.scale)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.isCorrect ? '✓' : '✗',
      centerX,
      centerY
    );
    
    ctx.restore();
  }
}