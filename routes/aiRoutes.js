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
You are a professional website code generator.

You must ALWAYS return 3 code blocks ONLY using triple backticks and nothing else. The format must be:

\`\`\`html
<!-- full HTML content here -->
\`\`\`

\`\`\`css
/* CSS styles only */
\`\`\`

\`\`\`js
// JavaScript logic only
\`\`\`

Important Rules:
- DO NOT mix CSS or JS inside the HTML block.
- DO NOT wrap CSS in <style> or JS in <script>. Only raw CSS and JS.
- DO NOT explain anything. No commentary.
- DO NOT repeat code blocks or combine multiple languages in one.
- Keep output clean, minimal, well-indented.
- Use Flexbox for layout.
- Use Google Fonts (like Poppins or Inter).
- Add hover effects and spacing.
- Use real placeholder images from https://source.unsplash.com or https://picsum.photos.
`

}
,
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
