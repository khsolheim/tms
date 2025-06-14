const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🔍 Tester login API direkte...\n');
    
    const loginData = {
      epost: 'admin@test.no',
      passord: 'admin123'
    };
    
    console.log('📤 Sender forespørsel til http://localhost:4000/api/auth/logg-inn');
    console.log('📋 Data:', JSON.stringify(loginData, null, 2));
    
    const response = await axios.post('http://localhost:4000/api/auth/logg-inn', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Suksess!');
    console.log('📥 Respons:', response.data);
    
  } catch (error) {
    console.log('❌ Feil!');
    
    if (error.response) {
      console.log('📥 Status:', error.response.status);
      console.log('📥 Data:', error.response.data);
      console.log('📥 Headers:', error.response.headers);
    } else if (error.request) {
      console.log('📥 Ingen respons mottatt');
      console.log('📥 Request:', error.request);
    } else {
      console.log('📥 Feil i oppsett:', error.message);
    }
  }
}

testLoginAPI(); 