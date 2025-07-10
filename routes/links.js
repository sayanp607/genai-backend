const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/save', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const user = await User.findById(req.user.id);

    const alreadySaved = user.savedLinks.some(link => link.url === url);
    if (alreadySaved) {
      return res.status(200).json({ success: false, message: 'Link already saved' });
    }

    user.savedLinks.push({ url });
    await user.save();
    res.json({ success: true, savedLinks: user.savedLinks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save link' });
  }
});


router.get('/my-links', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ savedLinks: user.savedLinks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});
router.delete('/delete/:linkId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedLinks = user.savedLinks.filter(link => link._id.toString() !== req.params.linkId);
    await user.save();
    res.json({ success: true, savedLinks: user.savedLinks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

router.put('/edit/:linkId', auth, async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const link = user.savedLinks.id(req.params.linkId);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    link.name = name;
    await user.save();
    res.json({ success: true, updatedLink: link });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update link' });
  }
});


module.exports = router;
