import OpenAI from "openai";
const client = new OpenAI(); // reads OPENAI_API_KEY from env

export async function optimizeEvent({ rawIdea, city, date, themeKeyword }) {
  const completion = await client.chat.completions.create({
    model: "gpt-5.5",
    messages: [{
      role: "user",
      content: `You are optimizing a Luma event listing for discoverability.
Raw idea: "${rawIdea}"
City: ${city}
Date: ${date}
Target search theme/keyword: "${themeKeyword}"

Return ONLY JSON, no markdown fences, no preamble, with exactly these fields:
{
  "title": "keyword-forward, human-sounding, under 65 characters",
  "description": "150-250 words, naturally repeats the theme keyword 2-3 times, states who it's for and what they'll get, ends with a clear CTA",
  "tags": ["3 to 5 relevant tags/categories a real host would pick"]
}`
    }]
  });
  const text = completion.choices[0].message.content;
  return JSON.parse(text.replace(/json|/g, "").trim());
}