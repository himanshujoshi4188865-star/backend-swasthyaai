import { Hospital, QuestionRequest, QuestionResponse, SupportedLanguage } from '../types/index.js';
import { SafetyService } from './safetyService.js';
import { HospitalService } from './hospitalService.js';
import { SchemeService } from './schemeService.js';
import { GnaniService } from './gnaniService.js';
import { config } from '../config/env.js';

interface SymptomKnowledge {
  keywords: { [key in 'en' | 'hi' | 'mr']: RegExp[] };
  specialty: string;
  facilityTier: 'PHC' | 'CHC' | 'DistrictHospital' | 'Emergency' | 'SelfCare';
  translations: {
    [key in 'en' | 'hi' | 'mr']: {
      title: string;
      summary: string;
      clinicalReason: string;
      nextSteps: string[];
      redFlagWarnings: string[];
    };
  };
}

export class QuestionService {
  // Clinical Knowledge Mapping for Common Complaints
  private static readonly SYMPTOM_RULES: SymptomKnowledge[] = [
    {
      keywords: {
        en: [/stomach.*?pain|abdominal.*?pain|gastric|acidity|belly.*?ache|cramps/i],
        hi: [/पेट.*?दर्द|गैस|एसिडिटी|मरोड़|दस्त/i],
        mr: [/पोट.*?दुख|पोटदुखी|गॅस|अ‍ॅसिडिटी|हगवण/i]
      },
      specialty: 'General Medicine / Internal Medicine',
      facilityTier: 'PHC',
      translations: {
        en: {
          title: 'A General Medicine clinician is the recommended first step',
          summary: 'Abdominal pain has varied causes ranging from gastritis and dietary indigestion to infection. A General Physician at your nearest Primary Health Centre (PHC) can physically examine you and prescribe basic remedies.',
          clinicalReason: 'Non-emergency abdominal discomfort is best addressed at the primary care level first before specialist referral.',
          nextSteps: [
            'Visit your nearest PHC or Community Health Centre (CHC) during morning OPD hours (9 AM - 1 PM).',
            'Stay hydrated with clean water or ORS; avoid spicy, heavy, or fried food.',
            'Keep your previous medical prescriptions handy.'
          ],
          redFlagWarnings: [
            'Severe sudden sharp pain',
            'Continuous vomiting or inability to keep liquids down',
            'Blood in vomit or black/tarry stool',
            'High fever accompanied by abdominal rigidity'
          ]
        },
        hi: {
          title: 'सामान्य चिकित्सा (General Medicine) डॉक्टर से परामर्श उपयुक्त पहला कदम है',
          summary: 'पेट दर्द के कई कारण हो सकते हैं जैसे गैस, बदहजमी, संक्रमण अथवा अन्य समस्याएं। प्राथमिक स्वास्थ्य केंद्र (PHC) या सामुदायिक स्वास्थ्य केंद्र (CHC) में डॉक्टर आपका शारीरिक परीक्षण कर सही मार्गदर्शन देंगे।',
          clinicalReason: 'शुरुआती लक्षणों में प्राथमिक स्वास्थ्य केंद्र में डॉक्टर से मिलना सबसे सुलभ और सुरक्षित होता है।',
          nextSteps: [
            'सुबह 9 बजे से 1 बजे के बीच नजदीकी PHC या CHC जाएं।',
            'हल्का खाना खाएं और ओआरएस या गुनगुना पानी पिएं।',
            'यदि पहले से कोई दवा ले रहे हैं तो पर्ची साथ रखें।'
          ],
          redFlagWarnings: [
            'अचानक असहनीय तीव्र दर्द होना',
            'लगातार उल्टी होना या पानी न पच पाना',
            'उल्टी या मल में खून आना',
            'पेट कड़ा होना और साथ में तेज बुखार'
          ]
        },
        mr: {
          title: 'जनरल मेडिसिन (General Medicine) डॉक्टरांचा सल्ला घेणे योग्य ठरेल',
          summary: 'पोटदुखीची गॅस, अपचन किंवा संसर्ग यासारखी विविध कारणे असू शकतात. जवळच्या प्राथमिक आरोग्य केंद्रातील (PHC) डॉक्टर तपासणी करून योग्य औषधोपचार देऊ शकतात.',
          clinicalReason: 'सामान्य पोटदुखीसाठी प्रथम प्राथमिक आरोग्य केंद्रात (PHC) तपासणी करून घेणे सोयीचे ठरते.',
          nextSteps: [
            'सकाळी ९ ते दुपारी १ या वेळेत जवळच्या प्राथमिक आरोग्य केंद्राला भेट द्या.',
            'हलका आहार घ्या आणि ओआरएस किंवा भरपूर पाणी प्या.',
            'पूर्वी घेत असलेली औषधांची कागदपत्रे सोबत ठेवा.'
          ],
          redFlagWarnings: [
            'अचानक अतिशय तीव्र वेदना होणे',
            'सतत उलट्या होणे किंवा पाणीही न टिकणे',
            'उलटीतून किंवा शौचातून रक्त पडणे',
            'पोट ताठ होणे आणि सोबत तीव्र ताप'
          ]
        }
      }
    },
    {
      keywords: {
        en: [/fever|high\s*temperature|chills|body\s*ache|viral/i],
        hi: [/बुखार|ताप|ठंड\s*लगना|बदन\s*दर्द/i],
        mr: [/ताप|अंगदुखी|थंडी\s*वाजणे|कणकण/i]
      },
      specialty: 'General Medicine / Pediatrics',
      facilityTier: 'PHC',
      translations: {
        en: {
          title: 'Consult a General Medicine clinician at your local PHC',
          summary: 'Fever is an immune response commonly caused by viral or bacterial infections. A local health officer can check vitals, check for malaria/dengue if needed, and advise proper antipyretic care.',
          clinicalReason: 'Basic diagnostics and fever management are fully provided at free government PHCs.',
          nextSteps: [
            'Rest adequately and drink plenty of fluids (coconut water, soups, boiled water).',
            'Do not take over-the-counter antibiotics without a doctor\'s prescription.',
            'Visit the PHC for a simple complete blood count (CBC) or rapid malaria test if fever exceeds 48 hours.'
          ],
          redFlagWarnings: [
            'Fever exceeding 103°F (39.4°C) not coming down',
            'Severe stiff neck with headache or confusion',
            'Rash appearing rapidly on skin',
            'Difficulty breathing or rapid breathing'
          ]
        },
        hi: {
          title: 'नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से परामर्श करें',
          summary: 'बुखार शरीर की रोग प्रतिरोधक प्रतिक्रिया है। नजदीकी सरकारी अस्पताल में डॉक्टर मलेरिया, डेंगू या मौसमी वायरल की निःशुल्क जांच और दवा उपलब्ध कराते हैं।',
          clinicalReason: 'सरकारी प्राथमिक स्वास्थ्य केंद्रों में आवश्यक रक्त जांच और बुखार की दवाएं निःशुल्क उपलब्ध हैं।',
          nextSteps: [
            'पर्याप्त आराम करें और खूब पानी व तरल पदार्थ लें।',
            'बिना डॉक्टर की सलाह के एंटीबायोटिक दवाएं न लें।',
            'यदि बुखार 2 दिन से अधिक रहे तो तुरंत नजदीकी PHC जाएं।'
          ],
          redFlagWarnings: [
            '103°F से अधिक तेज बुखार',
            'गर्दन में अकड़न या बेहोशी के लक्षण',
            'त्वचा पर लाल चकत्ते पड़ना',
            'सांस लेने में भारीपन'
          ]
        },
        mr: {
          title: 'स्थानिक प्राथमिक आरोग्य केंद्रात (PHC) डॉक्टरांना भेटा',
          summary: 'ताप हे संसर्गाचे लक्षण असू शकते. सरकारी प्राथमिक आरोग्य केंद्रात हिवताप (मलेरिया), डेंग्यू यांसारख्या मोफत चाचण्या व औषधे उपलब्ध असतात.',
          clinicalReason: 'प्राथमिक आरोग्य केंद्रात ताप व रक्त तपासणीची मोफत सुविधा उपलब्ध असते.',
          nextSteps: [
            'पुरेशी विश्रांती घ्या आणि भरपूर पाणी व द्रव पदार्थ प्या.',
            'डॉक्टरांच्या सल्ल्याशिवाय स्वतःहून अँटीबायोटिक्स घेऊ नका.',
            'ताप २ दिवसांपेक्षा जास्त राहिल्यास तातडीने तपासणी करून घ्या.'
          ],
          redFlagWarnings: [
            '१०३°F पेक्षा जास्त तीव्र ताप',
            'मान ताठ होणे किंवा गोंधळलेली अवस्था',
            'अंगावर अचानक लाल पुरळ उठणे',
            'श्वास घेण्यास त्रास होणे'
          ]
        }
      }
    },
    {
      keywords: {
        en: [/knee\s*pain|joint\s*pain|bone|fracture|back\s*pain|arthritis/i],
        hi: [/घुटने\s*का\s*दर्द|जोड़ों\s*में\s*दर्द|हड्डी|कमर\s*दर्द|गठिया/i],
        mr: [/गुडघेदुखी|सांधेदुखी|हाडे|कंबरदुखी|संधिवात/i]
      },
      specialty: 'Orthopedics',
      facilityTier: 'CHC',
      translations: {
        en: {
          title: 'Consult an Orthopedic Specialist at a Community Health Centre (CHC) or District Hospital',
          summary: 'Joint and bone pain require clinical assessment, range-of-motion testing, and possibly an X-ray to differentiate osteoarthritis from ligament strain or inflammatory issues.',
          clinicalReason: 'Community Health Centres and District Hospitals have dedicated orthopedic outpatient departments and digital X-ray facilities.',
          nextSteps: [
            'Visit the Orthopedic OPD at your nearest Sub-district or District Hospital.',
            'Avoid high-impact strain on the affected joint.',
            'Inquire about free physiotherapy services available at the District Rehabilitation Centre.'
          ],
          redFlagWarnings: [
            'Inability to bear any weight following an accident or fall',
            'Visible bone deformity or intense swelling',
            'Loss of sensation or numbness in limbs'
          ]
        },
        hi: {
          title: 'सामुदायिक स्वास्थ्य केंद्र (CHC) या जिला अस्पताल में हड्डी रोग विशेषज्ञ (Orthopedic) से मिलें',
          summary: 'जोड़ों या घुटनों के दर्द के लिए एक्स-रे एवं विशेषज्ञ जांच आवश्यक हो सकती है ताकि गठिया, नस दबने या खिंचाव का सही पता लग सके।',
          clinicalReason: 'सामुदायिक स्वास्थ्य केंद्रों और जिला अस्पतालों में एक्स-रे व हड्डी रोग ओपीडी की सुविधा होती है।',
          nextSteps: [
            'जिला अस्पताल में हड्डी रोग विभाग (Orthopedics OPD) में जाएं।',
            'दर्द वाले हिस्से पर अनावश्यक जोर न दें।',
            'आयुष्मान भारत कार्ड धारकों के लिए आवश्यक सर्जरी निःशुल्क उपलब्ध है।'
          ],
          redFlagWarnings: [
            'गिरने या चोट के बाद पैर पर बिल्कुल वजन न दे पाना',
            'हड्डी का टेढ़ा दिखना या अत्यधिक सूजन',
            'हाथ-पैर सुन्न पड़ जाना'
          ]
        },
        mr: {
          title: 'ग्रामीण रुग्णालय (CHC) किंवा जिल्हा रुग्णालयातील अस्थिरोग तज्ञांचा (Orthopedic) सल्ला घ्या',
          summary: 'सांधेदुखी किंवा हाडांच्या त्रासासाठी डिजिटल एक्स-रे आणि तज्ज्ञ डॉक्टरांचा सल्ला आवश्यक असतो.',
          clinicalReason: 'जिल्हा रुग्णालयात मोफत एक्स-रे व अस्थिरोग तपासणीची सोय असते.',
          nextSteps: [
            'जिल्हा रुग्णालयातील अस्थिरोग बाह्यरुग्ण विभागाला (OPD) भेट द्या.',
            'त्रास असलेल्या अवयवावर जास्त ताण देऊ नका.',
            'महात्मा फुले जन आरोग्य योजना व आयुष्मान कार्डद्वारे मोफत उपचार शक्य आहेत.'
          ],
          redFlagWarnings: [
            'अपघातानंतर पाय जमिनीवर टेकवता न येणे',
            'हाड वाकडे दिसणे किंवा अतिशय सूज येणे',
            'हात किंवा पाय बधीर होणे'
          ]
        }
      }
    }
  ];

