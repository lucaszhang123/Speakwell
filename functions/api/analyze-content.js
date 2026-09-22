import {evaluateContent, jsonResponse} from '../../server/content-analysis.js';

export async function onRequestPost(context) {
  try {
    const input = await context.request.json();
    const result = await evaluateContent(input, {apiKey: context.env.OPENAI_API_KEY, model: context.env.OPENAI_MODEL || 'gpt-5-mini'});
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({error: error.message, code: error.code || 'analysis_failed'}, error.status || 500);
  }
}
