// Web Audio EQ chain wired into the htmlPlayer.
// 5 bands: 60Hz (lowshelf), 250Hz, 1kHz, 4kHz, 12kHz (highshelf).

export const EQ_BANDS = [60, 250, 1000, 4000, 12000] as const;
export type EqBands = [number, number, number, number, number];

export const EQ_PRESETS: Record<string, EqBands> = {
  Flat:     [0, 0, 0, 0, 0],
  "Bass Boost": [8, 5, 0, -1, -2],
  Pop:      [-1, 2, 4, 3, 1],
  Rock:     [4, 2, -1, 3, 5],
  Vocal:    [-2, 0, 5, 4, 2],
  Classical:[3, 2, -1, 2, 4],
  Acoustic: [4, 3, 2, 3, 4],
  "Late Night": [-3, -1, 2, 3, 5],
  Dance:    [6, 3, 0, 3, 6],
};

let ctx: AudioContext | null = null;
let source: MediaElementAudioSourceNode | null = null;
let filters: BiquadFilterNode[] | null = null;
let preGain: GainNode | null = null;

function ensureChain(audioEl: HTMLAudioElement) {
  if (ctx) return;
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    source = ctx.createMediaElementSource(audioEl);
    preGain = ctx.createGain();
    preGain.gain.value = 1;
    filters = EQ_BANDS.map((freq, i) => {
      const f = ctx!.createBiquadFilter();
      if (i === 0) f.type = "lowshelf";
      else if (i === EQ_BANDS.length - 1) f.type = "highshelf";
      else f.type = "peaking";
      f.frequency.value = freq;
      f.Q.value = 1;
      f.gain.value = 0;
      return f;
    });
    // Connect: source -> preGain -> f0 -> f1 -> ... -> destination
    source.connect(preGain);
    let node: AudioNode = preGain;
    for (const f of filters) {
      node.connect(f);
      node = f;
    }
    node.connect(ctx.destination);
  } catch (e) {
    // Some browsers throw if element is already piped
    console.warn("EQ init failed", e);
  }
}

export function attachEqualizer(audioEl: HTMLAudioElement) {
  ensureChain(audioEl);
}

export function setEqGains(gains: EqBands) {
  if (!filters) return;
  gains.forEach((g, i) => {
    if (filters![i]) filters![i].gain.value = g;
  });
}

export function setEqEnabled(on: boolean, gains: EqBands) {
  if (!filters) return;
  if (on) setEqGains(gains);
  else setEqGains([0, 0, 0, 0, 0]);
}

export function resumeContext() {
  if (ctx?.state === "suspended") void ctx.resume();
}
