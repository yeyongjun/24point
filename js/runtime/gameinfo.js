import Emitter from '../libs/tinyemitter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const atlas = wx.createImage();
atlas.src = 'images/Common.png';

export default class GameInfo extends Emitter {
  constructor() {
    super();

    // 重新开始按钮区域
    this.btnArea = {
      startX: SCREEN_WIDTH / 2 - 60,
      startY: SCREEN_HEIGHT / 2 - 100 + 180,
      endX: SCREEN_WIDTH / 2 + 60,
      endY: SCREEN_HEIGHT / 2 - 100 + 220,
    };
    
    // 难度选择按钮区域
    this.difficultyBtnAreas = [
      { // 简单
        startX: SCREEN_WIDTH / 2 - 120,
        startY: SCREEN_HEIGHT / 2 - 100 + 230,
        endX: SCREEN_WIDTH / 2 - 40,
        endY: SCREEN_HEIGHT / 2 - 100 + 270,
        difficulty: 'easy'
      },
      { // 普通
        startX: SCREEN_WIDTH / 2 - 30,
        startY: SCREEN_HEIGHT / 2 - 100 + 230,
        endX: SCREEN_WIDTH / 2 + 30,
        endY: SCREEN_HEIGHT / 2 - 100 + 270,
        difficulty: 'normal'
      },
      { // 困难
        startX: SCREEN_WIDTH / 2 + 40,
        startY: SCREEN_HEIGHT / 2 - 100 + 230,
        endX: SCREEN_WIDTH / 2 + 120,
        endY: SCREEN_HEIGHT / 2 - 100 + 270,
        difficulty: 'hard'
      }
    ];

    // 绑定触摸事件
    wx.onTouchStart(this.touchEventHandler.bind(this))
  }

  setFont(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
  }

  render(ctx) {
    this.renderGameScore(ctx, GameGlobal.databus.score); // 绘制当前分数

    // 游戏结束时停止帧循环并显示游戏结束画面
    if (GameGlobal.databus.isGameOver) {
      this.renderGameOver(ctx, GameGlobal.databus.score); // 绘制游戏结束画面
    }
  }

  renderGameScore(ctx, score) {
    this.setFont(ctx);
    ctx.fillText(score, 10, 30);
  }

  renderGameOver(ctx, score) {
    this.drawGameOverImage(ctx);
    this.drawGameOverText(ctx, score);
    this.drawRestartButton(ctx);
    this.drawDifficultyButtons(ctx);
  }
  
  /**
   * 绘制难度选择按钮
   */
  drawDifficultyButtons(ctx) {
    // 绘制难度选择提示文本
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.fillStyle = '#FFEB3B'; // 黄色标题
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      '选择难度',
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 + 140
    );
    
    // 绘制三个难度按钮
    const buttonColors = {
      easy: ['#66BB6A', '#43A047'], // 绿色渐变
      normal: ['#42A5F5', '#1E88E5'], // 蓝色渐变
      hard: ['#EF5350', '#D32F2F'] // 红色渐变
    };
    
    const buttonTexts = {
      easy: '简单',
      normal: '普通',
      hard: '困难'
    };
    
    // 重新计算按钮位置，使其更加美观
    const btnWidth = 80;
    const btnHeight = 40;
    const gap = 20;
    const totalWidth = btnWidth * 3 + gap * 2;
    const startX = SCREEN_WIDTH / 2 - totalWidth / 2;
    const startY = SCREEN_HEIGHT / 2 + 160;
    
    // 更新按钮区域位置
    this.difficultyBtnAreas[0].startX = startX;
    this.difficultyBtnAreas[0].startY = startY;
    this.difficultyBtnAreas[0].endX = startX + btnWidth;
    this.difficultyBtnAreas[0].endY = startY + btnHeight;
    
    this.difficultyBtnAreas[1].startX = startX + btnWidth + gap;
    this.difficultyBtnAreas[1].startY = startY;
    this.difficultyBtnAreas[1].endX = startX + btnWidth * 2 + gap;
    this.difficultyBtnAreas[1].endY = startY + btnHeight;
    
    this.difficultyBtnAreas[2].startX = startX + btnWidth * 2 + gap * 2;
    this.difficultyBtnAreas[2].startY = startY;
    this.difficultyBtnAreas[2].endX = startX + btnWidth * 3 + gap * 2;
    this.difficultyBtnAreas[2].endY = startY + btnHeight;
    
