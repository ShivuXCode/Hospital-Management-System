const express = require('express');
const ContactUs = require('../models/ContactUs');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact message (Patient only, must be logged in)
// @access  Private (Patient)
router.post('/', authMiddleware, authorizeRoles('Patient'), async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const contactMessage = new ContactUs({
      user: req.user.id,
      name,
      email,
      phone,
      message,
      status: 'pending',
    });

    await contactMessage.save();

    console.log(`📧 New contact message from ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: contactMessage,
    });
  } catch (error) {
    console.error('❌ Error submitting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private (Admin)
router.get('/', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const messages = await ContactUs.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('❌ Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact message status (Admin only)
// @access  Private (Admin)
router.put('/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const message = await ContactUs.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (status) message.status = status;
    if (adminNote !== undefined) message.adminNote = adminNote;

    await message.save();

    console.log(`✅ Contact message ${req.params.id} updated to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message,
    });
  } catch (error) {
    console.error('❌ Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message (Admin only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    await message.deleteOne();

    console.log(`🗑️ Contact message ${req.params.id} deleted`);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

module.exports = router;
