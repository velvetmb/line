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

  // Line clear — Nintendo Switch Joy-Con "click" style
  const playLineClear = useCallback(() => {
    if (muted) return;
    const ctx = ensureCtx();
    const master = getMaster();
    if (!ctx || !master) return;
    const t = ctx.currentTime;

    // Part 1: Sharp initial transient — the "snap"
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(3200, t);
    snap.frequency.exponentialRampToValueAtTime(1800, t + 0.015);
    snapGain.gain.setValueAtTime(0.18, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    snap.connect(snapGain).connect(master);
    snap.start(t);
    snap.stop(t + 0.03);

    // Part 2: Bright metallic resonance — the "ring"
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1400, t + 0.01);
    ring.frequency.exponentialRampToValueAtTime(1000, t + 0.12);
    ringGain.gain.setValueAtTime(0.14, t + 0.01);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    ring.connect(ringGain).connect(master);
    ring.start(t + 0.01);
    ring.stop(t + 0.12);

    // Part 3: Sub-harmonic body — gives it weight
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(700, t + 0.005);
    sub.frequency.exponentialRampToValueAtTime(400, t + 0.08);
    subGain.gain.setValueAtTime(0.08, t + 0.005);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    sub.connect(subGain).connect(master);
    sub.start(t + 0.005);
    sub.stop(t + 0.08);

    // Part 4: Tiny noise burst for texture
    const bufferSize = Math.floor(ctx.sampleRate * 0.02);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 6);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(4000, t);
    noise.connect(hpf).connect(noiseGain).connect(master);
    noise.start(t);
    noise.stop(t + 0.025);
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
