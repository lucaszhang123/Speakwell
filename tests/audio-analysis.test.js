import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreSpeaking, summarizeAudio} from '../dist/audio-analysis.js';

const transcript = {valid: true, words: 60, pace: 140, vocalizedFillers: 1, contextualFillers: 1, repeats: 0};

test('detects flat pitch as monotone', () => {
  const audio = summarizeAudio({levels: [-25, -24, -25, -26, -25, -24, -25, -26], pitches: [120, 121, 120, 119, 120, 121, 120, 119], totalFrames: 10, voicedFrames: 7});
  const result = scoreSpeaking(audio, transcript);
  assert.equal(result.monotone, true);
  assert.ok(result.score >= 0 && result.score <= 100);
});

test('rewards expressive pitch more than flat pitch', () => {
  const flat = summarizeAudio({levels: Array(10).fill(-25), pitches: [120, 121, 120, 119, 120, 121, 120, 119], totalFrames: 10, voicedFrames: 7});
  const expressive = summarizeAudio({levels: [-27, -25, -23, -26, -24, -22, -25, -24, -26, -23], pitches: [95, 110, 130, 155, 105, 145, 120, 170, 100, 140], totalFrames: 10, voicedFrames: 7});
  assert.ok(scoreSpeaking(expressive, transcript).components.vocalVariation > scoreSpeaking(flat, transcript).components.vocalVariation);
});

test('flags rushing using transcript pace and speech density', () => {
  const audio = summarizeAudio({levels: Array(10).fill(-25), pitches: [100, 120, 140, 160, 110, 130, 150, 170], totalFrames: 10, voicedFrames: 10});
  assert.equal(scoreSpeaking(audio, {...transcript, pace: 205}).rushing, true);
});
