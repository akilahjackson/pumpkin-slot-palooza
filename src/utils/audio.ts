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

    // Add event listener to track when win sound finishes
    this.winSound.addEventListener('ended', () => {
      this.isWinSoundPlaying = false;
      this.backgroundMusic.play();
    });

    this.loseSound.addEventListener('ended', () => {
      this.backgroundMusic.play();
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
    this.backgroundMusic.muted = this.isMuted;
    return this.isMuted;
  }

  playBackgroundMusic() {
    if (!this.isMuted) {
      this.backgroundMusic.play().catch(() => console.log('Background music auto-play prevented'));
    }
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
      this.backgroundMusic.pause();
      this.winSound.currentTime = 0;
      this.winSound.play().catch(console.error);
    }
  }

  playLoseSound() {
    if (!this.isMuted && !this.isWinSoundPlaying) {
      console.log('Playing lose sound');
      this.backgroundMusic.pause();
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
    this.playBackgroundMusic();
  }
}

export const audioManager = AudioManager.getInstance();