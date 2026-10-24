// Supported Indic and International languages
export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'bn' | 'gu';

// Triage and Severity Levels
export type TriageLevel = 'CRITICAL_EMERGENCY' | 'URGENT_PHC' | 'ROUTINE_CONSULT' | 'INFORMATIONAL';

// Red flag symptom item
export interface RedFlagCheckResult {
  hasRedFlag: boolean;
  detectedFlags: string[];
  severity: TriageLevel;
  emergencyActionRequired: boolean;
  emergencyMessage?: string;
  recommendedHotline?: string;
}

// Safety sanitization and validation result
export interface SafetyCheckResult {
  isSafe: boolean;
  triageLevel: TriageLevel;
  hasRedFlags: boolean;
  redFlags: string[];
  sanitizedText: string;
  maskedPII: string[];
  disclaimer: string;
  emergencyContact?: {
    service: string;
    number: string;
    instructions: string;
  };
}

// Gnani STT (Speech-to-Text) Request & Response
export interface GnaniSTTOptions {
  languageCode: string; // e.g. 'hi-IN', 'mr-IN', 'en-IN'
  audioFormat?: 'wav' | 'mp3' | 'ogg' | 'webm';
  encoding?: string;
}

export interface GnaniSTTResponse {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  durationMs?: number;
  isMock?: boolean;
}

// Gnani TTS (Text-to-Speech) Request & Response
export interface GnaniTTSOptions {
  text: string;
  languageCode: string; // e.g. 'hi-IN', 'mr-IN', 'en-IN'
  gender?: 'male' | 'female';
  audioFormat?: 'wav' | 'mp3';
  speed?: number;
}

export interface GnaniTTSResponse {
  audioBase64: string;
  mimeType: string;
  durationMs?: number;
  isMock?: boolean;
}

// Hospital Facility Model
export interface HospitalDepartment {
  name: string;
  opdTimings: string;
  isAvailableToday: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'SubDistrictHospital' | 'DistrictHospital' | 'MedicalCollege' | 'EmpanelledHospital';
  state: string;
  district: string;
  city: string;
  address: string;
  pincode: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  emergencyHelpline: string;
  isPmjayEmpanelled: boolean;
  has24x7Emergency: boolean;
  hasBloodBank: boolean;
  hasICU: boolean;
  totalBeds: number;
  availableBeds?: number;
  departments: HospitalDepartment[];
  distanceKm?: number;
}

// Government Healthcare Scheme Model
export interface SchemeRequirement {
  field: string;
  description: string;
}

export interface HealthcareScheme {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  marathiName: string;
  description: string;
  coverageAmount: string;
  category: 'Universal' | 'LowIncome' | 'Maternity' | 'SeniorCitizen' | 'SpecializedCare';
  eligibilityRules: {
    minAge?: number;
    maxAge?: number;
    maxAnnualIncome?: number; // In INR
    requiresBPLorRationCard?: boolean;
    validRationCardTypes?: string[]; // e.g. 'Antyodaya', 'BPL', 'PriorityHousehold'
    statesApplicable?: string[]; // 'All-India' or state names
    genderSpecific?: 'all' | 'female';
    disabilitySupport?: boolean;
  };
  keyBenefits: string[];
  requiredDocuments: string[];
  officialPortalUrl: string;
  tollFreeHelpline: string;
}

// Scheme Eligibility User Input & Result
export interface EligibilityInput {
  age?: number;
  annualIncome?: number;
  rationCardType?: 'Antyodaya' | 'BPL' | 'PriorityHousehold' | 'APL' | 'None';
  isBPL?: boolean;
  state?: string;
  gender?: 'male' | 'female' | 'other';
  isPregnantOrLactating?: boolean;
  hasChronicCondition?: boolean;
  occupation?: string;
}

export interface SchemeEvaluation {
  schemeId: string;
  schemeName: string;
  status: 'ELIGIBLE' | 'LIKELY_ELIGIBLE' | 'NOT_ELIGIBLE';
  matchScore: number; // 0 to 100
  reasons: string[];
  unmetCriteria?: string[];
  coverageAmount: string;
  benefits: string[];
  requiredDocuments: string[];
  applyUrl: string;
  helpline: string;
}

export interface EligibilityResult {
  timestamp: string;
  userSummary: {
    age?: number;
    incomeBand?: string;
    rationCard?: string;
    state?: string;
  };
  eligibleSchemes: SchemeEvaluation[];
  partiallyEligibleSchemes: SchemeEvaluation[];
  nextSteps: string[];
}

// Question Processing Request & Response
export interface QuestionRequest {
  query: string;
  language?: SupportedLanguage;
  userLocation?: {
    latitude?: number;
    longitude?: number;
    pincode?: string;
    district?: string;
  };
  synthesizeVoice?: boolean;
}

export interface QuestionResponse {
  query: string;
  language: SupportedLanguage;
  safety: SafetyCheckResult;
  intent: 'SYMPTOM_GUIDANCE' | 'HOSPITAL_SEARCH' | 'SCHEME_INQUIRY' | 'EMERGENCY_ALERT' | 'GENERAL_HEALTH';
  recommendation: {
    title: string;
    specialty: string;
    facilityTier: 'PHC' | 'CHC' | 'DistrictHospital' | 'Emergency' | 'SelfCare';
    summary: string;
    clinicalReason: string;
    nextSteps: string[];
    redFlagWarnings: string[];
    officialSource: string;
  };
  nearbyHospitals?: Hospital[];
  relevantSchemes?: SchemeEvaluation[];
  voiceAudio?: {
    audioBase64: string;
    mimeType: string;
  };
}
