import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Gnani.ai Voice & Conversational AI Configuration
  gnani: {
    apiKey: process.env.GNANI_API_KEY || '',
    token: process.env.GNANI_TOKEN || '',
    accessKey: process.env.GNANI_ACCESS_KEY || '',
    sttUrl: process.env.GNANI_STT_URL || 'https://asr.gnani.ai/v1/recognize',
    ttsUrl: process.env.GNANI_TTS_URL || 'https://tts.gnani.ai/v1/synthesize',
    nlpUrl: process.env.GNANI_NLP_URL || 'https://nlp.gnani.ai/v1/intent',
    useMockFallback: process.env.GNANI_USE_MOCK_FALLBACK !== 'false', // Defaults to true if no live key
  },

  // Emergency & Safety Helpline Configuration
  emergency: {
    nationalEmergencyNumber: '112',
    ambulanceNumber: '108',
    maternalAndChildNumber: '102',
    teleConsultationUrl: 'https://esanjeevani.mohfw.gov.in',
    pmjayPortalUrl: 'https://pmjay.gov.in',
  }
};
