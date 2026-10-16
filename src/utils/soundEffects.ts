// Web Audio API physical sound synthesis for Korean bills and coins

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Realistic paper rustling sound ("바스락 소리")
 * Synthesizes paper friction with filtered noise envelopes and gentle flutter
 */
export function playBillRustleSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Buffer length ~0.25 seconds
    const bufferSize = Math.floor(ctx.sampleRate * 0.28);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pink noise filtering
      const white = Math.random() * 2 - 1;
      const pink = (lastOut * 0.94) + (white * 0.06);
      lastOut = pink;
      
      // Micro crinkles
      const crackle = Math.random() > 0.92 ? (Math.random() - 0.5) * 0.6 : 0;
      data[i] = pink * 0.8 + crackle;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Bandpass filter centered around 1800Hz to simulate paper friction
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    filter.Q.setValueAtTime(1.8, now);

    // Highpass to eliminate low thumps
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(600, now);

    // Gain envelope with rapid dual-flutter
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.08);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.27);

    noiseNode.connect(filter);
    filter.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.28);
  } catch (err) {
    console.warn('Audio playback not allowed or failed:', err);
  }
}

/**
 * Realistic metallic coin clinking sound ("쨍그랑 소리")
 * Modal synthesis with tuned resonant frequencies and secondary bounce
 */
export function playCoinClinkSound(value: number = 100) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Frequencies tailored to coin mass & alloy:
    // 10 won: brass, lighter mass, higher pitch
    // 100 won: cupronickel medium
    // 500 won: heavy cupronickel, rich resonant sustain
    let baseFreq = 2800;
    let decay = 0.3;
    if (value === 10) {
      baseFreq = 3400;
      decay = 0.22;
    } else if (value === 500) {
      baseFreq = 2100;
      decay = 0.45;
    }

    const modes = [
      { freq: baseFreq, gain: 0.25 },
      { freq: baseFreq * 1.58, gain: 0.18 },
      { freq: baseFreq * 2.14, gain: 0.12 },
      { freq: baseFreq * 3.1, gain: 0.06 },
    ];

    // Primary impact
    modes.forEach(({ freq, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(g);
      g.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });

    // Secondary tiny bounce clink ~50ms later for tactile realism ("쨍그랑")
    const bounceTime = now + 0.055;
    const bounceModes = [
      { freq: baseFreq * 1.08, gain: 0.12 },
      { freq: baseFreq * 1.72, gain: 0.08 },
    ];

    bounceModes.forEach(({ freq, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, bounceTime);

      g.gain.setValueAtTime(gain, bounceTime);
      g.gain.exponentialRampToValueAtTime(0.0001, bounceTime + decay * 0.7);

      osc.connect(g);
      g.connect(ctx.destination);

      osc.start(bounceTime);
      osc.stop(bounceTime + decay * 0.7);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Payment success chime (cheerful store bell)
 */
export function playPaymentSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, t: 0.0, d: 0.25 },  // C5
      { f: 659.25, t: 0.09, d: 0.25 }, // E5
      { f: 783.99, t: 0.18, d: 0.35 }, // G5
      { f: 1046.50, t: 0.28, d: 0.6 }, // C6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      g.gain.setValueAtTime(0.001, now + t);
      g.gain.linearRampToValueAtTime(0.2, now + t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + t + d);

      osc.connect(g);
      g.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d);
    });

    // Coin ring overlay
    setTimeout(() => playCoinClinkSound(500), 280);
    setTimeout(() => playCoinClinkSound(100), 380);
  } catch (err) {
    console.warn('Audio error:', err);
  }
}

/**
 * Change returning flurry sound effect
 */
export function playChangeReturnSound() {
  try {
    playBillRustleSound();
    setTimeout(() => playCoinClinkSound(500), 70);
    setTimeout(() => playBillRustleSound(), 140);
    setTimeout(() => playCoinClinkSound(100), 210);
    setTimeout(() => playCoinClinkSound(10), 280);
  } catch (err) {
    console.warn('Audio error:', err);
  }
}

/**
 * Tactile leather wallet snap / pocket sound
 */
export function playWalletSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(g);
    g.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (err) {
    console.warn('Audio error:', err);
  }
}
