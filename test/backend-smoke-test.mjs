import http from 'http';
import app from '../dist/index.js';

let server;
const PORT = 5099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { status: response.status, data };
}

async function runTests() {
  console.log('--- Starting SwasthyaSathi Backend Smoke Tests ---');

  // Test 1: Health Check
  const healthRes = await request('/api/health');
  console.log(`[Test 1] GET /api/health: Status ${healthRes.status} -> ${healthRes.data.status}`);
  if (healthRes.status !== 200) throw new Error('Health check failed');

  // Test 2: Chat Query - Stomach Pain (Symptom guidance)
  const chatRes = await request('/api/chat/query', {
    method: 'POST',
    body: {
      query: 'Which doctor should I consult for stomach pain?',
      language: 'en',
      synthesizeVoice: true
    }
  });
  console.log(`[Test 2] POST /api/chat/query (Symptom): Status ${chatRes.status}`);
  console.log(`         Specialty: ${chatRes.data.data.recommendation.specialty}`);
  console.log(`         Facility Tier: ${chatRes.data.data.recommendation.facilityTier}`);
  console.log(`         Nearby Hospitals found: ${chatRes.data.data.nearbyHospitals?.length || 0}`);
  console.log(`         Voice Audio synthesized: ${Boolean(chatRes.data.data.voiceAudio?.audioBase64)}`);
  if (!chatRes.data.data.recommendation.specialty.includes('Medicine')) {
    throw new Error('Expected General Medicine specialty');
  }

  // Test 3: Chat Query - Hindi Query
  const hindiRes = await request('/api/chat/query', {
    method: 'POST',
    body: {
      query: 'मुझे कल से पेट में बहुत दर्द है',
      language: 'hi'
    }
  });
  console.log(`[Test 3] POST /api/chat/query (Hindi): Status ${hindiRes.status}`);
  console.log(`         Title: ${hindiRes.data.data.recommendation.title}`);
  if (!hindiRes.data.data.recommendation.title.includes('सामान्य चिकित्सा')) {
    throw new Error('Expected Hindi translation in recommendation');
  }

  // Test 4: Critical Emergency Detection (Red Flag)
  const emergencyRes = await request('/api/chat/query', {
    method: 'POST',
    body: {
      query: 'Sudden severe chest pain and cannot breathe, sweating profusely',
      language: 'en'
    }
  });
  console.log(`[Test 4] POST /api/chat/query (Emergency): Status ${emergencyRes.status}`);
  console.log(`         Triage Level: ${emergencyRes.data.data.safety.triageLevel}`);
  console.log(`         Red Flags: ${emergencyRes.data.data.safety.redFlags.join(', ')}`);
  console.log(`         Action: ${emergencyRes.data.data.recommendation.title}`);
  if (emergencyRes.data.data.safety.triageLevel !== 'CRITICAL_EMERGENCY') {
    throw new Error('Emergency was not correctly triaged as CRITICAL_EMERGENCY');
  }

  // Test 5: Safety Sanitization & PII Masking
  const piiRes = await request('/api/chat/safety-check', {
    method: 'POST',
    body: {
      text: 'My name is Ramesh, my Aadhaar is 5412 8901 2345 and phone is 9876543210. Need doctor.',
      language: 'en'
    }
  });
  console.log(`[Test 5] POST /api/chat/safety-check (PII): Status ${piiRes.status}`);
  console.log(`         Sanitized Text: ${piiRes.data.data.sanitizedText}`);
  console.log(`         Masked PII Types: ${piiRes.data.data.maskedPII.join(', ')}`);
  if (!piiRes.data.data.sanitizedText.includes('[AADHAAR-REDACTED]')) {
    throw new Error('Aadhaar was not redacted');
  }
  if (!piiRes.data.data.sanitizedText.includes('[PHONE-REDACTED]')) {
    throw new Error('Phone was not redacted');
  }

  // Test 6: Voice Speech-to-Text (Gnani STT)
  const sttRes = await request('/api/voice/stt', {
    method: 'POST',
    body: {
      languageCode: 'hi-IN',
      format: 'wav'
    }
  });
  console.log(`[Test 6] POST /api/voice/stt: Status ${sttRes.status}`);
  console.log(`         Transcript: ${sttRes.data.data.transcript}`);
  console.log(`         Confidence: ${sttRes.data.data.confidence}`);

  // Test 7: Voice Text-to-Speech (Gnani TTS)
  const ttsRes = await request('/api/voice/tts', {
    method: 'POST',
    body: {
      text: 'नमस्ते, आपका स्वास्थ्य साथी आपकी सहायता के लिए तैयार है।',
      languageCode: 'hi-IN'
    }
  });
  console.log(`[Test 7] POST /api/voice/tts: Status ${ttsRes.status}`);
  console.log(`         MimeType: ${ttsRes.data.data.mimeType}`);
  console.log(`         Audio base64 length: ${ttsRes.data.data.audioBase64.length}`);

  // Test 8: Hospital Retrieval & Filters
  const hospRes = await request('/api/hospitals?specialty=Cardiology');
  console.log(`[Test 8] GET /api/hospitals?specialty=Cardiology: Status ${hospRes.status}`);
  console.log(`         Hospitals found: ${hospRes.data.count}`);
  console.log(`         First: ${hospRes.data.data[0]?.name}`);

  // Test 9: Nearby Hospital GPS Proximity
  const nearbyRes = await request('/api/hospitals/nearby?lat=18.5284&lng=73.8742&radius=15');
  console.log(`[Test 9] GET /api/hospitals/nearby: Status ${nearbyRes.status}`);
  console.log(`         Nearby Hospitals within 15km: ${nearbyRes.data.count}`);
  if (nearbyRes.data.count > 0) {
    console.log(`         Closest: ${nearbyRes.data.data[0].name} (${nearbyRes.data.data[0].distanceKm} km)`);
  }

  // Test 10: Schemes Listing
  const schemesRes = await request('/api/schemes');
  console.log(`[Test 10] GET /api/schemes: Status ${schemesRes.status}`);
  console.log(`          Total Schemes: ${schemesRes.data.count}`);

  // Test 11: Scheme Eligibility Evaluation (PM-JAY Senior Citizen 70+ and Standard PM-JAY)
  const eligRes = await request('/api/schemes/check-eligibility', {
    method: 'POST',
    body: {
      age: 72,
      annualIncome: 180000,
      rationCardType: 'PriorityHousehold',
      isBPL: true,
      state: 'Maharashtra'
    }
  });
  console.log(`[Test 11] POST /api/schemes/check-eligibility: Status ${eligRes.status}`);
  console.log(`          Eligible Schemes: ${eligRes.data.data.eligibleSchemes.map(s => s.schemeName).join(' | ')}`);
  
  const hasSeniorPmjay = eligRes.data.data.eligibleSchemes.some(s => s.schemeName.includes('Senior Citizen Care'));
  if (!hasSeniorPmjay) {
    throw new Error('72 year old should be eligible for Senior Citizen PM-JAY');
  }

  console.log('\n✅ ALL 11 SMOKE TESTS PASSED SUCCESSFULLY! ✅\n');
}

// Start temporary test server
server = http.createServer(app);
server.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit();
  }
});
