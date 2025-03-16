let instance;

/**
 * 统一的音效管理器
 */
export default class Music {
  bgmAudio = wx.createInnerAudioContext();
  correctAudio = wx.createInnerAudioContext();
  wrongAudio = wx.createInnerAudioContext();
  clickAudio = wx.createInnerAudioContext();
  levelUpAudio = wx.createInnerAudioContext();
  gameOverAudio = wx.createInnerAudioContext();

  constructor() {
    if (instance) return instance;

    instance = this;

    // 初始化音频
    this.initAudio();
  }

  /**
   * 初始化所有音频
   */
  initAudio() {
    // 背景音乐设置
    this.bgmAudio.loop = true; // 背景音乐循环播放
    this.bgmAudio.autoplay = false; // 背景音乐自动播放
    this.bgmAudio.src = 'audio/bgm.mp3';
    this.bgmAudio.volume = 0.6; // 设置音量

    // 各种音效设置
    this.correctAudio.src = 'audio/correct.mp3';
    this.wrongAudio.src = 'audio/wrong.mp3';
    this.clickAudio.src = 'audio/click.mp3';
    this.levelUpAudio.src = 'audio/correct.mp3'; // 使用正确音效作为升级音效
    this.gameOverAudio.src = 'audio/wrong.mp3'; // 使用错误音效作为游戏结束音效
  }
  
  /**
   * 播放背景音乐
   */
  playBGM() {
    this.bgmAudio.play();
  }

  /**
   * 暂停背景音乐
   */
  pauseBGM() {
    this.bgmAudio.pause();
  }

  /**
   * 切换背景音乐
   * @param {string} src - 音乐文件路径
   */
  switchBGM(src) {
    this.bgmAudio.stop();
    this.bgmAudio.src = src;
    this.bgmAudio.play();
  }
  
  /**
   * 播放正确音效
   */
  playCorrect() {
    this.correctAudio.currentTime = 0;
    this.correctAudio.play();
  }
  
  /**
   * 播放错误音效
   */
  playWrong() {
    this.wrongAudio.currentTime = 0;
    this.wrongAudio.play();
  }

  /**
   * 播放点击音效
   */
  playClick() {
    this.clickAudio.currentTime = 0;
    this.clickAudio.play();
  }

  /**
   * 播放升级音效
   */
  playLevelUp() {
    this.levelUpAudio.currentTime = 0;
    this.levelUpAudio.play();
  }

  /**
   * 播放游戏结束音效
   */
  playGameOver() {
    this.gameOverAudio.currentTime = 0;
    this.gameOverAudio.play();
  }
}
