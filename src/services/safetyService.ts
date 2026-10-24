import { RedFlagCheckResult, SafetyCheckResult, SupportedLanguage, TriageLevel } from '../types/index.js';
import { config } from '../config/env.js';

export class SafetyService {
  // Red flag emergency terms across English, Hindi, and Marathi
  private static readonly EMERGENCY_KEYWORDS: { [key in 'en' | 'hi' | 'mr']: RegExp[] } = {
    en: [
      /chest\s*(pain|pressure|tightness|heaviness)/i,
      /heart\s*attack/i,
      /shortness\s*of\s*breath|difficulty\s*breathing|cannot\s*breathe|dyspnea/i,
      /stroke|paralysis|facial\s*droop|slurred\s*speech|loss\s*of\s*speech/i,
      /severe\s*(bleeding|hemorrhage)|vomiting\s*blood|coughing\s*blood/i,
      /unconscious|fainted|passed\s*out|unresponsive|seizure|convulsion/i,
      /poison|snake\s*bite|insect\s*sting\s*allergic|anaphylaxis/i,
      /suicid(e|al)|kill\s*myself|end\s*my\s*life/i,
      /head\s*injury|severe\s*trauma|accident/i,
      /high\s*fever\s*(in\s*baby|in\s*infant|in\s*newborn|stiff\s*neck)/i,
    ],
    hi: [
      /सीने.*?दर्द|सीने.*?(जकड़न|दबाव)/i,
      /दिल\s*का\s*दौरा|हार्ट\s*अटैक/i,
      /सांस.*?(फूल|तकलीफ|दिक्कत|रुकावट|घबराहट)|सांस\s*नहीं\s*आ\s*रही/i,
      /लकवा|पक्षाघात|मुंह\s*टेढ़ा|बोलने\s*में\s*असमर्थ/i,
      /खून\s*(की\s*उल्टी|बह\s*रहा|आ\s*रहा)|अत्यधिक\s*रक्तस्राव/i,
      /बेहोश|मूर्छित|दौरा\s*पड़ना|झटके/i,
      /जहर|सांप\s*का\s*काटना|विष/i,
      /आत्महत्या|जान\s*देना/i,
      /सिर\s*पर\s*गंभीर\s*चोट|दुर्घटना/i,
      /नवजात\s*(को\s*तेज\s*बुखार|सांस\s*में\s*आवाज)/i,
    ],
    mr: [
      /छातीत.*?दुखणे|छातीत.*?(कळ|दाब)/i,
      /हृदयविकाराचा\s*झटका|हार्ट\s*अ‍ॅटॅक/i,
      /श्वास.*?(त्रास|गुदमरणे|अडकणे|फुगणे)/i,
      /पक्षाघात|लकवा|तोंड\s*वाकडे/i,
      /रक्ताची\s*उलटी|अति\s*रक्तस्त्राव|रक्त\s*वाहणे/i,
      /बेशुद्ध|चक्कर\s*येऊन\s*पडणे|फेफरे|झटके/i,
      /विषबाधा|सर्पदंश|विंचू\s*चावणे/i,
      /आत्महत्या|जीवाचे\s*बरे\s*वाईट/i,
      /डोक्याला\s*गंभीर\s*मार|अपघात/i,
      /लहान\s*बाळाला\s*खूप\s*ताप/i,
    ]
  };

  // Urgent symptoms requiring same-day primary care visit (PHC/CHC)
  private static readonly URGENT_KEYWORDS: RegExp[] = [
    /persistent\s*vomiting|dehydration|loose\s*motions\s*since|dizziness/i,
    /high\s*fever\s*(for\s*\d+\s*days|above\s*102)/i,
    /severe\s*abdominal\s*pain|acute\s*stomach\s*ache/i,
    /उल्टी|दस्त|तेज\s*बुखार|पेट\s*में\s*तेज\s*दर्द/i,
    /उलट्या|जुलाब|तीव्र\s*पोटदुखी|तीव्र\s*ताप/i
  ];

  // Regex patterns for Indian Personally Identifiable Information (PII)
  private static readonly PII_PATTERNS = [
    // 12-digit Aadhaar number with optional spaces or dashes
    { type: 'Aadhaar Card', regex: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, mask: '[AADHAAR-REDACTED]' },
    // 10-digit Indian Mobile number starting with 6-9
    { type: 'Phone Number', regex: /(?:\+91[-\s]?)?[6-9]\d{9}\b/g, mask: '[PHONE-REDACTED]' },
    // Email addresses
    { type: 'Email Address', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g, mask: '[EMAIL-REDACTED]' },
    // 16-digit Card numbers
    { type: 'Payment Card', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g, mask: '[CARD-REDACTED]' },
  ];

  /**
   * Sanitizes personal information from text to preserve patient privacy
   */
  public static sanitizePII(text: string): { sanitizedText: string; maskedPII: string[] } {
    let sanitizedText = text;
    const maskedPII: string[] = [];

    for (const pattern of this.PII_PATTERNS) {
      if (pattern.regex.test(sanitizedText)) {
        maskedPII.push(pattern.type);
        sanitizedText = sanitizedText.replace(pattern.regex, pattern.mask);
      }
    }

    return { sanitizedText, maskedPII };
  }

