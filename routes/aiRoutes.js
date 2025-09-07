// routes/generate.js
const express = require('express');
const router = express.Router();
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const systemPrompt = `
You are a senior full-stack AI web developer and creative designer. Generate a highly attractive, responsive, one-page **portfolio website** using only HTML, CSS, and JavaScript.

🚨 STRICT OUTPUT ORDER:
\`\`\`html
<!-- Full HTML5 code -->
\`\`\`

\`\`\`css
/* Full CSS (no <style> tags) */
\`\`\`

\`\`\`js
// Full JavaScript (no <script> tags)
\`\`\`

🎨 DESIGN REQUIREMENTS:
- Bright, modern colors (NO grayscale).
- Use gradients, glassmorphism, glowing hover effects, and soft shadows.
- Use Google Fonts like 'Poppins', 'Rubik', or 'Inter'.
- Use layout via Flexbox or Grid only.
- All sections must look colorful and well-designed, including:
  - Hero with background image or gradient
  - About section with colorful layout
  - Skills with animated bars or icons
  - Portfolio with visible images in cards
  - Testimonials with styled quotes or sliders
  - Contact form with styled inputs

🖼️ IMAGE RULES (MANDATORY):
- Use **working and visible image URLs** (not broken or empty).
- DO NOT leave \`src\` empty or use generic placeholders that often fail.
- You MAY use any random image from the internet, BUT it must:
  - Be a **direct image link** ending in `.jpg`, `.jpeg`, `.png`, or `.webp`
  - Actually display in the browser
  - Be accessible without authentication
- Ensure at least 3–4 images are used visibly across sections like portfolio or testimonials.

📱 RESPONSIVE:
- Mobile-first design is mandatory.
- Use media queries for better layout on smaller screens.

✨ INTERACTIONS:
- Add some JavaScript interactivity (e.g., fake form submission message, animated skills, etc.)

⚠️ DO NOT:
- Do not include <style> or <script> tags.
- Do not write explanations or markdown text — return only the 3 code blocks.
- Do not skip images or sections.

Now generate a complete, rich, and beautiful portfolio website for this prompt:

"${prompt}"
`;

    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text();

    // 🔁 Replace all <img> tags with working placeholder images
    const imageUrls = [
      'https://source.unsplash.com/400x300/?nature',
      'https://source.unsplash.com/400x300/?technology',
      'https://picsum.photos/400/300',
    ];

    responseText = responseText.replace(/<img[^>]*>/g, () => {
      const src = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      return `<img src="${src}" alt="Portfolio image" style="max-width: 100%; border-radius: 10px;">`;
    });

    res.json({ code: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: "Website generation failed." });
  }
});

module.exports = router;
