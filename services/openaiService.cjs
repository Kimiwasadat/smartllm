const axios = require('axios');
require('dotenv').config();

async function LLMTextEditor(inputtext) {
  const systemPrompt = `
Please review the following text for grammar and spelling errors ONLY. 
Do not rewrite, restructure, or reword the sentences beyond what is necessary to fix grammatical or spelling mistakes.
Keep the sentence structure, vocabulary, and style as close as possible to the original.
If there are no grammar or spelling mistakes, return the text exactly as it is.

Text:
"""
${inputtext}
"""
`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-3.5-turbo", // ✅ correct model
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // ✅ correct env var
        'Content-Type': 'application/json',
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { LLMTextEditor };
