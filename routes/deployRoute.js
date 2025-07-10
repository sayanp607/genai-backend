const express = require('express');
const axios = require('axios');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
require('dotenv').config();

router.post('/publish', async (req, res) => {
  const { html, css, js } = req.body;

  const tempId = uuidv4();
  const tempDir = path.join(__dirname, `../temp_sites/${tempId}`);
  const zipPath = path.join(__dirname, `../temp_sites/${tempId}.zip`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated Website</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>
`.trim();

    const indexPath = path.join(tempDir, 'index.html');
    fs.writeFileSync(indexPath, fullHtml);

    const nojekyllPath = path.join(tempDir, '.nojekyll');
    fs.writeFileSync(nojekyllPath, '');

    const headersPath = path.join(tempDir, '_headers');
    fs.writeFileSync(headersPath, `
/index.html
  Content-Type: text/html
`.trim());

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.file(indexPath, { name: 'index.html' });
      archive.file(nojekyllPath, { name: '.nojekyll' });
      archive.file(headersPath, { name: '_headers' });
      archive.finalize();
    });

    const siteRes = await axios.post(
      'https://api.netlify.com/api/v1/sites',
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`,
        },
      }
    );

    const siteId = siteRes.data.id;

    const zipBuffer = fs.readFileSync(zipPath);
    const deployRes = await axios.post(
      `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
      zipBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`,
          'Content-Type': 'application/zip',
        },
      }
    );

    const siteUrl = deployRes.data.deploy_ssl_url || deployRes.data.ssl_url;
    res.json({ success: true, url: siteUrl });

    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);
  } catch (err) {
    console.error('Deploy error:', err.response?.data || err.message || err);
    res.status(500).json({ success: false, error: 'Deployment failed' });
  }
});

module.exports = router;