    // 绘制按钮
    this.difficultyBtnAreas.forEach(btn => {
      // 设置阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // 绘制按钮背景
      ctx.beginPath();
      const radius = 8;
      
      // 绘制圆角矩形
      ctx.moveTo(btn.startX + radius, btn.startY);
      ctx.lineTo(btn.endX - radius, btn.startY);
      ctx.arcTo(btn.endX, btn.startY, btn.endX, btn.startY + radius, radius);
      ctx.lineTo(btn.endX, btn.endY - radius);
      ctx.arcTo(btn.endX, btn.endY, btn.endX - radius, btn.endY, radius);
      ctx.lineTo(btn.startX + radius, btn.endY);
      ctx.arcTo(btn.startX, btn.endY, btn.startX, btn.endY - radius, radius);
      ctx.lineTo(btn.startX, btn.startY + radius);
      ctx.arcTo(btn.startX, btn.startY, btn.startX + radius, btn.startY, radius);
      ctx.closePath();
      
      // 使用渐变填充
      const gradient = ctx.createLinearGradient(btn.startX, btn.startY, btn.startX, btn.endY);
      gradient.addColorStop(0, buttonColors[btn.difficulty][0]);
      gradient.addColorStop(1, buttonColors[btn.difficulty][1]);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // 绘制按钮边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 绘制按钮文本
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 1;
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        buttonTexts[btn.difficulty],
        btn.startX + (btn.endX - btn.startX) / 2,
        btn.startY + (btn.endY - btn.startY) / 2
      );
    });
    
    // 重置阴影和文本对齐
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'left';
  }

  drawGameOverImage(ctx) {
    // 绘制半透明背景遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    // 绘制游戏结束面板背景
    const panelWidth = 320;
    const panelHeight = 400;
    const panelX = SCREEN_WIDTH / 2 - panelWidth / 2;
    const panelY = SCREEN_HEIGHT / 2 - panelHeight / 2;
    
    // 绘制面板阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // 绘制圆角矩形面板
    ctx.beginPath();
    const radius = 15;
    ctx.moveTo(panelX + radius, panelY);
    ctx.lineTo(panelX + panelWidth - radius, panelY);
    ctx.arcTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + radius, radius);
    ctx.lineTo(panelX + panelWidth, panelY + panelHeight - radius);
    ctx.arcTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - radius, panelY + panelHeight, radius);
    ctx.lineTo(panelX + radius, panelY + panelHeight);
    ctx.arcTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - radius, radius);
    ctx.lineTo(panelX, panelY + radius);
    ctx.arcTo(panelX, panelY, panelX + radius, panelY, radius);
    ctx.closePath();
    
    // 使用渐变填充面板
    const gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
    gradient.addColorStop(0, '#3949AB');
    gradient.addColorStop(1, '#1A237E');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
  }

  drawGameOverText(ctx, score) {
    // 绘制游戏结束标题
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 游戏结束标题
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#FFEB3B'; // 黄色标题
    ctx.fillText(
      '游戏结束',
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 - 120
    );
    
    // 绘制分割线
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.moveTo(SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2 - 80);
    ctx.lineTo(SCREEN_WIDTH / 2 + 100, SCREEN_HEIGHT / 2 - 80);
    ctx.stroke();
    
    // 绘制得分
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.font = '24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      '最终得分',
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 - 40
    );
    
    // 得分数字
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#4CAF50'; // 绿色分数
    ctx.fillText(
      `${score}`,
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 + 10
    );
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'left'; // 重置文本对齐方式
  }

  drawRestartButton(ctx) {
    const btnWidth = 160;
    const btnHeight = 50;
    const btnX = SCREEN_WIDTH / 2 - btnWidth / 2;
    const btnY = SCREEN_HEIGHT / 2 + 70;
    
    // 绘制按钮阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 绘制圆角矩形按钮
    ctx.beginPath();
    const radius = 10;
    ctx.moveTo(btnX + radius, btnY);
    ctx.lineTo(btnX + btnWidth - radius, btnY);
    ctx.arcTo(btnX + btnWidth, btnY, btnX + btnWidth, btnY + radius, radius);
    ctx.lineTo(btnX + btnWidth, btnY + btnHeight - radius);
    ctx.arcTo(btnX + btnWidth, btnY + btnHeight, btnX + btnWidth - radius, btnY + btnHeight, radius);
    ctx.lineTo(btnX + radius, btnY + btnHeight);
    ctx.arcTo(btnX, btnY + btnHeight, btnX, btnY + btnHeight - radius, radius);
    ctx.lineTo(btnX, btnY + radius);
    ctx.arcTo(btnX, btnY, btnX + radius, btnY, radius);
    ctx.closePath();
    
    // 使用渐变填充按钮
    const gradient = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#388E3C');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 绘制按钮边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制按钮文字
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      '重新开始',
      btnX + btnWidth / 2,
      btnY + btnHeight / 2
    );
    
    // 重置阴影和文本对齐
    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'left';
  }

  touchEventHandler(event) {
    const { clientX, clientY } = event.touches[0]; // 获取触摸点的坐标

    // 当前只有游戏结束时展示了UI，所以只处理游戏结束时的状态
    if (GameGlobal.databus.isGameOver) {
      // 检查触摸是否在重新开始按钮区域内
      if (
        clientX >= this.btnArea.startX &&
        clientX <= this.btnArea.endX &&
        clientY >= this.btnArea.startY &&
        clientY <= this.btnArea.endY
      ) {
        // 调用重启游戏的回调函数
        this.emit('restart');
      }
      
      // 检查触摸是否在难度选择按钮区域内
      for (const btn of this.difficultyBtnAreas) {
        if (
          clientX >= btn.startX &&
          clientX <= btn.endX &&
          clientY >= btn.startY &&
          clientY <= btn.endY
        ) {
          // 调用选择难度的回调函数
          this.emit('selectDifficulty', btn.difficulty);
          break;
        }
      }
    }
  }
}
