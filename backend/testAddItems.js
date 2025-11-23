const axios = require('axios');

async function test() {
  try {
    // Login as admin
    const loginRes = await axios.post('http://localhost:5002/api/login', {
      email: 'shivani.admin@gmail.com',
      password: 'Admin@123'
    });
    const token = loginRes.data.token;
    console.log('✅ Admin logged in\n');
    
    // Test IoT device creation
    console.log('📱 Creating IoT Device...');
    const iotData = {
      deviceId: 'HEART-MON-' + Date.now(),
      name: 'Heart Monitor Room 301',
      type: 'heart_monitor',
      status: 'online'
    };
    
    try {
      const iotRes = await axios.post('http://localhost:5002/api/iot/devices', iotData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ IoT Device Created!');
      console.log('   Device ID:', iotRes.data.device.deviceId);
      console.log('   Name:', iotRes.data.device.name);
      console.log('   Status:', iotRes.data.device.status, '\n');
    } catch (err) {
      console.log('❌ IoT Creation Failed');
      console.log('   Status:', err.response?.status);
      console.log('   Message:', err.response?.data?.message || err.message);
      console.log('   URL:', err.config?.url, '\n');
    }
    
    // Test Inventory item creation
    console.log('💊 Creating Inventory Item...');
    const invData = {
      itemCode: 'MED-PARA-' + Date.now(),
      itemName: 'Paracetamol 500mg',
      category: 'medication',
      unit: 'boxes',
      currentStock: 100,
      minimumStock: 20,
      maximumStock: 500,
      unitPrice: 5.50,
      status: 'available',
      supplier: { name: 'MediSupply Co', phone: '555-1234' },
      location: { ward: 'Pharmacy', shelf: 'A1' }
    };
    
    try {
      const invRes = await axios.post('http://localhost:5002/api/inventory', invData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Inventory Item Created!');
      console.log('   Item Code:', invRes.data.item.itemCode);
      console.log('   Item Name:', invRes.data.item.itemName);
      console.log('   Stock:', invRes.data.item.currentStock);
      console.log('   Price: $' + invRes.data.item.unitPrice, '\n');
    } catch (err) {
      console.log('❌ Inventory Creation Failed');
      console.log('   Status:', err.response?.status);
      console.log('   Message:', err.response?.data?.message || err.message);
      console.log('   URL:', err.config?.url, '\n');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
