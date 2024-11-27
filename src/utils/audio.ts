class AudioManager {
  private static instance: AudioManager;
  private backgroundMusic: HTMLAudioElement;
  private dropSound: HTMLAudioElement;
  private winSound: HTMLAudioElement;
  private loseSound: HTMLAudioElement;
  private isMuted: boolean = false;
  private isWinSoundPlaying: boolean = false;

  private constructor() {
    this.backgroundMusic = new Audio('/sounds/harvest-background.mp3');
    this.backgroundMusic.loop = true;
    this.dropSound = new Audio('/sounds/piece-drop.mp3');
    this.winSound = new Audio('/sounds/win.mp3');
    this.loseSound = new Audio('/sounds/lose.mp3');

    this.winSound.addEventListener('ended', () => {
      this.isWinSoundPlaying = false;
      this.playBackgroundMusic();
    });

    this.loseSound.addEventListener('ended', () => {
      this.playBackgroundMusic();
    });
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return this.isMuted;
  }

  playBackgroundMusic() {
    if (!this.isMuted) {
      console.log('Playing background music');
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(() => {
        console.log('Background music auto-play prevented');
      });
    }
  }

  stopBackgroundMusic() {
    console.log('Stopping background music');
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
  }

  playDropSound() {
    if (!this.isMuted) {
      this.dropSound.currentTime = 0;
      this.dropSound.play().catch(console.error);
    }
  }

  playWinSound() {
    if (!this.isMuted && !this.isWinSoundPlaying) {
      console.log('Playing win sound');
      this.isWinSoundPlaying = true;
      this.winSound.currentTime = 0;
      this.winSound.play().catch(console.error);
    }
  }

  playLoseSound() {
    if (!this.isMuted && !this.isWinSoundPlaying) {
      console.log('Playing lose sound');
      this.loseSound.currentTime = 0;
      this.loseSound.play().catch(console.error);
    }
  }

  stopAllSoundEffects() {
    console.log('Stopping all sound effects');
    this.isWinSoundPlaying = false;
    this.winSound.pause();
    this.winSound.currentTime = 0;
    this.loseSound.pause();
    this.loseSound.currentTime = 0;
  }
}

export const audioManager = AudioManager.getInstance();