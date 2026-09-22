const WORD_PATTERN = /[a-z]+(?:['’-][a-z]+)*/gi;
const TOKEN_PATTERN = /[a-z]+(?:['’-][a-z]+)*|[.!?,;:]/gi;
const BOUNDARY = new Set(['.', '!', '?', ';', ':']);
const CLAUSE_BOUNDARY = new Set([',', ';', ':', '.', '!', '?']);
const SUBJECTS = new Set(['i', "i'm", 'im', 'we', 'you', 'he', 'she', 'they', 'it', 'this', 'that']);
const LIKE_VERBS = new Set(['like', 'likes', 'liked', 'liking', 'love', 'loves', 'prefer', 'prefers']);
const COMPARISON_VERBS = new Set(['feel', 'feels', 'felt', 'seem', 'seems', 'seemed', 'look', 'looks', 'looked', 'sound', 'sounds', 'sounded', 'taste', 'tastes', 'tasted', 'smell', 'smells', 'smelled', 'appear', 'appears', 'appeared']);
const COPULAS = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', "it's", 'its']);
const MODIFIERS = new Set(['almost', 'exactly', 'just', 'more', 'less', 'quite', 'rather', 'very']);
const AUXILIARIES = new Set(['do', 'does', 'did', "don't", 'dont', "doesn't", 'doesnt', "didn't", 'didnt', 'can', 'could', 'would', 'should', 'will', 'may', 'might']);

function tokenize(text) {
  return [...text.matchAll(TOKEN_PATTERN)].map((match) => ({raw: match[0], value: match[0].toLowerCase().replace('’', "'"), index: match.index}));
}

function nearbyWord(tokens, index, step, distance = 1) {
  let remaining = distance;
  for (let cursor = index + step; cursor >= 0 && cursor < tokens.length; cursor += step) {
    if (/^[a-z]/.test(tokens[cursor].value) && --remaining === 0) return tokens[cursor].value;
    if (BOUNDARY.has(tokens[cursor].value)) break;
  }
  return '';
}

const previousWord = (tokens, index, distance = 1) => nearbyWord(tokens, index, -1, distance);
const nextWord = (tokens, index, distance = 1) => nearbyWord(tokens, index, 1, distance);
const beginsClause = (tokens, index) => index === 0 || CLAUSE_BOUNDARY.has(tokens[index - 1].value);
const phraseAt = (tokens, index, phrase) => phrase.split(' ').every((word, offset) => tokens[index + offset]?.value === word);

function isLexicalLike(tokens, index) {
  const prev = previousWord(tokens, index);
  const prev2 = previousWord(tokens, index, 2);
  const prev3 = previousWord(tokens, index, 3);
  const next = nextWord(tokens, index);
  return COMPARISON_VERBS.has(prev)
    || prev === 'would' || prev === "i'd" || prev === 'id'
    || (AUXILIARIES.has(prev) && SUBJECTS.has(prev2))
    || LIKE_VERBS.has(prev) || LIKE_VERBS.has(next)
    || (MODIFIERS.has(prev) && (COPULAS.has(prev2) || COMPARISON_VERBS.has(prev2)))
    || (MODIFIERS.has(prev) && SUBJECTS.has(prev3) && COPULAS.has(prev2))
    || ['things', 'people', 'places', 'examples', 'something', 'anything', 'nothing'].includes(prev)
    || prev === 'such' || (prev === 'nothing' && next === 'that');
}

function contextSnippet(text, start, length) {
  const left = Math.max(0, start - 30);
  const right = Math.min(text.length, start + length + 38);
  return `${left ? '…' : ''}${text.slice(left, right).trim()}${right < text.length ? '…' : ''}`;
}

function contextualFillers(text) {
  const tokens = tokenize(text);
  const matches = [];
  const add = (token, phrase, reason, confidence = 'high', kind = 'contextual') => {
    if (matches.some((item) => item.index === token.index && item.phrase === phrase)) return;
    matches.push({phrase, index: token.index, reason, confidence, kind, context: contextSnippet(text, token.index, phrase.length)});
  };
  tokens.forEach((token, index) => {
    const value = token.value;
    if (['um', 'umm', 'uh', 'uhh', 'erm', 'er', 'hmm'].includes(value)) {
      add(token, token.raw, 'A vocalized hesitation interrupted the idea.', 'high', 'vocalized');
      return;
    }
    if (value === 'like') {
      if (isLexicalLike(tokens, index)) return;
      const next = nextWord(tokens, index);
      const prev = previousWord(tokens, index);
      if (beginsClause(tokens, index) || ['and', 'but', 'so', 'well'].includes(prev) || SUBJECTS.has(next)) add(token, token.raw, '“Like” appears to introduce or interrupt a clause rather than make a comparison.', beginsClause(tokens, index) ? 'high' : 'medium');
      return;
    }
    if (value === 'you' && phraseAt(tokens, index, 'you know')) {
      const prev = previousWord(tokens, index);
      const next = nextWord(tokens, index + 1);
      const literalQuestion = AUXILIARIES.has(prev) || ['what', 'why', 'how', 'where', 'when', 'who', 'that', 'the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their', 'someone', 'something'].includes(next);
      const followedByPause = CLAUSE_BOUNDARY.has(tokens[index + 2]?.value);
      if (!literalQuestion && (beginsClause(tokens, index) || followedByPause || SUBJECTS.has(next))) add(token, `${token.raw} ${tokens[index + 1].raw}`, 'The phrase appears parenthetical and can likely be removed.', followedByPause ? 'high' : 'medium');
      return;
    }
    if (value === 'i' && phraseAt(tokens, index, 'i mean')) {
      if (!['it', 'that', 'this', 'what', 'which', 'the'].includes(nextWord(tokens, index + 1))) add(token, `${token.raw} ${tokens[index + 1].raw}`, 'The phrase appears to restart or repair the sentence.', 'medium');
      return;
    }
    if ((value === 'kind' || value === 'sort') && tokens[index + 1]?.value === 'of' && !['a', 'the', 'this', 'that', 'what', 'some', 'any', 'one'].includes(previousWord(tokens, index))) add(token, `${token.raw} ${tokens[index + 1].raw}`, 'The phrase appears to soften the point without adding a category.', 'medium');
  });
  return matches.sort((a, b) => a.index - b.index);
}

export function analyzeTranscript(text, seconds) {
  const words = text.toLowerCase().match(WORD_PATTERN) || [];
  const fillerDetails = contextualFillers(text);
  const repeatedDetails = words.filter((word, index) => index > 0 && word === words[index - 1]);
  const vocalizedFillers = fillerDetails.filter((item) => item.kind === 'vocalized').length;
  return {
    words: words.length,
    pace: seconds > 0 ? Math.round((words.length / seconds) * 60) : 0,
    fillers: fillerDetails.length,
    vocalizedFillers,
    contextualFillers: fillerDetails.length - vocalizedFillers,
    fillerDetails,
    repeats: repeatedDetails.length,
    repeated: repeatedDetails,
    valid: words.length >= 10 && Number.isFinite(seconds) && seconds >= 5,
  };
}

export const analyze = analyzeTranscript;
