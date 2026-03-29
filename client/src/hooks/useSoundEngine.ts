/*
 * Sound Engine Hook — Web Audio API synthesized sounds
 * Simplified: only 3 sounds
 * - select: soft click when picking a marble
 * - drop: gentle thud when placing a marble
 * - lineClear: Nintendo Switch-style "click" — crisp, iconic, satisfying
 *
 * Includes mute toggle and volume control with localStorage persistence
 */

import { useCallback, useEffect, useRef, useState } from 'react';

function getAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

export function useSoundEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('lines_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem('lines_volume');
      if (saved !== null) {
        const v = Number(saved);
        if (v >= 0 && v <= 100) return v;
      }
    } catch {}
    return 75;
  });

  // Lazy-init audio context and master gain on first user interaction
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = getAudioContext();
      if (ctxRef.current) {
        masterGainRef.current = ctxRef.current.createGain();
        masterGainRef.current.connect(ctxRef.current.destination);
      }
    }
    const ctx = ctxRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }, []);

  // Sync master gain with mute/volume state
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = muted ? 0 : volume / 100;
    }
  }, [muted, volume]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      try { localStorage.setItem('lines_muted', String(next)); } catch {}
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    setVolumeState(clamped);
    try { localStorage.setItem('lines_volume', String(clamped)); } catch {}
  }, []);

  // Helper: connect to master gain instead of destination
  const getMaster = useCallback(() => masterGainRef.current, []);

  // Marble select — soft click/tap
  const playSelect = useCallback(() => {
    if (muted) return;
    const ctx = ensureCtx();
    const master = getMaster();
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.07);
  }, [muted, ensureCtx, getMaster]);

  // Marble drop — gentle soft thud when marble lands
  const playDrop = useCallback(() => {
    if (muted) return;
    const ctx = ensureCtx();
    const master = getMaster();
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.1);
  }, [muted, ensureCtx, getMaster]);

  // Line clear — Switch-style snap/click with satisfying echo tail
  const playLineClear = useCallback(() => {
    if (muted) return;
    const ctx = ensureCtx();
    const master = getMaster();
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    // Echo bus — short reverb-like delay for that satisfying tail
    const echoBus = ctx.createGain();
    echoBus.gain.setValueAtTime(1, t);
    const echo1 = ctx.createDelay(0.5);
    echo1.delayTime.setValueAtTime(0.08, t);
    const echo1Gain = ctx.createGain();
    echo1Gain.gain.setValueAtTime(0.25, t);
    const echo2 = ctx.createDelay(0.5);
    echo2.delayTime.setValueAtTime(0.16, t);
    const echo2Gain = ctx.createGain();
    echo2Gain.gain.setValueAtTime(0.1, t);
    // Soften the echoes with a lowpass filter
    const echoFilter = ctx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.setValueAtTime(3000, t);
    // Dry signal → master, wet signal → delays → filter → master
    echoBus.connect(master);
    echoBus.connect(echo1);
    echo1.connect(echo1Gain).connect(echoFilter).connect(master);
    echoBus.connect(echo2);
    echo2.connect(echo2Gain).connect(echoFilter);

    // Part 1: Sharp initial transient — the "snap"
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(3400, t);
    snap.frequency.exponentialRampToValueAtTime(1600, t + 0.012);
    snapGain.gain.setValueAtTime(0.2, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    snap.connect(snapGain).connect(echoBus);
    snap.start(t);
    snap.stop(t + 0.03);

    // Part 2: Bright metallic resonance — the "ring"
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1500, t + 0.008);
    ring.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    ringGain.gain.setValueAtTime(0.15, t + 0.008);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    ring.connect(ringGain).connect(echoBus);
    ring.start(t + 0.008);
    ring.stop(t + 0.15);

    // Part 3: Harmonic shimmer — adds that "sparkle" to the echo tail
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(2800, t + 0.01);
    shimmer.frequency.exponentialRampToValueAtTime(2200, t + 0.1);
    shimmerGain.gain.setValueAtTime(0.06, t + 0.01);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    shimmer.connect(shimmerGain).connect(echoBus);
    shimmer.start(t + 0.01);
    shimmer.stop(t + 0.1);

    // Part 4: Sub-harmonic body — gives it weight
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(700, t + 0.005);
    sub.frequency.exponentialRampToValueAtTime(350, t + 0.1);
    subGain.gain.setValueAtTime(0.1, t + 0.005);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    sub.connect(subGain).connect(echoBus);
    sub.start(t + 0.005);
    sub.stop(t + 0.1);

    // Part 5: Noise burst for texture
    const bufferSize = Math.floor(ctx.sampleRate * 0.025);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 5);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(4000, t);
    noise.connect(hpf).connect(noiseGain).connect(echoBus);
    noise.start(t);
    noise.stop(t + 0.03);
  }, [muted, ensureCtx, getMaster]);

  return {
    muted,
    volume,
    toggleMute,
    setVolume,
    playSelect,
    playDrop,
    playLineClear,
  };
}
