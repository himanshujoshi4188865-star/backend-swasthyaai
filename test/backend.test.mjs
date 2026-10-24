import { test, describe } from 'node:test';
import assert from 'node:assert';

import { SafetyService } from '../dist/services/safetyService.js';
import { GnaniService } from '../dist/services/gnaniService.js';
import { HospitalService } from '../dist/services/hospitalService.js';
import { SchemeService } from '../dist/services/schemeService.js';
import { QuestionService } from '../dist/services/questionService.js';

describe('1. Medical Safety & Guardrails Engine', () => {
  test('should detect critical red-flag emergency symptoms in English', () => {
    const result = SafetyService.evaluateQuerySafety('Severe chest pain and sudden shortness of breath', 'en');
    assert.strictEqual(result.isSafe, false);
    assert.strictEqual(result.triageLevel, 'CRITICAL_EMERGENCY');
    assert.strictEqual(result.hasRedFlags, true);
    assert.ok(result.emergencyContact);
    assert.strictEqual(result.emergencyContact.number, '112');
  });

  test('should detect critical red-flag emergency symptoms in Hindi', () => {
    const result = SafetyService.evaluateQuerySafety('सीने में बहुत तेज दर्द है और सांस फूल रही है', 'hi');
    assert.strictEqual(result.isSafe, false);
    assert.strictEqual(result.triageLevel, 'CRITICAL_EMERGENCY');
    assert.strictEqual(result.hasRedFlags, true);
  });

  test('should redact Indian PII (Aadhaar, Phone number, Email)', () => {
    const rawText = 'My Aadhaar is 5412 8901 2345, mobile 9876543210, email test@gov.in';
    const result = SafetyService.sanitizePII(rawText);
    assert.ok(result.sanitizedText.includes('[AADHAAR-REDACTED]'));
    assert.ok(result.sanitizedText.includes('[PHONE-REDACTED]'));
    assert.ok(result.sanitizedText.includes('[EMAIL-REDACTED]'));
    assert.strictEqual(result.maskedPII.length, 3);
  });

  test('should provide standard NHM/MoHFW clinical disclaimers in multiple languages', () => {
    const enDisclaimer = SafetyService.getDisclaimer('en');
    const hiDisclaimer = SafetyService.getDisclaimer('hi');
    const mrDisclaimer = SafetyService.getDisclaimer('mr');
    assert.ok(enDisclaimer.includes('Medical Disclaimer'));
    assert.ok(hiDisclaimer.includes('चिकित्सा अस्वीकरण'));
    assert.ok(mrDisclaimer.includes('वैद्यकीय अस्वीकरण'));
  });
});

describe('2. Gnani.ai Voice & Conversational Integration', () => {
  test('should return Gnani integration status', () => {
    const status = GnaniService.getStatus();
    assert.strictEqual(status.provider, 'Gnani.ai Indic Voice AI');
    assert.ok(status.supportedLanguages.includes('hi-IN'));
    assert.ok(status.supportedLanguages.includes('mr-IN'));
  });

  test('should synthesize vernacular speech audio (TTS) in WAV format', async () => {
    const result = await GnaniService.textToSpeech({
      text: 'नमस्ते, आपका स्वास्थ्य साथी तैयार है',
      languageCode: 'hi-IN'
    });
    assert.ok(result.audioBase64);
    assert.strictEqual(result.mimeType, 'audio/wav');
    assert.ok(result.durationMs > 0);
  });

  test('should perform Speech-to-Text (STT) transcription with high confidence', async () => {
    const fakeBuffer = Buffer.alloc(128);
    const result = await GnaniService.speechToText(fakeBuffer, {
      languageCode: 'hi-IN'
    });
    assert.ok(result.transcript);
    assert.ok(result.confidence > 0.9);
  });
});

describe('3. Public & Empanelled Hospital Retrieval Engine', () => {
  test('should list all available medical departments', () => {
    const departments = HospitalService.getAllDepartments();
    assert.ok(departments.includes('General Medicine'));
    assert.ok(departments.includes('Cardiology'));
  });

  test('should filter hospitals by specialty', () => {
    const cardiologyHospitals = HospitalService.findHospitals({ specialty: 'Cardiology' });
    assert.ok(cardiologyHospitals.length > 0);
    assert.ok(cardiologyHospitals.every(h =>
      h.departments.some(d => d.name.toLowerCase().includes('cardio'))
    ));
  });

  test('should compute GPS distance and sort hospitals by proximity', () => {
    // Pune coordinates: 18.5284, 73.8742 (Near Sassoon Hospital)
    const nearby = HospitalService.findHospitals({
      latitude: 18.5284,
      longitude: 73.8742,
      maxDistanceKm: 15
    });
    assert.ok(nearby.length > 0);
    assert.ok(nearby[0].distanceKm !== undefined);
    assert.ok(nearby[0].distanceKm < 5); // Sassoon should be within 1km
    assert.strictEqual(nearby[0].id, 'hosp-005');
  });

  test('should filter by PM-JAY empanelment status', () => {
    const empanelled = HospitalService.findHospitals({ isPmjayEmpanelled: true });
    assert.ok(empanelled.length > 0);
    assert.ok(empanelled.every(h => h.isPmjayEmpanelled === true));
  });
});

