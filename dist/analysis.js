export function analyze(text, seconds, allowScore = true) {
  const words = text.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) || [];
  const matches = [...text.matchAll(/\b(?:um+|uh+|erm|hmm|like|you know|i mean|sort of|kind of)\b/gi)].map(m=>m[0].toLowerCase());
  const repeated = words.filter((w,i)=>i>0 && w===words[i-1]);
  const valid = words.length>=10 && Number.isFinite(seconds) && seconds>=5;
  const pace = seconds>0 ? Math.round(words.length / seconds * 60) : 0;
  const fillerRate=matches.length/Math.max(words.length,1), repetitionRate=repeated.length/Math.max(words.length,1);
  const paceScore=Math.max(0,100-Math.max(0,110-pace,pace-170)*1.2);
  const score=valid&&allowScore ? Math.round(paceScore*.4+Math.max(0,100-fillerRate*700)*.4+Math.max(0,100-repetitionRate*1000)*.2) : null;
  const tips=[];
  if (!valid) tips.push('Record at least 5 seconds and capture 10 words for meaningful delivery feedback.');
  else {
    if(pace>170) tips.push('Try a short pause between ideas to give your audience time to follow.');
    else if(pace<110) tips.push('Try connecting your next two ideas in a steady, conversational rhythm.');
    else tips.push('Your overall pace is in a conversational practice range.');
    if(matches.length) tips.push('Listen back to the flagged phrases. Where they are fillers, try replacing one with a quiet pause.');
    if(repeated.length) tips.push('Review the repeated words: some may be emphasis or recognition errors.');
    tips.push('For your next round, lead with a point, give one example, and finish with a takeaway.');
  }
  return {words:words.length,pace,fillers:matches.length,repeats:repeated.length,matches,repeated,score,valid,tips};
}