  /**
   * Main question processing pipeline
   */
  public static async processQuestion(request: QuestionRequest): Promise<QuestionResponse> {
    const rawQuery = request.query || '';
    const lang: SupportedLanguage = request.language || 'en';
    const langKey = (['hi', 'mr'].includes(lang) ? lang : 'en') as 'en' | 'hi' | 'mr';

    // 1. Safety Guardrail Evaluation
    const safety = SafetyService.evaluateQuerySafety(rawQuery, lang);

    // 2. Critical Emergency Check Short-Circuit
    if (safety.hasRedFlags || safety.triageLevel === 'CRITICAL_EMERGENCY') {
      const emergencyResponse = this.generateEmergencyResponse(rawQuery, lang, safety, request.userLocation);
      if (request.synthesizeVoice) {
        const tts = await GnaniService.textToSpeech({
          text: emergencyResponse.recommendation.summary,
          languageCode: `${lang}-IN`,
          gender: 'female'
        });
        emergencyResponse.voiceAudio = {
          audioBase64: tts.audioBase64,
          mimeType: tts.mimeType
        };
      }
      return emergencyResponse;
    }

    // 3. Scheme Inquiry Detection
    const isSchemeQuery = /scheme|ayushman|pm-?jay|card|insurance|bpl|eligib|योजना|कार्ड|विमा|पात्रता/i.test(rawQuery);
    if (isSchemeQuery) {
      const schemeResponse = this.generateSchemeInquiryResponse(rawQuery, lang, safety);
      if (request.synthesizeVoice) {
        const tts = await GnaniService.textToSpeech({
          text: schemeResponse.recommendation.summary,
          languageCode: `${lang}-IN`,
          gender: 'female'
        });
        schemeResponse.voiceAudio = {
          audioBase64: tts.audioBase64,
          mimeType: tts.mimeType
        };
      }
      return schemeResponse;
    }

    // 4. Hospital Search Detection
    const isHospitalLocatorQuery = /find.*?(hospital|clinic|phc|chc)|nearest.*?(hospital|clinic|phc|chc)|hospital.*?near|अस्पताल.*?कहाँ|रुग्णालय.*?कुठे/i.test(rawQuery);

    // 5. Symptom Matching Engine
    let matchedSymptom: SymptomKnowledge | undefined;
    for (const rule of this.SYMPTOM_RULES) {
      const patterns = [...rule.keywords[langKey], ...rule.keywords.en];
      if (patterns.some(p => p.test(safety.sanitizedText))) {
        matchedSymptom = rule;
        break;
      }
    }

    const calculatedIntent: 'SYMPTOM_GUIDANCE' | 'HOSPITAL_SEARCH' = 
      matchedSymptom ? 'SYMPTOM_GUIDANCE' : (isHospitalLocatorQuery ? 'HOSPITAL_SEARCH' : 'SYMPTOM_GUIDANCE');

    // 6. Find Nearby Public Healthcare Facilities
    const nearbyHospitals = HospitalService.findHospitals({
      district: request.userLocation?.district,
      pincode: request.userLocation?.pincode,
      latitude: request.userLocation?.latitude,
      longitude: request.userLocation?.longitude,
      specialty: matchedSymptom ? matchedSymptom.specialty.split('/')[0].trim() : undefined
    }).slice(0, 3);

    // 7. Assemble Structured Recommendation
    let title: string;
    let summary: string;
    let clinicalReason: string;
    let nextSteps: string[];
    let redFlagWarnings: string[];
    let facilityTier: 'PHC' | 'CHC' | 'DistrictHospital' | 'Emergency' | 'SelfCare' = 'PHC';

    if (matchedSymptom) {
      const localized = matchedSymptom.translations[langKey];
      title = localized.title;
      summary = localized.summary;
      clinicalReason = localized.clinicalReason;
      nextSteps = localized.nextSteps;
      redFlagWarnings = localized.redFlagWarnings;
      facilityTier = matchedSymptom.facilityTier;
    } else {
      // General Health Consultation Default
      if (lang === 'hi') {
        title = 'सामान्य स्वास्थ्य मार्गदर्शन एवं नजदीकी स्वास्थ्य केंद्र परामर्श';
        summary = `आपके सवाल "${safety.sanitizedText}" के आधार पर, यह AI सहायक अंतिम चिकित्सीय निदान नहीं देता। प्राथमिक स्वास्थ्य केंद्र (PHC) या सामुदायिक स्वास्थ्य केंद्र (CHC) में डॉक्टर से मिलकर सुरक्षित सलाह लें।`;
        clinicalReason = 'सटीक नैदानिक निदान केवल एक योग्य चिकित्सक द्वारा शारीरिक जांच के बाद ही संभव है।';
        nextSteps = [
          'नजदीकी सरकारी स्वास्थ्य केंद्र (PHC) के सामान्य ओपीडी में जाएं।',
          'अपने सभी पुराने पर्चे और जांच रिपोर्ट साथ रखें।',
          'यदि लक्षण अचानक बिगड़ें तो तत्काल आपातकालीन 112 डायल करें।'
        ];
        redFlagWarnings = [
          'सांस लेने में भारी तकलीफ या सीने में दबाव',
          'अचानक तेज सिरदर्द या शरीर का कोई अंग सुन्न होना',
          'लगातार अत्यधिक उल्टी या तेज बुखार'
        ];
      } else if (lang === 'mr') {
        title = 'सामान्य आरोग्य मार्गदर्शन आणि जवळचे आरोग्य केंद्र सल्ला';
        summary = `तुमच्या प्रश्नानुसार ("${safety.sanitizedText}"), हा AI सहाय्यक कोणताही थेट वैद्यकीय उपचार सुचवत नाही. जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) जाऊन डॉक्टरांचा सल्ला घ्या.`;
        clinicalReason = 'योग्य तपासणी व शारीरिक चाचणीनंतरच डॉक्टर अचूक औषधोपचार देऊ शकतात.';
        nextSteps = [
          'जवळच्या प्राथमिक आरोग्य केंद्रातील (PHC) ओपीडीला भेट द्या.',
          'पूर्वीची जुनी औषधे व तपासणी अहवाल सोबत ठेवा.',
          'त्रास अचानक वाढल्यास लगेच १०८ किंवा ११२ वर कॉल करा.'
        ];
        redFlagWarnings = [
          'श्वास घेण्यास त्रास किंवा छातीत दाब जाणवणे',
          'अचानक तीव्र डोकेदुखी किंवा हात-पाय बधीर होणे',
          'सतत उलट्या किंवा खूप जास्त ताप'
        ];
      } else {
        title = 'A General Medicine clinician at your local PHC is a recommended first step';
        summary = `Based on your question regarding "${safety.sanitizedText}", please note this AI assistant provides public guidance and not a definitive medical diagnosis. A qualified clinician at a Primary Health Centre (PHC) or Community Health Centre (CHC) can examine you and provide care.`;
        clinicalReason = 'Accurate clinical diagnosis requires an in-person physical examination by a registered healthcare professional.';
        nextSteps = [
          'Visit the Outpatient Department (OPD) at your local PHC or District Hospital.',
          'Carry any prior medical reports or prescriptions with you.',
          'If symptoms worsen acutely, call 112 for emergency ambulance support.'
        ];
        redFlagWarnings = [
          'Sudden chest pain, tightness, or pressure',
          'Severe breathing distress or shortness of breath',
          'Fainting, slurred speech, or persistent vomiting'
        ];
      }
    }

    const officialSource = lang === 'hi'
      ? 'स्रोत: राष्ट्रीय स्वास्थ्य मिशन (NHM) एवं स्वास्थ्य और परिवार कल्याण मंत्रालय (MoHFW) मानक उपचार दिशानिर्देश'
      : lang === 'mr'
      ? 'स्रोत: राष्ट्रीय आरोग्य अभियान आणि आरोग्य मंत्रालय (MoHFW) मानक उपचार नियमावली'
      : 'Source: National Health Mission (NHM) & Ministry of Health & Family Welfare (MoHFW) Standard Clinical Protocols';

    // 8. Synthesize Voice via Gnani TTS if requested
    let voiceAudio: { audioBase64: string; mimeType: string } | undefined;
    if (request.synthesizeVoice) {
      const voiceText = `${title}. ${summary}`;
      const ttsResult = await GnaniService.textToSpeech({
        text: voiceText,
        languageCode: `${lang}-IN`,
        gender: 'female'
      });
      voiceAudio = {
        audioBase64: ttsResult.audioBase64,
        mimeType: ttsResult.mimeType
      };
    }

    return {
      query: safety.sanitizedText,
      language: lang,
      safety,
      intent: calculatedIntent,
      recommendation: {
        title,
        specialty: matchedSymptom ? matchedSymptom.specialty : 'General Medicine',
        facilityTier,
        summary,
        clinicalReason,
        nextSteps,
        redFlagWarnings,
        officialSource
      },
      nearbyHospitals: nearbyHospitals.length > 0 ? nearbyHospitals : undefined,
      voiceAudio
    };
  }

