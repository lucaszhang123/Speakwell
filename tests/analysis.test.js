import test from 'node:test';
import assert from 'node:assert/strict';
import {analyze} from '../dist/analysis.js';
test('does not reward an empty or very short recording',()=>{assert.equal(analyze('',60).score,null);assert.equal(analyze('one two three',60).score,null);assert.equal(analyze('one '.repeat(20),2).score,null);});
test('counts phrases and consecutive words without matching substrings',()=>{const r=analyze('Um I I like candy but unlike you know some people I prefer fruit',10);assert.equal(r.fillers,3);assert.equal(r.repeats,1);assert.equal(r.pace,84);});
test('score stays bounded and responds to filler density',()=>{const clean='One clear idea can help your audience understand the point you want to make today';const a=analyze(clean,7);const b=analyze('um uh like I I '+clean,9);assert.ok(a.score>b.score);assert.ok(b.score>=0&&b.score<=100);});
test('argument feedback has no numerical score',()=>{assert.equal(analyze('a clear argument with enough words to discuss a particular topic at some length today',10,false).score,null);});
