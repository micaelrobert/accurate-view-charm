// Sons de conto de fadas sintetizados com Web Audio (sem arquivos, sem direitos autorais).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let lastFx = 0;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function bell(freq: number, start: number, dur = 1.6, vol = 0.12, dest?: AudioNode) {
  const c = getCtx();
  if (!c || !master) return;
  const t = c.currentTime + start;
  [1, 2.01, 3.02].forEach((m, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq * m;
    const v = vol / (i * 2 + 1);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (i + 1));
    o.connect(g).connect(dest ?? master!);
    o.start(t);
    o.stop(t + dur);
  });
}

function throttle() {
  const now = Date.now();
  if (now - lastFx < 120) return false;
  lastFx = now;
  return true;
}

export const sound = {
  sparkle() {
    if (!throttle()) return;
    [1568, 2093, 2637].forEach((f, i) => bell(f, i * 0.06, 0.9, 0.05));
  },
  harp() {
    lastFx = Date.now();
    [523, 659, 784, 988, 1047, 1319, 1568, 2093].forEach((f, i) => bell(f, i * 0.11, 2.2, 0.08));
  },
  fanfare() {
    lastFx = Date.now();
    [[784, 0], [988, 0.14], [1175, 0.28], [1568, 0.46], [1175, 0.46], [1976, 0.7]].forEach(([f, s]) => bell(f, s, 2, 0.08));
  },
  startMusic() {
    const c = getCtx();
    if (!c || !master || musicTimer) return;
    musicGain = c.createGain();
    musicGain.gain.value = 0;
    musicGain.gain.linearRampToValueAtTime(0.35, c.currentTime + 3);
    musicGain.connect(master);
    // Caixinha de música suave em Dó maior
    const chords = [
      [262, 330, 392, 523],
      [220, 262, 330, 440],
      [175, 220, 262, 349],
      [196, 247, 294, 392],
    ];
    let step = 0;
    const tick = () => {
      const chord = chords[Math.floor(step / 8) % chords.length];
      const note = chord[[0, 2, 1, 3, 2, 1, 3, 2][step % 8]] * 2;
      bell(note, 0, 2.4, 0.05, musicGain!);
      step++;
    };
    tick();
    musicTimer = setInterval(tick, 520);
  },
  stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    if (musicGain && ctx) {
      const g = musicGain;
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => g.disconnect(), 800);
    }
    musicGain = null;
  },
};
