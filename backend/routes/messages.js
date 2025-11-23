const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Nurse = require('../models/Nurse');
const Appointment = require('../models/Appointment');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Shared handler for sending messages (Doctor, Nurse, Admin only)
const sendMessageHandler = async (req, res) => {
  try {
    const senderId = req.user.id;
    const senderRole = req.user.role;

    // Accept either receiverId or recipientId from body to be backward compatible
    const receiverId = req.body.receiverId || req.body.recipientId;
    const text = (req.body.message || '').toString();
    const subject = (req.body.subject || 'Chat Message').toString();
    const priority = req.body.priority || 'normal';
    const relatedAppointment = req.body.relatedAppointment || null;

    if (!receiverId || !text.trim()) {
      return res.status(400).json({ success: false, message: 'receiverId and message are required' });
    }

    // Validate sender context by role
    if (!['Doctor', 'Nurse', 'Admin'].includes(senderRole)) {
      return res.status(403).json({ success: false, message: 'Only Doctor, Nurse, or Admin can send messages' });
    }

    if (senderRole === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: senderId }).populate('assignedNurses');
      if (!doctor) return res.status(403).json({ success: false, message: 'Doctor profile not found' });
    } else if (senderRole === 'Nurse') {
      const nurse = await Nurse.findOne({ userId: senderId }).populate('assignedDoctors');
      if (!nurse) return res.status(403).json({ success: false, message: 'Nurse profile not found' });
    }

    // Validate receiver
    const receiverUser = await User.findById(receiverId).select('role');
    if (!receiverUser) return res.status(404).json({ success: false, message: 'Receiver not found' });
    if (!['Doctor', 'Nurse', 'Admin'].includes(receiverUser.role)) {
      return res.status(403).json({ success: false, message: 'Receiver role not allowed' });
    }

    // Relationship checks
    if (senderRole === 'Doctor') {
      if (receiverUser.role === 'Nurse') {
        const nurse = await Nurse.findOne({ userId: receiverId });
        const doctor = await Doctor.findOne({ userId: senderId }).populate('assignedNurses');
        if (!nurse || !doctor) return res.status(403).json({ success: false, message: 'Assignment validation failed' });
        const isAssigned = (doctor.assignedNurses || []).some(n => n._id.toString() === nurse._id.toString());
        if (!isAssigned) return res.status(403).json({ success: false, message: 'You can only message your assigned nurses' });
      } else if (receiverUser.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Doctors can message assigned Nurses or Admins only' });
      }
    } else if (senderRole === 'Nurse') {
      if (receiverUser.role === 'Doctor') {
        const doctor = await Doctor.findOne({ userId: receiverId });
        const nurse = await Nurse.findOne({ userId: senderId }).populate('assignedDoctors');
        if (!doctor || !nurse) return res.status(403).json({ success: false, message: 'Assignment validation failed' });
        const isAssigned = (nurse.assignedDoctors || []).some(d => d._id.toString() === doctor._id.toString());
        if (!isAssigned) return res.status(403).json({ success: false, message: 'You can only message your assigned doctors' });
      } else {
        return res.status(403).json({ success: false, message: 'Nurses can message assigned Doctors only' });
      }
    }

    const newMessage = new Message({
      sender: senderId,
      senderRole: senderRole,
      recipient: receiverId,
      recipientRole: receiverUser.role,
      subject,
      message: text,
      priority,
      relatedAppointment
    });

    await newMessage.save();

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        _id: newMessage._id,
        senderId,
        senderRole,
        receiverId,
        receiverRole: receiverUser.role,
        text,
        subject,
        priority,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    return res.status(500).json({ success: false, message: 'Server error while sending message' });
  }
};

// @route   POST /api/messages/send
// @desc    Send a message (Doctor, Nurse, Admin only)
// @access  Private (Doctor, Nurse, Admin)
router.post('/send', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), sendMessageHandler);

// Backward-compatible route: POST /api/messages
router.post('/', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), sendMessageHandler);

