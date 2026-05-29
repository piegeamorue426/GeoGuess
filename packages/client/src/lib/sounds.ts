let soundEnabled = true;

const SOUND_PATHS = {
  click: '/sounds/click.mp3',
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  levelUp: '/sounds/level-up.mp3',
};

let audioCache: Record<string, HTMLAudioElement> = {};

function canPlayAudio(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

function getAudio(key: keyof typeof SOUND_PATHS): HTMLAudioElement | null {
  if (!canPlayAudio()) return null;

  if (!audioCache[key]) {
    audioCache[key] = new Audio(SOUND_PATHS[key]);
  }
  return audioCache[key];
}

function playSound(key: keyof typeof SOUND_PATHS): void {
  if (!soundEnabled) return;

  const audio = getAudio(key);
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {
    // Silently handle autoplay restrictions
  });
}

export function playClick(): void {
  playSound('click');
}

export function playCorrect(): void {
  playSound('correct');
}

export function playWrong(): void {
  playSound('wrong');
}

export function playLevelUp(): void {
  playSound('levelUp');
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}
