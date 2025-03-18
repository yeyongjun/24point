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
    
    // 消息反馈相关属性
    this.messages = []; // 消息队列
    this.messageTimeout = 2000; // 消息显示时间（毫秒）
    
    // 分数动画相关属性
    this.scoreAnimations = []; // 分数动画队列
    
    // 提示相关属性
    this.hint = null; // 当前提示
    this.hintDuration = 5000; // 提示显示时间（毫秒）
    this.hintStartTime = 0; // 提示开始时间
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
    const now = Date.now();
    
    // 更新正确/错误反馈动画
    if (this.visible) {
      const elapsed = now - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // 更新透明度和缩放
      this.alpha = progress < 0.8 ? progress * 1.25 : (1 - progress) * 5;
      this.scale = 0.5 + progress * 0.5;
      
      // 动画结束
      if (progress >= 1) {
        this.visible = false;
      }
    }
    
    // 更新消息队列
    if (this.messages.length > 0) {
      this.messages = this.messages.filter(msg => {
        return now - msg.startTime < this.messageTimeout;
      });
    }
    
    // 更新分数动画
    if (this.scoreAnimations.length > 0) {
      this.scoreAnimations = this.scoreAnimations.filter(anim => {
        const elapsed = now - anim.startTime;
        const progress = Math.min(elapsed / 1000, 1); // 1秒动画
        
        // 更新位置和透明度
        anim.y -= 1; // 向上移动
        anim.alpha = 1 - progress; // 逐渐消失
        
        return progress < 1; // 保留未完成的动画
      });
    }
    
    // 更新提示
    if (this.hint) {
      const elapsed = now - this.hintStartTime;
      if (elapsed >= this.hintDuration) {
        this.hint = null; // 提示时间结束
      }
    }
  }
  
  /**
   * 绘制反馈
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {number} screenWidth - 屏幕宽度
   * @param {number} screenHeight - 屏幕高度
   */
  render(ctx, screenWidth, screenHeight) {
    // 绘制正确/错误反馈
    if (this.visible) {
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
    
    // 绘制消息
    if (this.messages.length > 0) {
      ctx.save();
      
      // 从下到上绘制消息
      const messageHeight = 30;
      const padding = 10;
      const startY = screenHeight - 100; // 底部留出空间
      
      this.messages.forEach((msg, index) => {
        const elapsed = Date.now() - msg.startTime;
        const progress = Math.min(elapsed / this.messageTimeout, 1);
        const alpha = progress < 0.8 ? 1 : (1 - progress) * 5; // 淡出效果
        
        ctx.globalAlpha = alpha;
        
        // 根据消息类型设置颜色
        let bgColor;
        switch (msg.type) {
          case 'success':
            bgColor = 'rgba(76, 175, 80, 0.8)'; // 绿色
            break;
          case 'error':
            bgColor = 'rgba(244, 67, 54, 0.8)'; // 红色
            break;
          case 'info':
          default:
            bgColor = 'rgba(33, 150, 243, 0.8)'; // 蓝色
            break;
        }
        
        // 计算消息宽度
        ctx.font = '16px Arial';
        const textWidth = ctx.measureText(msg.text).width;
        const boxWidth = textWidth + padding * 2;
        
        // 绘制圆角矩形背景
        const y = startY - index * (messageHeight + 5);
        const x = (screenWidth - boxWidth) / 2;
        
        this.drawRoundedRect(ctx, x, y, boxWidth, messageHeight, 5, bgColor);
        
        // 绘制文本
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(msg.text, screenWidth / 2, y + messageHeight / 2);
      });
      
      ctx.restore();
    }
    
    // 绘制分数动画
    if (this.scoreAnimations.length > 0) {
      ctx.save();
      
      this.scoreAnimations.forEach(anim => {
        ctx.globalAlpha = anim.alpha;
        ctx.fillStyle = '#ffeb3b'; // 黄色
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${anim.score}`, anim.x, anim.y);
      });
      
      ctx.restore();
    }
    
    // 绘制提示
    if (this.hint) {
      ctx.save();
      
      const elapsed = Date.now() - this.hintStartTime;
      const progress = Math.min(elapsed / this.hintDuration, 1);
      const alpha = progress < 0.8 ? 1 : (1 - progress) * 5; // 淡出效果
      
      ctx.globalAlpha = alpha;
      
      // 绘制提示背景
      const padding = 15;
      const lineHeight = 24;
      const boxWidth = 300;
      const boxHeight = lineHeight + padding * 2;
      const x = (screenWidth - boxWidth) / 2;
      const y = 200;
      
      this.drawRoundedRect(ctx, x, y, boxWidth, boxHeight, 8, 'rgba(97, 97, 97, 0.9)');
      
      // 绘制提示文本
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.hint, screenWidth / 2, y + boxHeight / 2);
      
      ctx.restore();
    }
  }
  
  /**
   * 绘制圆角矩形
   */
  drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  
  /**
   * 添加消息
   * @param {string} text - 消息文本
   * @param {string} type - 消息类型：success, error, info
   */
  addMessage(text, type = 'info') {
    // 添加到消息队列
    this.messages.push({
      text,
      type,
      startTime: Date.now()
    });
    
    // 限制消息数量，最多显示3条
    if (this.messages.length > 3) {
      this.messages.shift();
    }
  }
  
  /**
   * 添加分数动画
   * @param {number} score - 得分
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  addScoreAnimation(score, x, y) {
    this.scoreAnimations.push({
      score,
      x,
      y,
      alpha: 1,
      startTime: Date.now()
    });
  }
  
  /**
   * 添加提示
   * @param {string} hint - 提示文本
   */
  addHint(hint) {
    this.hint = hint;
    this.hintStartTime = Date.now();
  }
  
  /**
   * 设置动画持续时间
   * @param {number} duration - 持续时间（毫秒）
   */
  setDuration(duration) {
    this.duration = duration;
  }
  
  /**
   * 设置消息显示时间
   * @param {number} timeout - 显示时间（毫秒）
   */
  setMessageTimeout(timeout) {
    this.messageTimeout = timeout;
  }
  
  /**
   * 设置提示显示时间
   * @param {number} duration - 显示时间（毫秒）
   */
  setHintDuration(duration) {
    this.hintDuration = duration;
  }
  
  /**
   * 清除所有消息
   */
  clearMessages() {
    this.messages = [];
  }
  
  /**
   * 清除所有动画
   */
  clearAnimations() {
    this.scoreAnimations = [];
    this.hint = null;
    this.visible = false;
  }
}