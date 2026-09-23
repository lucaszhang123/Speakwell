import test from 'node:test';
import assert from 'node:assert/strict';
import {topics} from '../dist/prompts.js';

test('every category has at least 100 unique, complete prompts', () => {
  assert.deepEqual(Object.keys(topics).sort(), ['argument', 'discovery', 'everyday']);
  for (const rows of Object.values(topics)) {
    assert.ok(rows.length >= 100);
    assert.equal(new Set(rows.map(([title]) => title)).size, rows.length);
    for (const [title, prompt] of rows) {
      assert.equal(typeof title, 'string');
      assert.ok(title.trim().length > 0);
      assert.equal(typeof prompt, 'string');
      assert.ok(prompt.trim().length > 20);
    }
  }
});
test('every discovery prompt includes a research query', () => {
  for (const [, , query] of topics.discovery) assert.ok(typeof query === 'string' && query.trim().length > 0);
});
