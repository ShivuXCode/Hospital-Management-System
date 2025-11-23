const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

mongoose.connect('mongodb://localhost:27017/mediflow').then(async () => {
  const videoAppointments = await Appointment.find({ 
    consultationType: 'video',
    $or: [
      { meetingLink: null },
      { meetingLink: undefined },
      { meetingLink: '' }
    ]
  });
  
  console.log(`\n📹 Found ${videoAppointments.length} video appointments without meeting links\n`);
  
  for (const apt of videoAppointments) {
    const meetingId = `${apt.doctorName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${apt.date}-${apt.time.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
    const meetingLink = `https://meet.google.com/${meetingId.substring(0, 10)}-${meetingId.substring(10, 14)}-${meetingId.substring(14, 17)}`;
    
    apt.meetingLink = meetingLink;
    await apt.save();
    
    console.log(`✅ Updated ${apt.patientName} with ${apt.doctorName}`);
    console.log(`   Meeting Link: ${meetingLink}`);
  }
  
  console.log(`\n✅ All video consultation appointments now have meeting links!\n`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