describe('4. Government Scheme Eligibility Engine', () => {
  test('should evaluate senior citizen (age >= 70) for universal Ayushman Vay Vandana coverage', () => {
    const result = SchemeService.evaluateEligibility({
      age: 74,
      annualIncome: 500000, // Even with higher income, 70+ gets universal cover
      rationCardType: 'APL'
    });
    const seniorScheme = result.eligibleSchemes.find(s => s.schemeId.includes('senior'));
    assert.ok(seniorScheme, 'Senior citizen should qualify for Ayushman Vay Vandana');
    assert.ok(seniorScheme.coverageAmount.includes('5,00,000'));
  });

  test('should evaluate low-income BPL user for PM-JAY ₹5 Lakh family cover', () => {
    const result = SchemeService.evaluateEligibility({
      age: 38,
      annualIncome: 120000,
      rationCardType: 'PriorityHousehold',
      isBPL: true,
      state: 'Maharashtra'
    });
    const pmjay = result.eligibleSchemes.find(s => s.schemeName.includes('PM-JAY'));
    assert.ok(pmjay, 'Vulnerable family should be eligible for PM-JAY');
    assert.ok(pmjay.requiredDocuments.some(d => d.includes('Ration Card')));
  });

  test('should offer universal ABHA health account to all citizens', () => {
    const result = SchemeService.evaluateEligibility({});
    const abha = result.eligibleSchemes.find(s => s.schemeName.includes('ABHA'));
    assert.ok(abha, 'Universal ABHA should be offered');
  });
});

describe('5. Conversational Question Processing Pipeline', () => {
  test('should triage stomach pain to General Medicine and PHC tier', async () => {
    const response = await QuestionService.processQuestion({
      query: 'Which doctor should I consult for stomach pain?',
      language: 'en',
      synthesizeVoice: true
    });
    assert.strictEqual(response.safety.isSafe, true);
    assert.strictEqual(response.intent, 'SYMPTOM_GUIDANCE');
    assert.ok(response.recommendation.specialty.includes('General Medicine'));
    assert.strictEqual(response.recommendation.facilityTier, 'PHC');
    assert.ok(response.recommendation.redFlagWarnings.length > 0);
    assert.ok(response.voiceAudio);
    assert.strictEqual(response.voiceAudio.mimeType, 'audio/wav');
  });

  test('should handle Hindi vernacular queries and return Hindi clinical guidance', async () => {
    const response = await QuestionService.processQuestion({
      query: 'मुझे कल से पेट में बहुत दर्द है, क्या करूं?',
      language: 'hi'
    });
    assert.strictEqual(response.language, 'hi');
    assert.ok(response.recommendation.title.includes('सामान्य चिकित्सा'));
    assert.ok(response.recommendation.officialSource.includes('राष्ट्रीय स्वास्थ्य मिशन'));
  });

  test('should immediately short-circuit to 112 emergency response on chest pain & breathlessness', async () => {
    const response = await QuestionService.processQuestion({
      query: 'Extreme sudden chest pain and unable to breathe',
      language: 'en'
    });
    assert.strictEqual(response.safety.triageLevel, 'CRITICAL_EMERGENCY');
    assert.strictEqual(response.intent, 'EMERGENCY_ALERT');
    assert.ok(response.recommendation.title.includes('EMERGENCY'));
    assert.strictEqual(response.recommendation.facilityTier, 'Emergency');
    assert.ok(response.nearbyHospitals?.some(h => h.has24x7Emergency));
  });

  test('should guide user inquiring about Ayushman Bharat schemes', async () => {
    const response = await QuestionService.processQuestion({
      query: 'How can I check my eligibility for Ayushman Bharat scheme?',
      language: 'en'
    });
    assert.strictEqual(response.intent, 'SCHEME_INQUIRY');
    assert.ok(response.relevantSchemes && response.relevantSchemes.length > 0);
  });
});
