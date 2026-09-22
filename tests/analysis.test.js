import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeTranscript} from '../dist/analysis.js';

test('requires enough recognized speech for a speaking score', () => {
  assert.equal(analyzeTranscript('', 60).valid, false);
  assert.equal(analyzeTranscript('one two three', 60).valid, false);
  assert.equal(analyzeTranscript('one '.repeat(20), 2).valid, false);
});

test('counts vocalized fillers, contextual fillers, and repetitions separately', () => {
  const result = analyzeTranscript('Um I I like candy but, like, some people prefer fruit every single day', 10);
  assert.equal(result.vocalizedFillers, 1);
  assert.equal(result.contextualFillers, 1);
  assert.equal(result.repeats, 1);
});

test('distinguishes discourse like from a comparison', () => {
  const result = analyzeTranscript("Like I'm not sure right now. But it's almost like I don't know what I'm talking about.", 12);
  assert.equal(result.contextualFillers, 1);
  assert.equal(result.fillerDetails[0].phrase, 'Like');
});

test('does not flag lexical uses of like', () => {
  const result = analyzeTranscript('I like candy and it looks like rain, while things like umbrellas keep us dry outside today.', 10);
  assert.equal(result.fillers, 0);
});

test('distinguishes literal and parenthetical multiword phrases', () => {
  const result = analyzeTranscript('Do you know the answer? You know, I may need another moment. I mean what I say.', 12);
  assert.equal(result.fillers, 1);
  assert.equal(result.fillerDetails[0].phrase, 'You know');
});