  /**
   * Generates prioritized response when red-flag emergency symptoms are detected
   */
  private static generateEmergencyResponse(
    query: string,
    lang: SupportedLanguage,
    safety: any,
    userLocation?: any
  ): QuestionResponse {
    const isHi = lang === 'hi';
    const isMr = lang === 'mr';

    const emergencyHospitals = HospitalService.findHospitals({
      has24x7Emergency: true,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude
    }).slice(0, 2);

    const title = isHi
      ? '🚨 आपातकालीन चेतावनी: कृपया तुरंत 112 या 108 डायल करें!'
      : isMr
      ? '🚨 तातडीची आणीबाणी: कृपया त्वरित 112 किंवा 108 वर कॉल करा!'
      : '🚨 CRITICAL EMERGENCY: Call 112 or 108 Immediately!';

    const summary = isHi
      ? 'पहचाने गए लक्षण (जैसे सीने में दर्द, सांस लेने में गंभीर तकलीफ, या अत्यधिक रक्तस्राव) जानलेवा हो सकते हैं। AI जवाब का इंतजार न करें। तुरंत एंबुलेंस बुलाएं या नजदीकी इमरजेंसी ट्रॉमा सेंटर जाएं।'
      : isMr
      ? 'आढळलेली लक्षणे अत्यंत गंभीर असू शकतात. AI उत्तराची वाट पाहू नका. त्वरित १०८ वर रुग्णवाहिका बोलवा किंवा जवळच्या अपघात कक्षात (Trauma Centre) जा.'
      : 'The symptoms described indicate a potentially life-threatening medical emergency. Do NOT wait for automated AI responses. Dial 112 or 108 immediately for emergency ambulance dispatch or go to the nearest emergency trauma department.';

    return {
      query: safety.sanitizedText,
      language: lang,
      safety,
      intent: 'EMERGENCY_ALERT',
      recommendation: {
        title,
        specialty: 'Emergency & Trauma Medicine',
        facilityTier: 'Emergency',
        summary,
        clinicalReason: 'Emergency symptoms require immediate physical resuscitation and licensed emergency stabilization.',
        nextSteps: [
          `Call ${config.emergency.nationalEmergencyNumber} (National Emergency) or ${config.emergency.ambulanceNumber} (Free Ambulance) immediately.`,
          'Keep the patient sitting or lying in a well-ventilated, comfortable position.',
          'Do not offer solid foods or oral fluids if the patient is drowsy or breathless.'
        ],
        redFlagWarnings: safety.redFlags,
        officialSource: 'MoHFW Emergency Triage Protocol'
      },
      nearbyHospitals: emergencyHospitals
    };
  }

