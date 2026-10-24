import axios from 'axios';
import { GnaniSTTOptions, GnaniSTTResponse, GnaniTTSOptions, GnaniTTSResponse } from '../types/index.js';
import { config } from '../config/env.js';

export class GnaniService {
  /**
   * Transcribe speech audio to text using Gnani.ai ASR API (with fallback)
   */
  public static async speechToText(
    audioBuffer: Buffer,
    options: GnaniSTTOptions
  ): Promise<GnaniSTTResponse> {
    const hasLiveCredentials = Boolean(config.gnani.apiKey || config.gnani.token);

    // If live credentials are provided and mock fallback is not explicitly forced, try live API
    if (hasLiveCredentials) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/octet-stream',
          'language': options.languageCode || 'hi-IN',
          'format': options.audioFormat || 'wav',
        };

        if (config.gnani.token) {
          headers['Authorization'] = `Bearer ${config.gnani.token}`;
        }
        if (config.gnani.apiKey) {
          headers['x-api-key'] = config.gnani.apiKey;
        }
        if (config.gnani.accessKey) {
          headers['access-key'] = config.gnani.accessKey;
        }

        const response = await axios.post(config.gnani.sttUrl, audioBuffer, {
          headers,
          timeout: 8000,
        });

        if (response.data && (response.data.transcript || response.data.text)) {
          return {
            transcript: response.data.transcript || response.data.text,
            confidence: response.data.confidence || 0.94,
            detectedLanguage: response.data.language || options.languageCode,
            isMock: false
          };
        }
      } catch (error: any) {
        console.warn(`[GnaniService] Live STT call failed: ${error.message}. Falling back to resilient mock.`);
        if (!config.gnani.useMockFallback) {
          throw new Error(`Gnani STT API call failed: ${error.message}`);
        }
      }
    }

    // High-fidelity fallback / demo simulation for vernacular audio inputs
    return this.simulateSpeechToText(options.languageCode);
  }

  /**
   * Synthesize text to speech using Gnani.ai TTS API (with fallback)
   */
  public static async textToSpeech(
    options: GnaniTTSOptions
  ): Promise<GnaniTTSResponse> {
    const hasLiveCredentials = Boolean(config.gnani.apiKey || config.gnani.token);

    if (hasLiveCredentials) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (config.gnani.token) {
          headers['Authorization'] = `Bearer ${config.gnani.token}`;
        }
        if (config.gnani.apiKey) {
          headers['x-api-key'] = config.gnani.apiKey;
        }

        const payload = {
          text: options.text,
          language: options.languageCode || 'hi-IN',
          gender: options.gender || 'female',
          format: options.audioFormat || 'wav',
          speed: options.speed || 1.0,
        };

        const response = await axios.post(config.gnani.ttsUrl, payload, {
          headers,
          responseType: 'arraybuffer',
          timeout: 9000,
        });

        const audioBuffer = Buffer.from(response.data);
        const audioBase64 = audioBuffer.toString('base64');

        return {
          audioBase64,
          mimeType: options.audioFormat === 'mp3' ? 'audio/mp3' : 'audio/wav',
          isMock: false
        };
      } catch (error: any) {
        console.warn(`[GnaniService] Live TTS call failed: ${error.message}. Falling back to resilient mock audio.`);
        if (!config.gnani.useMockFallback) {
          throw new Error(`Gnani TTS API call failed: ${error.message}`);
        }
      }
    }

    // Return clean synthesized WAV audio byte stream simulation
    return this.simulateTextToSpeech(options);
  }

  /**
   * Verify Gnani integration status
   */
  public static getStatus() {
    const hasKey = Boolean(config.gnani.apiKey);
    const hasToken = Boolean(config.gnani.token);

    return {
      provider: 'Gnani.ai Indic Voice AI',
      status: (hasKey || hasToken) ? 'CONFIGURED_LIVE' : 'READY_MOCK_FALLBACK',
      supportedLanguages: ['hi-IN', 'mr-IN', 'en-IN', 'ta-IN', 'te-IN', 'kn-IN', 'bn-IN', 'gu-IN'],
      endpoints: {
        stt: config.gnani.sttUrl,
        tts: config.gnani.ttsUrl,
        nlp: config.gnani.nlpUrl
      },
      mockFallbackEnabled: config.gnani.useMockFallback
    };
  }

  /**
   * Realistic speech recognition simulator for testing vernacular speech queries
   */
  private static simulateSpeechToText(languageCode: string): GnaniSTTResponse {
    const lang = (languageCode || 'en').toLowerCase();

    let sampleTranscript = "Which doctor should I consult for stomach pain?";
    if (lang.includes('hi')) {
      sampleTranscript = "मुझे कल से पेट में बहुत दर्द है, क्या मुझे सरकारी अस्पताल जाना चाहिए?";
    } else if (lang.includes('mr')) {
      sampleTranscript = "माझ्या पोटात कालपासून तीव्र दुखत आहे, जवळचे सरकारी रुग्णालय कुठे आहे?";
    } else if (lang.includes('ta')) {
      sampleTranscript = "எனக்கு வயிற்று வலி உள்ளது, நான் எந்த மருத்துவரை அணுக வேண்டும்?";
    }

    return {
      transcript: sampleTranscript,
      confidence: 0.95,
      detectedLanguage: languageCode || 'en-IN',
      durationMs: 2400,
      isMock: true
    };
  }

  /**
   * Generates a valid RIFF/WAVE PCM audio tone header + bytes so browsers and audio players
   * can seamlessly play the audio output during offline or sandbox testing without errors.
   */
  private static simulateTextToSpeech(options: GnaniTTSOptions): GnaniTTSResponse {
    const sampleRate = 8000;
    const durationSeconds = Math.min(Math.max(options.text.length * 0.05, 1.2), 4.0);
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const byteRate = sampleRate * 1; // 8-bit mono
    const blockAlign = 1;
    const dataSize = numSamples;
    const chunkSize = 36 + dataSize;

    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF Header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(chunkSize, 4);
    buffer.write('WAVE', 8);

    // fmt subchunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
    buffer.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
    buffer.writeUInt16LE(1, 22);  // NumChannels 1 = Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(8, 34);  // BitsPerSample 8

    // data subchunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Generate a soft gentle multi-frequency confirmation tone
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 440 + Math.sin(t * 3.5) * 50;
      const amplitude = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 0.8);
      const sample = Math.floor(128 + amplitude * 60);
      buffer.writeUInt8(Math.max(0, Math.min(255, sample)), 44 + i);
    }

    return {
      audioBase64: buffer.toString('base64'),
      mimeType: 'audio/wav',
      durationMs: Math.round(durationSeconds * 1000),
      isMock: true
    };
  }
}
