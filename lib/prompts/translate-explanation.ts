interface TranslateExplanationParams {
  stepsJsonArray: string[];
  targetLanguage: "te";
}

interface TranslateExplanationPrompt {
  system: string;
  user: string;
  promptVersion: string;
}

export function buildTranslateExplanationPrompt(
  params: TranslateExplanationParams
): TranslateExplanationPrompt {
  const system = `Translate the following Mathematics solution steps from English to Telugu. Preserve all LaTeX math expressions exactly — translate only the prose. Keep numeric values and variable names unchanged.

Output ONLY a JSON object:
{ "translated_steps": ["...", "...", ...] }`;

  const user = JSON.stringify(params.stepsJsonArray);

  return {
    system,
    user,
    promptVersion: process.env.PROMPT_VERSION_TRANS || "trans-v1.0",
  };
}