  /**
   * Generates response for queries concerning schemes & PM-JAY
   */
  private static generateSchemeInquiryResponse(
    query: string,
    lang: SupportedLanguage,
    safety: any
  ): QuestionResponse {
    const isHi = lang === 'hi';
    const isMr = lang === 'mr';

    const evaluation = SchemeService.evaluateEligibility({
      rationCardType: 'PriorityHousehold',
      isBPL: true
    });

    const title = isHi
      ? 'सरकारी स्वास्थ्य योजनाएं एवं आयुष्मान कार्ड (PM-JAY) जानकारी'
      : isMr
      ? 'सरकारी आरोग्य योजना आणि आयुष्मान कार्ड माहिती'
      : 'Government Healthcare Schemes & Ayushman Bharat (PM-JAY) Guidance';

    const summary = isHi
      ? 'आयुष्मान भारत (PM-JAY) के अंतर्गत पात्र परिवारों को प्रति वर्ष ₹5 लाख तक का निःशुल्क कैशलेस अस्पताल उपचार मिलता है। इसके अतिरिक्त 70 वर्ष से अधिक उम्र के सभी वरिष्ठ नागरिकों को अलग से ₹5 लाख का कवर उपलब्ध है।'
      : isMr
      ? 'आयुष्मान भारत (PM-JAY) योजनेअंतर्गत पात्र कुटुंबांना दरवर्षी ५ लाख रुपयांपर्यंत मोफत कॅशलेस उपचार मिळतात. तसेच ७० वर्षांवरील सर्व ज्येष्ठ नागरिकांसाठी स्वतंत्र ५ लाखांचे विमा कवच उपलब्ध आहे.'
      : 'Under Ayushman Bharat (PM-JAY), eligible families receive up to ₹5 Lakh per year for cashless hospitalization across 29,000+ empanelled hospitals. In addition, all senior citizens aged 70+ now receive a universal ₹5 Lakh top-up cover.';

    return {
      query: safety.sanitizedText,
      language: lang,
      safety,
      intent: 'SCHEME_INQUIRY',
      recommendation: {
        title,
        specialty: 'Public Health Administration & Schemes',
        facilityTier: 'SelfCare',
        summary,
        clinicalReason: 'Financial protection ensures no family faces catastrophic health expenditures.',
        nextSteps: [
          'Visit beneficiary.nha.gov.in or your local CSC / Ayushman Mitra desk to check your family name.',
          'Bring your Aadhaar Card and Ration Card to generate your free Ayushman Card.',
          'Create your universal ABHA Digital Health Account at abha.abdm.gov.in.'
        ],
        redFlagWarnings: [],
        officialSource: 'National Health Authority (NHA) & Ayushman Bharat Guidelines'
      },
      relevantSchemes: evaluation.eligibleSchemes
    };
  }
}