// @route   GET /api/messages
// @desc    Get inbox messages for authenticated user
// @access  Private (Doctor, Nurse, Patient, Admin)
router.get('/', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate('sender', 'name role email')
      .populate('relatedAppointment', 'doctorName patientName date time')
      .sort({ createdAt: -1 });

    const unreadCount = messages.filter(m => !m.isRead).length;

    res.status(200).json({
      success: true,
      messages,
      unreadCount
    });
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/messages/sent
// @desc    Get sent messages
// @access  Private (Doctor, Nurse, Patient, Admin)
router.get('/sent', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate('recipient', 'name role email')
      .populate('relatedAppointment', 'doctorName patientName date time')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('❌ Get sent messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private (Doctor, Nurse, Patient, Admin)
router.put('/:id/read', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get full conversation between authenticated user and specified user
// @access  Private (Doctor, Nurse, Patient, Admin)
router.get('/conversation/:userId', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    // Verify other user exists
    const other = await User.findById(otherUserId).select('name role');
    if (!other) return res.status(404).json({ success:false, message:'User not found' });

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user.id }
      ]
    })
      .populate('sender', 'name role email')
      .populate('recipient', 'name role email')
      .populate('relatedAppointment', 'doctorName patientName date time')
      .sort({ createdAt: 1 }); // chronological

    res.status(200).json({ success:true, other, messages });
  } catch (error) {
    console.error('❌ Get conversation error:', error);
    res.status(500).json({ success:false, message:'Server error. Please try again.' });
  }
});

// @route   GET /api/messages/participants
// @desc    List possible messaging participants for a doctor or nurse
// @access  Private (Doctor, Nurse)
router.get('/participants', authMiddleware, authorizeRoles('Doctor', 'Nurse'), async (req, res) => {
  try {
    // Handle Nurse role
    if (req.user.role === 'Nurse') {
      const nurse = await Nurse.findOne({ userId: req.user.id }).populate('assignedDoctors');
      if (!nurse) return res.status(404).json({ success:false, message:'Nurse profile not found' });
      
      const participants = { doctors: [] };
      
      // Get assigned doctors' user IDs
      const assignedDoctorUserIds = [];
      if (nurse.assignedDoctors && nurse.assignedDoctors.length > 0) {
        nurse.assignedDoctors.forEach(doctor => {
          if (doctor.userId) {
            assignedDoctorUserIds.push(doctor.userId.toString());
          }
        });
      }
      
      // Get assigned doctors from User collection
      if (assignedDoctorUserIds.length > 0) {
        const assignedDoctorUsers = await User.find({ 
          _id: { $in: assignedDoctorUserIds },
          role: 'Doctor' 
        }).select('name role email').lean();
        participants.doctors = assignedDoctorUsers;
      }
      
      return res.status(200).json({ success:true, participants });
    }
    
    // Handle Doctor role
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ success:false, message:'Doctor profile not found' });

    const participants = { nurses: [], admins: [] };
    
    // Get ONLY assigned nurses' user IDs
    const assignedNurseUserIds = [];
    if (doctor.assignedNurses && doctor.assignedNurses.length > 0) {
      const Nurse = require('../models/Nurse');
      const assignedNurses = await Nurse.find({ _id: { $in: doctor.assignedNurses } });
      assignedNurses.forEach(nurse => {
        if (nurse.userId) {
          assignedNurseUserIds.push(nurse.userId.toString());
        }
      });
    }
    
    // Get ONLY assigned nurses from User collection
    if (assignedNurseUserIds.length > 0) {
      const assignedNurseUsers = await User.find({ 
        _id: { $in: assignedNurseUserIds },
        role: 'Nurse' 
      }).select('name role email').lean();
      participants.nurses = assignedNurseUsers;
    }

    // All admins
    const admins = await User.find({ role: 'Admin' }).select('name role email').lean();
    participants.admins = admins;

    res.status(200).json({ success:true, participants });
  } catch (error) {
    console.error('❌ Get participants error:', error);
    res.status(500).json({ success:false, message:'Server error. Please try again.' });
  }
});

// @route   GET /api/messages/:id
// @desc    Get single message
// @access  Private (Doctor, Nurse, Patient, Admin)
router.get('/:id', authMiddleware, authorizeRoles('Doctor', 'Nurse', 'Admin'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name role email')
      .populate('recipient', 'name role email')
      .populate('relatedAppointment', 'doctorName patientName date time reason');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user.id && message.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('❌ Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

module.exports = router;
