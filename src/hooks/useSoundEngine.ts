import { useCallback, useEffect, useRef } from "react";
import {
  isAudioEnabled as ytIsAudioEnabled,
  onAudioEnabledChange as ytOnAudioEnabledChange,
  onPause as ytOnPause,
  onResume as ytOnResume,
} from "@/lib/youtubePlayables";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.15) {
  if (audioCtx?.state === "suspended") return;
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
  if (audioCtx?.state === "suspended") return;
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
  // Track whether audio is enabled by YouTube's system setting
  const audioEnabledRef = useRef<boolean>(ytIsAudioEnabled());

  // ---------------------------------------------------------------------------
  // YouTube Playables Audio & Pause/Resume integration (REQUIRED)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Initialize audio state from YouTube settings (REQUIRED)
    audioEnabledRef.current = ytIsAudioEnabled();
    if (!audioEnabledRef.current && audioCtx) {
      audioCtx.suspend();
    }

    // Listen for YouTube audio toggle events (REQUIRED)
    const unsubAudio = ytOnAudioEnabledChange((enabled) => {
      audioEnabledRef.current = enabled;
      if (!audioCtx) return;
      if (enabled) {
        audioCtx.resume();
      } else {
        audioCtx.suspend();
      }
    });

    // Pause audio context when YouTube pauses the game (REQUIRED)
    const unsubPause = ytOnPause(() => {
      if (audioCtx) audioCtx.suspend();
    });

    // Resume audio context when YouTube resumes the game (REQUIRED)
    const unsubResume = ytOnResume(() => {
      if (audioCtx && audioEnabledRef.current) {
        audioCtx.resume();
      }
    });

    return () => {
      unsubAudio();
      unsubPause();
      unsubResume();
    };
  }, []);

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
    const cur = bgMusicRef.current;
    if (cur) {
      if (cur.timer !== null) clearInterval(cur.timer);
      cur.nodes.forEach(n => {
        try { (n as OscillatorNode).stop?.(); } catch {}
        try { n.disconnect(); } catch {}
      });
      try { cur.gain.disconnect(); } catch {}
      bgMusicRef.current = null;
    }
  }, []);

  const startBGMusic = useCallback((stageId: string = "city") => {
    if (bgMusicRef.current?.stageId === stageId) return;
    const prev = bgMusicRef.current;
    if (prev) {
      if (prev.timer !== null) clearInterval(prev.timer);
      prev.nodes.forEach(n => {
        try { (n as OscillatorNode).stop?.(); } catch {}
        try { n.disconnect(); } catch {}
      });
      try { prev.gain.disconnect(); } catch {}
      bgMusicRef.current = null;
    }

    const ctx = getAudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.12;

    // Soft reverb-ish tail via delay feedback
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.34;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(fb); fb.connect(delay); delay.connect(wet);
    wet.connect(ctx.destination);
    master.connect(delay);
    master.connect(ctx.destination);

    const nodes: AudioNode[] = [delay, fb, wet];

    // Calm, melodic loops (lo-fi / ambient piano feel) per stage
    type Song = { scale: number[]; bass: number[]; tempo: number; pad: OscillatorType; lead: OscillatorType };
    const songs: Record<string, Song> = {
      // A minor pentatonic — mellow city night
      city: { scale: [440, 523.25, 587.33, 659.25, 783.99, 880], bass: [110, 130.81, 146.83, 98], tempo: 500, pad: "sine", lead: "triangle" },
      // F lydian-ish — warm sunset
      rooftop: { scale: [349.23, 392, 440, 523.25, 587.33, 698.46], bass: [87.31, 98, 116.54, 130.81], tempo: 560, pad: "sine", lead: "sine" },
      // D minor — deep, slow underground
      subway: { scale: [293.66, 349.23, 392, 440, 523.25, 587.33], bass: [73.42, 87.31, 98, 65.41], tempo: 640, pad: "triangle", lead: "sine" },
      // C major open — airy night bridge
      bridge: { scale: [392, 440, 523.25, 587.33, 659.25, 783.99], bass: [98, 110, 130.81, 82.41], tempo: 600, pad: "sine", lead: "triangle" },
    };
    const song = songs[stageId] ?? songs.city;

    const voice = (freq: number, time: number, dur: number, type: OscillatorType, vol: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1800;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(vol, time + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(lp); lp.connect(g); g.connect(master);
      osc.start(time);
      osc.stop(time + dur + 0.05);
    };

    // Sustained pad for warmth
    [song.bass[0] * 2, song.bass[0] * 3].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = song.pad;
      osc.frequency.value = f;
      g.gain.value = i === 0 ? 0.035 : 0.018;
      osc.connect(g); g.connect(master);
      osc.start();
      nodes.push(osc, g);
    });

    let step = 0;
    const playStep = () => {
      const t = ctx.currentTime + 0.02;
      const beat = song.tempo / 1000;
      // gentle bass every 4 steps
      if (step % 4 === 0) {
        voice(song.bass[(step / 4) % song.bass.length], t, beat * 3.2, "sine", 0.09);
      }
      // melody: mostly notes, some rests for space
      if (step % 8 !== 3 && step % 8 !== 7) {
        const n = song.scale[Math.floor(Math.random() * song.scale.length)];
        voice(n, t, beat * 1.6, song.lead, 0.05);
        // soft harmony a fifth up occasionally
        if (step % 6 === 0) voice(n * 1.5, t + beat * 0.5, beat * 1.2, "sine", 0.025);
      }
      step = (step + 1) % 64;
    };
    playStep();
    const timer = window.setInterval(playStep, song.tempo);

    // Subtle stage ambience, quieter than before
    const ambience = (filterType: BiquadFilterType, freq: number, vol: number, q?: number) => {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = filterType; filter.frequency.value = freq;
      if (q !== undefined) filter.Q.value = q;
      const ng = ctx.createGain(); ng.gain.value = vol;
      source.connect(filter); filter.connect(ng); ng.connect(master);
      source.start();
      nodes.push(source, filter, ng);
    };
    if (stageId === "subway") ambience("lowpass", 180, 0.06);
    if (stageId === "bridge") ambience("bandpass", 600, 0.05, 0.5);
    if (stageId === "rooftop") ambience("bandpass", 900, 0.02, 0.4);

    bgMusicRef.current = { nodes, gain: master, stageId, timer };
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
