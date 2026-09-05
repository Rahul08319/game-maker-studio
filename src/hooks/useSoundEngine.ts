import { useCallback, useRef } from "react";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.15) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.1) {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 800;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export function useSoundEngine() {
  const bgMusicRef = useRef<{ nodes: AudioNode[]; gain: GainNode; stageId: string; timer: number | null } | null>(null);

  const playPunch = useCallback(() => {
    playNoise(0.08, 0.2);
    playTone(200, 0.1, "square", 0.12);
    playTone(100, 0.05, "sawtooth", 0.1);
  }, []);

  const playKick = useCallback(() => {
    playTone(80, 0.15, "sine", 0.25);
    playNoise(0.1, 0.15);
    playTone(60, 0.2, "triangle", 0.15);
  }, []);

  const playWeb = useCallback(() => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  const playSpecial = useCallback(() => {
    playTone(300, 0.1, "square", 0.15);
    setTimeout(() => playTone(500, 0.1, "square", 0.15), 50);
    setTimeout(() => playTone(800, 0.2, "sawtooth", 0.2), 100);
    playNoise(0.3, 0.12);
  }, []);

  const playBlock = useCallback(() => {
    playTone(400, 0.05, "triangle", 0.08);
    playTone(600, 0.05, "triangle", 0.06);
  }, []);

  const playKO = useCallback(() => {
    playTone(400, 0.2, "square", 0.2);
    setTimeout(() => playTone(300, 0.2, "square", 0.2), 200);
    setTimeout(() => playTone(200, 0.4, "sawtooth", 0.25), 400);
  }, []);

  const playRoundWin = useCallback(() => {
    playTone(523, 0.15, "square", 0.15);
    setTimeout(() => playTone(659, 0.15, "square", 0.15), 150);
    setTimeout(() => playTone(784, 0.3, "square", 0.2), 300);
  }, []);

  const playMenuSelect = useCallback(() => {
    playTone(600, 0.08, "square", 0.1);
    setTimeout(() => playTone(900, 0.1, "square", 0.1), 60);
  }, []);

  const stopBGMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.nodes.forEach(n => {
        try { (n as OscillatorNode).stop?.(); } catch {}
        try { n.disconnect(); } catch {}
      });
      try { bgMusicRef.current.gain.disconnect(); } catch {}
      bgMusicRef.current = null;
    }
  }, []);

  const startBGMusic = useCallback((stageId: string = "city") => {
    if (bgMusicRef.current?.stageId === stageId) return;
    if (bgMusicRef.current) {
      bgMusicRef.current.nodes.forEach(n => {
        try { (n as OscillatorNode).stop?.(); } catch {}
        try { n.disconnect(); } catch {}
      });
      try { bgMusicRef.current.gain.disconnect(); } catch {}
      bgMusicRef.current = null;
    }
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    gain.connect(ctx.destination);
    const nodes: AudioNode[] = [];

    // Stage-specific layered drone + ambience
    const presets: Record<string, { freqs: number[]; types: OscillatorType[]; vol: number }> = {
      city:    { freqs: [55, 110, 220],  types: ["triangle", "square", "sawtooth"], vol: 0.04 },
      rooftop: { freqs: [82, 164, 246],  types: ["sine", "triangle", "sine"],       vol: 0.05 },
      subway:  { freqs: [40, 60, 90],    types: ["sawtooth", "square", "triangle"], vol: 0.05 },
      bridge:  { freqs: [73, 146, 293],  types: ["sine", "triangle", "sine"],       vol: 0.045 },
    };
    const p = presets[stageId] ?? presets.city;
    gain.gain.value = p.vol;
    p.freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = p.types[i] ?? "sine";
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start();
      nodes.push(osc);
    });

    // Subway: tunnel rumble noise
    if (stageId === "subway") {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.5;
      source.connect(filter); filter.connect(noiseGain); noiseGain.connect(gain);
      source.start();
      nodes.push(source, filter, noiseGain);
    }

    // Bridge: wind whoosh
    if (stageId === "bridge") {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass"; filter.frequency.value = 600; filter.Q.value = 0.5;
      const ng = ctx.createGain(); ng.gain.value = 0.3;
      source.connect(filter); filter.connect(ng); ng.connect(gain);
      source.start();
      nodes.push(source, filter, ng);
    }

    bgMusicRef.current = { nodes, gain, stageId };
  }, []);

  const playAttackSound = useCallback((type: string) => {
    switch (type) {
      case "punch": playPunch(); break;
      case "kick": playKick(); break;
      case "web": playWeb(); break;
      case "special": playSpecial(); break;
    }
  }, [playPunch, playKick, playWeb, playSpecial]);

  return {
    playPunch, playKick, playWeb, playSpecial, playBlock, playKO,
    playRoundWin, playMenuSelect, playAttackSound, startBGMusic, stopBGMusic,
  };
}