  /**
   * Detects critical red flag symptoms across supported languages
   */
  public static checkRedFlags(text: string, language: SupportedLanguage = 'en'): RedFlagCheckResult {
    const detectedFlags: string[] = [];
    const langKey = (['hi', 'mr'].includes(language) ? language : 'en') as 'en' | 'hi' | 'mr';

    // Scan language-specific keywords as well as English fallbacks
    const patternsToScan = [
      ...this.EMERGENCY_KEYWORDS[langKey],
      ...(langKey !== 'en' ? this.EMERGENCY_KEYWORDS.en : [])
    ];

    for (const pattern of patternsToScan) {
      const match = text.match(pattern);
      if (match) {
        detectedFlags.push(match[0]);
      }
    }

    if (detectedFlags.length > 0) {
      const emergencyMessage = language === 'hi'
        ? 'आपातकालीन चेतावनी: पहचाने गए लक्षण गंभीर हो सकते हैं। कृपया तुरंत 112 या 108 डायल करें अथवा नजदीकी अस्पताल जाएं।'
        : language === 'mr'
        ? 'तातडीचा इशारा: आढळलेली लक्षणे गंभीर असू शकतात. कृपया त्वरित 112 किंवा 108 वर संपर्क साधा किंवा जवळच्या रुग्णालयात जा.'
        : 'EMERGENCY ALERT: Detected symptoms indicate a potentially life-threatening situation. Please call 112 or 108 immediately or visit the nearest emergency facility.';

      return {
        hasRedFlag: true,
        detectedFlags: Array.from(new Set(detectedFlags)),
        severity: 'CRITICAL_EMERGENCY',
        emergencyActionRequired: true,
        emergencyMessage,
        recommendedHotline: config.emergency.nationalEmergencyNumber
      };
    }

    // Check for urgent conditions (PHC/CHC referral needed today)
    for (const pattern of this.URGENT_KEYWORDS) {
      if (pattern.test(text)) {
        return {
          hasRedFlag: false,
          detectedFlags: [],
          severity: 'URGENT_PHC',
          emergencyActionRequired: false
        };
      }
    }

    return {
      hasRedFlag: false,
      detectedFlags: [],
      severity: 'ROUTINE_CONSULT',
      emergencyActionRequired: false
    };
  }

  /**
   * Generates localized non-diagnostic standard clinical disclaimers
   */
  public static getDisclaimer(language: SupportedLanguage = 'en'): string {
    switch (language) {
      case 'hi':
        return 'चिकित्सा अस्वीकरण: यह सेवा केवल प्राथमिक स्वास्थ्य मार्गदर्शन के लिए है और यह किसी प्रमाणित डॉक्टर का विकल्प नहीं है। AI कोई निश्चित निदान या दवा का नुस्खा नहीं देता। आपातकाल में तुरंत 112 डायल करें। (स्रोत: राष्ट्रीय स्वास्थ्य मिशन एवं MoHFW प्रोटोकॉल)';
      case 'mr':
        return 'वैद्यकीय अस्वीकरण: ही सेवा केवळ प्राथमिक आरोग्य मार्गदर्शनासाठी असून प्रमाणित डॉक्टरांच्या सल्ल्याचा पर्याय नाही. AI कोणताही वैद्यकीय उपचार सुचवत नाही. आणीबाणीच्या वेळी त्वरित 112 वर संपर्क साधा. (स्रोत: राष्ट्रीय आरोग्य अभियान)';
      case 'en':
      default:
        return 'Medical Disclaimer: This AI companion provides general healthcare guidance and navigation only. It does NOT provide definitive diagnosis or medical prescriptions. Consult a licensed physician at a registered PHC/CHC/Hospital. In emergency, call 112 immediately. (Source: MoHFW & National Health Mission Clinical Protocols)';
    }
  }

  /**
   * Complete safety inspection of user question
   */
  public static evaluateQuerySafety(rawText: string, language: SupportedLanguage = 'en'): SafetyCheckResult {
    // 1. Sanitize PII
    const { sanitizedText, maskedPII } = this.sanitizePII(rawText);

    // 2. Scan for critical red-flag triggers
    const redFlagResult = this.checkRedFlags(sanitizedText, language);

    // 3. Assemble disclaimer
    const disclaimer = this.getDisclaimer(language);

    return {
      isSafe: !redFlagResult.emergencyActionRequired,
      triageLevel: redFlagResult.severity,
      hasRedFlags: redFlagResult.hasRedFlag,
      redFlags: redFlagResult.detectedFlags,
      sanitizedText,
      maskedPII,
      disclaimer,
      emergencyContact: redFlagResult.emergencyActionRequired ? {
        service: 'National Emergency Service (Ambulance / Police)',
        number: config.emergency.nationalEmergencyNumber,
        instructions: redFlagResult.emergencyMessage || 'Do not delay seeking immediate medical attention.'
      } : undefined
    };
  }
}
