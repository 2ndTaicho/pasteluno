let audioContext = null;

function getAudioContext() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(frequency, duration, delay = 0, type = "sine") {
  const context = getAudioContext();

  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  const start = context.currentTime + delay;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.07, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(start);
  oscillator.stop(end + 0.01);
}

export function playSound(name, enabled) {
  if (!enabled) return;

  try {
    switch (name) {
      case "play":
        playTone(523.25, 0.12);
        playTone(659.25, 0.15, 0.08);
        break;

      case "draw":
        playTone(392, 0.12);
        playTone(329.63, 0.15, 0.08);
        break;

      case "uno":
        playTone(523.25, 0.12);
        playTone(659.25, 0.12, 0.1);
        playTone(783.99, 0.22, 0.2);
        break;

      case "win":
        playTone(523.25, 0.18);
        playTone(659.25, 0.18, 0.15);
        playTone(783.99, 0.18, 0.3);
        playTone(1046.5, 0.4, 0.45);
        break;

      case "start":
        playTone(440, 0.15);
        playTone(554.37, 0.15, 0.12);
        playTone(659.25, 0.25, 0.24);
        break;

      default:
        break;
    }
  } catch (error) {
    console.warn("Sound unavailable:", error);
  }
}
