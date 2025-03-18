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
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      '选择难度:',
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 - 100 + 240
    );
    
    // 绘制三个难度按钮
    const buttonColors = {
      easy: '#4CAF50', // 绿色
      normal: '#2196F3', // 蓝色
      hard: '#F44336' // 红色
    };
    
    const buttonTexts = {
      easy: '简单',
      normal: '普通',
      hard: '困难'
    };
    
    this.difficultyBtnAreas.forEach(btn => {
      // 绘制按钮背景
      ctx.fillStyle = buttonColors[btn.difficulty];
      ctx.beginPath();
      const btnWidth = btn.endX - btn.startX;
      const btnHeight = btn.endY - btn.startY;
      const radius = 5;
      
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
      ctx.fill();
      
      // 绘制按钮文本
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        buttonTexts[btn.difficulty],
        btn.startX + btnWidth / 2,
        btn.startY + btnHeight / 2
      );
    });
  }

  drawGameOverImage(ctx) {
    ctx.drawImage(
      atlas,
      0,
      0,
      119,
      108,
      SCREEN_WIDTH / 2 - 150,
      SCREEN_HEIGHT / 2 - 100,
      300,
      300
    );
  }

  drawGameOverText(ctx, score) {
    this.setFont(ctx);
    ctx.fillText(
      '游戏结束',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 50
    );
    ctx.fillText(
      `得分: ${score}`,
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 130
    );
  }

  drawRestartButton(ctx) {
    ctx.drawImage(
      atlas,
      120,
      6,
      39,
      24,
      SCREEN_WIDTH / 2 - 60,
      SCREEN_HEIGHT / 2 - 100 + 180,
      120,
      40
    );
    ctx.fillText(
      '重新开始',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 205
    );
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
