// Development security reset script
const axios = require('axios');

async function resetSecurity() {
  console.log('🔄 Resetting security for development...');
  
  try {
    // Først, la oss prøve å kalle en endpoint uten sikkerhet
    const baseURL = 'http://localhost:4000';
    
    // Test om serveren kjører
    try {
      const healthCheck = await axios.get(`${baseURL}/api/health`, {
        timeout: 5000,
        validateStatus: () => true // Accept all status codes
      });
      console.log(`Server status: ${healthCheck.status}`);
    } catch (error) {
      console.log('❌ Kan ikke koble til server på localhost:4000');
      console.log('Sørg for at serveren kjører med: npm run dev');
      return;
    }

    // Prøv å logge inn med admin-bruker for å få tilgang til security endpoints
    console.log('🔑 Prøver å logge inn som admin...');
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/logg-inn`, {
        epost: 'test@test.no',
        passord: 'test123'
      }, {
        timeout: 10000,
        validateStatus: () => true
      });

      if (loginResponse.status === 200 && loginResponse.data.token) {
        const token = loginResponse.data.token;
        console.log('✅ Logget inn som admin');
        
        // Tøm rate limit cache
        console.log('🧹 Tømmer rate limit cache...');
        try {
          await axios.delete(`${baseURL}/api/security/rate-limit/clear-all`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
            validateStatus: () => true
          });
          console.log('✅ Rate limit cache tømt');
        } catch (error) {
          console.log('⚠️  Kunne ikke tømme rate limit cache');
        }

        // Fjern alle blokkerte IP-er
        console.log('🔓 Fjerner alle blokkerte IP-adresser...');
        try {
          await axios.delete(`${baseURL}/api/security/ip/unblock-all`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
            validateStatus: () => true
          });
          console.log('✅ Alle blokkerte IP-adresser fjernet');
        } catch (error) {
          console.log('⚠️  Kunne ikke fjerne blokkerte IP-adresser');
        }

        console.log('🎉 Sikkerhet tilbakestilt for utvikling!');
        console.log('Du kan nå logge inn på http://localhost:3000');
        
      } else if (loginResponse.status === 429) {
        console.log('❌ Rate limit blokkerer fortsatt login');
        console.log('Vent 15 minutter eller restart serveren');
      } else {
        console.log(`❌ Login feilet: ${loginResponse.status} - ${JSON.stringify(loginResponse.data)}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Kan ikke koble til server');
      } else if (error.response?.status === 429) {
        console.log('❌ Rate limit aktiv - restart serveren');
      } else {
        console.log('❌ Login feil:', error.message);
      }
    }

  } catch (error) {
    console.log('❌ Feil:', error.message);
  }
}

resetSecurity(); 