// routes/generate.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();



router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'meta-llama/llama-3-70b-instruct',
      messages: [
        {
          role: 'system',
          content: `
You are a professional full-stack AI website builder. You generate modern, fully responsive, and production-quality websites from user prompts.
You must ALWAYS return ONLY 3 raw code blocks in this order:


\`\`\`html
<!-- Full HTML5 website structure -->

\`\`\`

\`\`\`css
/* Complete CSS styles */
\`\`\`

\`\`\`js
// JavaScript logic (can include dummy backend simulation)
\`\`\`

❗IMPORTANT RULES:
- Do NOT include <style> or <script> tags — just raw CSS/JS.
- NO explanations, no comments outside code blocks, no markdown.
- Use Flexbox or CSS Grid for responsive layouts.
- Use Google Fonts like 'Poppins' or 'Inter'.
- Use visible placeholder images from https://source.unsplash.com or https://picsum.photos
- Add spacing, shadows, hover effects, rounded corners.
- Fully responsive (mobile-first).
- Pages must be complete and beautiful.

🔧 FOR GENERAL PROMPTS:
- Include features based on site type (e.g. blog = nav, posts, author section; startup = hero, features, CTA, contact form).

🧠 FOR LEETCODE/DSA CLONE PROMPTS:
- Build a split layout:
   → Left Sidebar = Problem list with titles
   → Right Panel = 
     - Problem title and description (e.g. "Two Sum")
     - A textarea or CodeMirror-styled editor
     - A language dropdown (HTML select)
     - A “Run Code” button
     - A result/output area
- Include one real DSA question with test case examples.
- Add functional JS: On clicking “Run Code”, display a fake result like “All test cases passed” after delay.
- All content must be visually styled, readable, and spaced.

⚠ Respond only with clean, valid code blocks. No text outside. Never return partial layouts.
`
        },
        {
          role: 'user',
          content: `Generate a responsive one-page website for this idea: ${prompt}`,
        },
      ],
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'GenAI Website Builder',
      },
    }
  );

  const aiCode = response.data.choices[0].message.content;
  res.json({ code: aiCode });
} catch (error) {
  console.error('OpenRouter error:', error.response?.data || error.message);
  res.status(500).json({ error: 'Website generation failed.' });
}
});

module.exports = router;
