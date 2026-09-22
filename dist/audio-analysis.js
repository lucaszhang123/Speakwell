// src/audio-analysis.js
var clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
var mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
var deviation = (values) => {
  if (values.length < 2) return 0;
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
};
var percentile = (values, fraction) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))];
};
function estimatePitch(samples, sampleRate) {
  let rms = 0;
  for (const sample of samples) rms += sample * sample;
  rms = Math.sqrt(rms / samples.length);
  if (rms < 0.012) return null;
  const minLag = Math.floor(sampleRate / 350);
  const maxLag = Math.min(Math.floor(sampleRate / 75), samples.length - 1);
  let bestLag = 0;
  let bestCorrelation = 0;
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let energyA = 0;
    let energyB = 0;
    for (let index = 0; index < samples.length - lag; index += 1) {
      correlation += samples[index] * samples[index + lag];
      energyA += samples[index] ** 2;
      energyB += samples[index + lag] ** 2;
    }
    correlation /= Math.sqrt(energyA * energyB) || 1;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }
  return bestCorrelation >= 0.65 && bestLag ? sampleRate / bestLag : null;
}
function summarizeAudio({ levels = [], pitches = [], totalFrames = 0, voicedFrames = 0 } = {}) {
  const pitchSemitones = pitches.map((pitch) => 12 * Math.log2(pitch / 100));
  return {
    available: levels.length >= 5,
    volumeVariationDb: Math.round(deviation(levels) * 10) / 10,
    volumeRangeDb: Math.round((percentile(levels, 0.9) - percentile(levels, 0.1)) * 10) / 10,
    pitchVariationSt: Math.round(deviation(pitchSemitones) * 10) / 10,
    pitchRangeSt: Math.round((percentile(pitchSemitones, 0.9) - percentile(pitchSemitones, 0.1)) * 10) / 10,
    voicedRatio: totalFrames ? Math.round(voicedFrames / totalFrames * 100) / 100 : 0,
    pitchSamples: pitches.length
  };
}
function scoreSpeaking(audio, transcript) {
  if (!transcript.valid || !audio?.available) return { score: null, valid: false, monotone: null, rushing: null, components: {} };
  const volumeScore = Math.round(clamp(100 - Math.max(0, audio.volumeVariationDb - 5) * 11));
  const variationScore = Math.round(clamp(35 + audio.pitchVariationSt * 22 + Math.min(audio.pitchRangeSt, 10) * 2.5));
  const pacePenalty = transcript.pace > 180 ? (transcript.pace - 180) * 1.5 : transcript.pace < 95 ? (95 - transcript.pace) * 0.8 : 0;
  const paceScore = Math.round(clamp(100 - pacePenalty));
  const fillerRate = (transcript.vocalizedFillers * 1.25 + transcript.contextualFillers + transcript.repeats * 0.6) / Math.max(transcript.words, 1);
  const fillerScore = Math.round(clamp(100 - fillerRate * 500));
  const voicePresenceScore = Math.round(clamp(100 - Math.max(0, 0.35 - audio.voicedRatio) * 150 - Math.max(0, audio.voicedRatio - 0.9) * 80));
  const monotone = audio.pitchSamples >= 8 && (audio.pitchVariationSt < 1.4 || audio.pitchRangeSt < 3.5);
  const rushing = transcript.pace > 180 || transcript.pace > 165 && audio.voicedRatio > 0.88;
  const score = Math.round(volumeScore * 0.2 + variationScore * 0.25 + paceScore * 0.25 + fillerScore * 0.2 + voicePresenceScore * 0.1);
  return { score, valid: true, monotone, rushing, components: { volumeConsistency: volumeScore, vocalVariation: variationScore, paceControl: paceScore, fillerControl: fillerScore, pauseControl: voicePresenceScore } };
}
async function createAudioTracker(stream) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return { stop: async () => summarizeAudio() };
  const context = new AudioContextClass();
  if (context.state === "suspended") await context.resume();
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.25;
  const source = context.createMediaStreamSource(stream);
  source.connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  const levels = [];
  const pitches = [];
  let totalFrames = 0;
  let voicedFrames = 0;
  const timer = setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    totalFrames += 1;
    let squareSum = 0;
    for (const sample of samples) squareSum += sample * sample;
    const rms = Math.sqrt(squareSum / samples.length);
    const db = 20 * Math.log10(Math.max(rms, 1e-5));
    if (db > -48) {
      voicedFrames += 1;
      levels.push(db);
      const pitch = estimatePitch(samples, context.sampleRate);
      if (pitch) pitches.push(pitch);
    }
  }, 100);
  return { async stop() {
    clearInterval(timer);
    source.disconnect();
    await context.close();
    return summarizeAudio({ levels, pitches, totalFrames, voicedFrames });
  } };
}
export {
  createAudioTracker,
  estimatePitch,
  scoreSpeaking,
  summarizeAudio
};
