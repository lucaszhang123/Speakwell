// src/analysis.js
var WORD_PATTERN = /[a-z]+(?:['’-][a-z]+)*/gi;
var TOKEN_PATTERN = /[a-z]+(?:['’-][a-z]+)*|[.!?,;:]/gi;
var BOUNDARY = /* @__PURE__ */ new Set([".", "!", "?", ";", ":"]);
var CLAUSE_BOUNDARY = /* @__PURE__ */ new Set([",", ";", ":", ".", "!", "?"]);
var SUBJECTS = /* @__PURE__ */ new Set(["i", "i'm", "im", "we", "you", "he", "she", "they", "it", "this", "that"]);
var LIKE_VERBS = /* @__PURE__ */ new Set(["like", "likes", "liked", "liking", "love", "loves", "prefer", "prefers"]);
var COMPARISON_VERBS = /* @__PURE__ */ new Set(["feel", "feels", "felt", "seem", "seems", "seemed", "look", "looks", "looked", "sound", "sounds", "sounded", "taste", "tastes", "tasted", "smell", "smells", "smelled", "appear", "appears", "appeared"]);
var COPULAS = /* @__PURE__ */ new Set(["am", "is", "are", "was", "were", "be", "been", "it's", "its"]);
var MODIFIERS = /* @__PURE__ */ new Set(["almost", "exactly", "just", "more", "less", "quite", "rather", "very"]);
var AUXILIARIES = /* @__PURE__ */ new Set(["do", "does", "did", "don't", "dont", "doesn't", "doesnt", "didn't", "didnt", "can", "could", "would", "should", "will", "may", "might"]);
var EMPHATIC_REPEATS = /* @__PURE__ */ new Set(["no", "yes", "very", "really", "so", "never"]);
var TRAILING_CONNECTORS = /* @__PURE__ */ new Set(["a", "an", "and", "as", "at", "because", "but", "for", "from", "if", "in", "of", "on", "or", "so", "than", "that", "the", "then", "to", "when", "which", "with"]);
function tokenize(text) {
  return [...text.matchAll(TOKEN_PATTERN)].map((match) => ({ raw: match[0], value: match[0].toLowerCase().replace("\u2019", "'"), index: match.index }));
}
function nearbyWord(tokens, index, step, distance = 1) {
  let remaining = distance;
  for (let cursor = index + step; cursor >= 0 && cursor < tokens.length; cursor += step) {
    if (/^[a-z]/.test(tokens[cursor].value) && --remaining === 0) return tokens[cursor].value;
    if (BOUNDARY.has(tokens[cursor].value)) break;
  }
  return "";
}
var previousWord = (tokens, index, distance = 1) => nearbyWord(tokens, index, -1, distance);
var nextWord = (tokens, index, distance = 1) => nearbyWord(tokens, index, 1, distance);
var beginsClause = (tokens, index) => index === 0 || CLAUSE_BOUNDARY.has(tokens[index - 1].value);
var phraseAt = (tokens, index, phrase) => phrase.split(" ").every((word, offset) => tokens[index + offset]?.value === word);
function isLexicalLike(tokens, index) {
  const prev = previousWord(tokens, index);
  const prev2 = previousWord(tokens, index, 2);
  const prev3 = previousWord(tokens, index, 3);
  const next = nextWord(tokens, index);
  return COMPARISON_VERBS.has(prev) || prev === "would" || prev === "i'd" || prev === "id" || AUXILIARIES.has(prev) && SUBJECTS.has(prev2) || LIKE_VERBS.has(prev) || LIKE_VERBS.has(next) || MODIFIERS.has(prev) && (COPULAS.has(prev2) || COMPARISON_VERBS.has(prev2)) || MODIFIERS.has(prev) && SUBJECTS.has(prev3) && COPULAS.has(prev2) || ["things", "people", "places", "examples", "something", "anything", "nothing"].includes(prev) || prev === "such" || prev === "nothing" && next === "that";
}
function contextSnippet(text, start, length) {
  const left = Math.max(0, start - 30);
  const right = Math.min(text.length, start + length + 38);
  return `${left ? "\u2026" : ""}${text.slice(left, right).trim()}${right < text.length ? "\u2026" : ""}`;
}
function contextualFillers(text) {
  const tokens = tokenize(text);
  const matches = [];
  const add = (token, phrase, reason, confidence = "high", kind = "contextual") => {
    if (matches.some((item) => item.index === token.index && item.phrase === phrase)) return;
    matches.push({ phrase, index: token.index, reason, confidence, kind, context: contextSnippet(text, token.index, phrase.length) });
  };
  tokens.forEach((token, index) => {
    const value = token.value;
    if (["um", "umm", "uh", "uhh", "erm", "er", "hmm"].includes(value)) {
      add(token, token.raw, "A vocalized hesitation interrupted the idea.", "high", "vocalized");
      return;
    }
    if (value === "like") {
      if (isLexicalLike(tokens, index)) return;
      const next = nextWord(tokens, index);
      const prev = previousWord(tokens, index);
      if (beginsClause(tokens, index) || ["and", "but", "so", "well"].includes(prev) || SUBJECTS.has(next)) add(token, token.raw, "\u201CLike\u201D appears to introduce or interrupt a clause rather than make a comparison.", beginsClause(tokens, index) ? "high" : "medium");
      return;
    }
    if (value === "you" && phraseAt(tokens, index, "you know")) {
      const prev = previousWord(tokens, index);
      const next = nextWord(tokens, index + 1);
      const literalQuestion = AUXILIARIES.has(prev) || ["what", "why", "how", "where", "when", "who", "that", "the", "a", "an", "my", "your", "his", "her", "our", "their", "someone", "something"].includes(next);
      const followedByPause = CLAUSE_BOUNDARY.has(tokens[index + 2]?.value);
      if (!literalQuestion && (beginsClause(tokens, index) || followedByPause || SUBJECTS.has(next))) add(token, `${token.raw} ${tokens[index + 1].raw}`, "The phrase appears parenthetical and can likely be removed.", followedByPause ? "high" : "medium");
      return;
    }
    if (value === "i" && phraseAt(tokens, index, "i mean")) {
      if (!["it", "that", "this", "what", "which", "the"].includes(nextWord(tokens, index + 1))) add(token, `${token.raw} ${tokens[index + 1].raw}`, "The phrase appears to restart or repair the sentence.", "medium");
      return;
    }
    if ((value === "kind" || value === "sort") && tokens[index + 1]?.value === "of" && !["a", "the", "this", "that", "what", "some", "any", "one"].includes(previousWord(tokens, index))) add(token, `${token.raw} ${tokens[index + 1].raw}`, "The phrase appears to soften the point without adding a category.", "medium");
  });
  return matches.sort((a, b) => a.index - b.index);
}
function deliveryDisfluencies(text) {
  const tokens = tokenize(text).filter((token) => /^[a-z]/.test(token.value));
  const repetitions = [];
  for (let index = 1; index < tokens.length; index += 1) {
    const word = tokens[index].value;
    if (word !== tokens[index - 1].value || EMPHATIC_REPEATS.has(word)) continue;
    repetitions.push({
      phrase: `${tokens[index - 1].raw} ${tokens[index].raw}`,
      index: tokens[index - 1].index,
      reason: "An immediate repeated word can sound like a stutter or a restart. Keep it when repetition is deliberate emphasis.",
      confidence: "medium",
      kind: "repetition",
      context: contextSnippet(text, tokens[index - 1].index, tokens[index].index + tokens[index].raw.length - tokens[index - 1].index)
    });
  }
  const last = tokens.at(-1);
  const incomplete = last && TRAILING_CONNECTORS.has(last.value) ? [{
    phrase: last.raw,
    index: last.index,
    reason: "The recognized response appears to end on a connector or unfinished phrase. Finish the thought or pause after a complete point.",
    confidence: "low",
    kind: "incomplete",
    context: contextSnippet(text, last.index, last.raw.length)
  }] : [];
  return { repetitions, incomplete };
}
function analyzeTranscript(text, seconds) {
  const words = text.toLowerCase().match(WORD_PATTERN) || [];
  const fillerDetails = contextualFillers(text);
  const { repetitions, incomplete } = deliveryDisfluencies(text);
  const vocalizedFillers = fillerDetails.filter((item) => item.kind === "vocalized").length;
  return {
    words: words.length,
    pace: seconds > 0 ? Math.round(words.length / seconds * 60) : 0,
    fillers: fillerDetails.length,
    vocalizedFillers,
    contextualFillers: fillerDetails.length - vocalizedFillers,
    fillerDetails,
    repeats: repetitions.length,
    repeated: repetitions.map((item) => item.phrase),
    repetitionDetails: repetitions,
    incompletePhrases: incomplete.length,
    incompleteDetails: incomplete,
    deliveryDetails: [...fillerDetails, ...repetitions, ...incomplete].sort((a, b) => a.index - b.index),
    valid: words.length >= 10 && Number.isFinite(seconds) && seconds >= 5
  };
}
var analyze = analyzeTranscript;
export {
  analyze,
  analyzeTranscript
};
