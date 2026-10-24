import { EligibilityInput, EligibilityResult, HealthcareScheme, SchemeEvaluation } from '../types/index.js';

export class SchemeService {
  // Official Government Health Schemes Repository
  private static readonly SCHEMES: HealthcareScheme[] = [
    {
      id: 'scheme-pmjay-universal-senior',
      code: 'PMJAY-SENIOR-70',
      name: 'Ayushman Bharat PM-JAY Senior Citizen Care (Ayushman Vay Vandana)',
      hindiName: 'आयुष्मान भारत वय वंदना योजना (70+ वरिष्ठ नागरिक)',
      marathiName: 'आयुष्मान भारत वय वंदना योजना (७०+ ज्येष्ठ नागरिक)',
      description: 'Universal ₹5 Lakh per year cashless hospitalization coverage for ALL Indian citizens aged 70 and above, regardless of income or socioeconomic status.',
      coverageAmount: '₹5,00,000 / year (Universal for Senior Citizens 70+)',
      category: 'SeniorCitizen',
      eligibilityRules: {
        minAge: 70,
        statesApplicable: ['All-India']
      },
      keyBenefits: [
        'Exclusive ₹5 Lakh top-up cover for every senior citizen aged 70+',
        'Covers pre-existing diseases from Day 1',
        'Over 1,949 treatment procedures included',
        'Cashless access across 29,000+ empanelled public and private hospitals nationwide'
      ],
      requiredDocuments: [
        'Aadhaar Card with verified Date of Birth',
        'Active mobile number linked to Aadhaar'
      ],
      officialPortalUrl: 'https://beneficiary.nha.gov.in',
      tollFreeHelpline: '14555'
    },
    {
      id: 'scheme-pmjay-core',
      code: 'PM-JAY',
      name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      hindiName: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)',
      marathiName: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
      description: 'The world\'s largest government-funded health assurance scheme providing ₹5 Lakh per family per year for secondary and tertiary care hospitalization to over 12 crore vulnerable families.',
      coverageAmount: '₹5,00,000 per family per year',
      category: 'LowIncome',
      eligibilityRules: {
        maxAnnualIncome: 250000,
        requiresBPLorRationCard: true,
        validRationCardTypes: ['Antyodaya', 'BPL', 'PriorityHousehold'],
        statesApplicable: ['All-India']
      },
      keyBenefits: [
        '₹5,00,000 coverage per eligible family per year',
        'Cashless and paperless treatment at all empanelled hospitals',
        'Covers 3 days pre-hospitalization and 15 days post-hospitalization costs',
        'No restriction on family size, age, or gender'
      ],
      requiredDocuments: [
        'Aadhaar Card / Voter ID of all family members',
        'Valid Ration Card (Antyodaya Anna Yojana / PHH / BPL)',
        'Income Certificate / PM-JAY Family ID card'
      ],
      officialPortalUrl: 'https://pmjay.gov.in',
      tollFreeHelpline: '14555 / 1800-111-565'
    },
    {
      id: 'scheme-abha-health-id',
      code: 'ABHA',
      name: 'Ayushman Bharat Health Account (ABHA Digital ID)',
      hindiName: 'आयुष्मान भारत स्वास्थ्य खाता (आभा कार्ड)',
      marathiName: 'आयुष्मान भारत हेल्थ अकाउंट (आभा कार्ड)',
      description: 'A 14-digit universal digital health identifier enabling citizens to seamlessly store, access, and share digital medical records, diagnostic reports, and prescriptions securely across doctors.',
      coverageAmount: 'Free Lifetime Digital Health Account',
      category: 'Universal',
      eligibilityRules: {
        statesApplicable: ['All-India']
      },
      keyBenefits: [
        'Instant paperless OPD registration via QR code scan at public hospitals',
        'Digital storage of laboratory test results, prescriptions, and discharge summaries',
        'Universal interoperability with doctors and hospitals nationwide',
        '100% consent-driven data privacy under ABDM (Ayushman Bharat Digital Mission)'
      ],
      requiredDocuments: [
        'Aadhaar Card or Mobile Number or Driving License'
      ],
      officialPortalUrl: 'https://abha.abdm.gov.in',
      tollFreeHelpline: '1800-11-4477'
    },
    {
      id: 'scheme-pmmvy-maternity',
      code: 'PMMVY',
      name: 'Pradhan Mantri Matru Vandana Yojana (Maternity Support)',
      hindiName: 'प्रधानमंत्री मातृ वंदना योजना',
      marathiName: 'प्रधानमंत्री मातृ वंदना योजना',
      description: 'A direct benefit transfer (DBT) maternity scheme providing financial assistance of ₹5,000 to ₹6,000 for pregnant women and lactating mothers for health and nutritional support.',
      coverageAmount: '₹5,000 to ₹6,000 Cash Support via Direct Benefit Transfer',
      category: 'Maternity',
      eligibilityRules: {
        minAge: 19,
        genderSpecific: 'female',
        statesApplicable: ['All-India']
      },
      keyBenefits: [
        'Financial incentive to compensate wage loss during pregnancy',
        'Promotes institutional delivery and early registration of pregnancy',
        'Encourages complete child immunization'
      ],
      requiredDocuments: [
        'Mother and Child Protection (MCP) card',
        'Aadhaar Card of mother and husband',
        'Bank Account passbook linked with Aadhaar'
      ],
      officialPortalUrl: 'https://pmmvy.wcd.gov.in',
      tollFreeHelpline: '1098 / 102'
    },
    {
      id: 'scheme-mjpjay-maharashtra',
      code: 'MJPJAY',
      name: 'Mahatma Jyotirao Phule Jan Arogya Yojana (Maharashtra)',
      hindiName: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (महाराष्ट्र)',
      marathiName: 'महात्मा ज्योतिराव फुले जन आरोग्य योजना (महाराष्ट्र)',
      description: 'Flagship health insurance scheme by the Government of Maharashtra providing cashless medical and surgical treatment up to ₹5 Lakh per family per year.',
      coverageAmount: '₹5,00,000 per family per year',
      category: 'LowIncome',
      eligibilityRules: {
        statesApplicable: ['Maharashtra', 'All-India'],
        validRationCardTypes: ['Antyodaya', 'BPL', 'PriorityHousehold']
      },
      keyBenefits: [
        'Cashless coverage for 996 medical procedures and surgeries',
        'Covers consultation, diagnostics, hospitalization, surgery, and follow-up',
        'Empanelled network across all districts of Maharashtra'
      ],
      requiredDocuments: [
        'Yellow / Orange Ration Card issued by Govt of Maharashtra',
        'Aadhaar Card / Voter ID of patient'
      ],
      officialPortalUrl: 'https://www.jeevandayee.gov.in',
      tollFreeHelpline: '155388 / 1800-233-2200'
    },
    {
      id: 'scheme-national-dialysis',
      code: 'PMNDP',
      name: 'Pradhan Mantri National Dialysis Programme',
      hindiName: 'प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम',
      marathiName: 'प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम',
      description: 'Provides 100% free hemodialysis and peritoneal dialysis services to all BPL patients suffering from end-stage renal disease across district hospitals.',
      coverageAmount: '100% Free Dialysis for BPL Patients',
      category: 'SpecializedCare',
      eligibilityRules: {
        requiresBPLorRationCard: true,
        statesApplicable: ['All-India']
      },
      keyBenefits: [
        'Completely free dialysis sessions at District Hospitals',
        'Reduces catastrophic out-of-pocket spending for chronic kidney disease',
        'Cashless consumables and medication during treatment'
      ],
      requiredDocuments: [
        'BPL Ration card or Income certificate',
        'Doctor nephrologist referral prescription',
        'Aadhaar Card'
      ],
      officialPortalUrl: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1054&lid=603',
      tollFreeHelpline: '104'
    }
  ];

  /**
   * Return all schemes
   */
  public static getAllSchemes(): HealthcareScheme[] {
    return [...this.SCHEMES];
  }

  /**
   * Find scheme by ID or code
   */
  public static getSchemeById(idOrCode: string): HealthcareScheme | undefined {
    return this.SCHEMES.find(s => s.id === idOrCode || s.code.toLowerCase() === idOrCode.toLowerCase());
  }

  /**
   * Evaluate user eligibility against all public healthcare schemes
   */
  public static evaluateEligibility(input: EligibilityInput): EligibilityResult {
    const eligibleSchemes: SchemeEvaluation[] = [];
    const partiallyEligibleSchemes: SchemeEvaluation[] = [];

    const age = input.age;
    const income = input.annualIncome;
    const rationCard = input.rationCardType || (input.isBPL ? 'BPL' : 'None');
    const isBPL = input.isBPL || ['Antyodaya', 'BPL', 'PriorityHousehold'].includes(rationCard);
    const userState = (input.state || 'All-India').toLowerCase();

    for (const scheme of this.SCHEMES) {
      let matchScore = 100;
      const reasons: string[] = [];
      const unmet: string[] = [];

      // Check Universal Schemes (e.g. ABHA)
      if (scheme.category === 'Universal') {
        reasons.push('Universal benefit available to every Indian citizen without income or age restrictions.');
        eligibleSchemes.push({
          schemeId: scheme.id,
          schemeName: scheme.name,
          status: 'ELIGIBLE',
          matchScore: 100,
          reasons,
          coverageAmount: scheme.coverageAmount,
          benefits: scheme.keyBenefits,
          requiredDocuments: scheme.requiredDocuments,
          applyUrl: scheme.officialPortalUrl,
          helpline: scheme.tollFreeHelpline
        });
        continue;
      }

      // Check Senior Citizen 70+ Scheme (Ayushman Vay Vandana)
      if (scheme.code === 'PMJAY-SENIOR-70') {
        if (age !== undefined && age >= 70) {
          reasons.push(`User is ${age} years old (>= 70), qualifying for universal ₹5 Lakh Senior Citizen PM-JAY coverage regardless of income.`);
          eligibleSchemes.push({
            schemeId: scheme.id,
            schemeName: scheme.name,
            status: 'ELIGIBLE',
            matchScore: 100,
            reasons,
            coverageAmount: scheme.coverageAmount,
            benefits: scheme.keyBenefits,
            requiredDocuments: scheme.requiredDocuments,
            applyUrl: scheme.officialPortalUrl,
            helpline: scheme.tollFreeHelpline
          });
        } else if (age !== undefined && age >= 60) {
          partiallyEligibleSchemes.push({
            schemeId: scheme.id,
            schemeName: scheme.name,
            status: 'LIKELY_ELIGIBLE',
            matchScore: 65,
            reasons: [`Currently age ${age}. Universal Ayushman Vay Vandana activates upon reaching 70 years. Meanwhile, eligible for standard PM-JAY if income/ration card criteria match.`],
            coverageAmount: scheme.coverageAmount,
            benefits: scheme.keyBenefits,
            requiredDocuments: scheme.requiredDocuments,
            applyUrl: scheme.officialPortalUrl,
            helpline: scheme.tollFreeHelpline
          });
        }
        continue;
      }

      // Check Maternity Scheme (PMMVY)
      if (scheme.code === 'PMMVY') {
        if (input.isPregnantOrLactating && (input.gender === 'female' || !input.gender)) {
          reasons.push('Pregnant / lactating mother meeting target demographic for maternal cash transfer.');
          eligibleSchemes.push({
            schemeId: scheme.id,
            schemeName: scheme.name,
            status: 'ELIGIBLE',
            matchScore: 95,
            reasons,
            coverageAmount: scheme.coverageAmount,
            benefits: scheme.keyBenefits,
            requiredDocuments: scheme.requiredDocuments,
            applyUrl: scheme.officialPortalUrl,
            helpline: scheme.tollFreeHelpline
          });
        }
        continue;
      }

      // Check State-specific restrictions
      const statesAllowed = scheme.eligibilityRules.statesApplicable || ['All-India'];
      const stateMatch = statesAllowed.includes('All-India') ||
        statesAllowed.some(s => s.toLowerCase() === userState || userState === 'all-india');

      if (!stateMatch) {
        unmet.push(`Scheme is valid in: ${statesAllowed.join(', ')} (user selected ${input.state || 'other'})`);
        matchScore -= 50;
      }

      // Check BPL / Ration card criteria
      if (scheme.eligibilityRules.requiresBPLorRationCard) {
        if (isBPL) {
          reasons.push(`Holds valid eligible ration card category (${rationCard || 'BPL'}).`);
        } else if (income !== undefined && income <= 250000) {
          reasons.push(`Annual income ₹${income.toLocaleString('en-IN')} falls within vulnerable income bracket; eligible for BPL/PM-JAY enrollment.`);
          matchScore -= 10;
        } else {
          unmet.push('Requires BPL / Priority Household / Antyodaya ration card or SECC 2011 listing.');
          matchScore -= 40;
        }
      }

      // Income ceiling check
      if (scheme.eligibilityRules.maxAnnualIncome && income !== undefined) {
        if (income <= scheme.eligibilityRules.maxAnnualIncome) {
          reasons.push(`Annual income ₹${income.toLocaleString('en-IN')} is within the limit of ₹${scheme.eligibilityRules.maxAnnualIncome.toLocaleString('en-IN')}.`);
        } else {
          unmet.push(`Annual income ₹${income.toLocaleString('en-IN')} exceeds the scheme guideline.`);
          matchScore -= 30;
        }
      }

      // Decide status
      if (matchScore >= 80) {
        eligibleSchemes.push({
          schemeId: scheme.id,
          schemeName: scheme.name,
          status: 'ELIGIBLE',
          matchScore,
          reasons,
          coverageAmount: scheme.coverageAmount,
          benefits: scheme.keyBenefits,
          requiredDocuments: scheme.requiredDocuments,
          applyUrl: scheme.officialPortalUrl,
          helpline: scheme.tollFreeHelpline
        });
      } else if (matchScore >= 50) {
        partiallyEligibleSchemes.push({
          schemeId: scheme.id,
          schemeName: scheme.name,
          status: 'LIKELY_ELIGIBLE',
          matchScore,
          reasons,
          unmetCriteria: unmet,
          coverageAmount: scheme.coverageAmount,
          benefits: scheme.keyBenefits,
          requiredDocuments: scheme.requiredDocuments,
          applyUrl: scheme.officialPortalUrl,
          helpline: scheme.tollFreeHelpline
        });
      }
    }

    // Actionable next steps
    const nextSteps = [
      '1. Create your digital ABHA ID in 60 seconds using your Aadhaar number at abha.abdm.gov.in.',
      '2. Visit your nearest Common Service Centre (CSC) or Ayushman Mitra desk at any District Hospital with your Ration Card.',
      '3. Verify your family name in the PM-JAY beneficiary list on beneficiary.nha.gov.in or by calling toll-free 14555.'
    ];

    return {
      timestamp: new Date().toISOString(),
      userSummary: {
        age: input.age,
        incomeBand: input.annualIncome ? `₹${input.annualIncome.toLocaleString('en-IN')}` : 'Not specified',
        rationCard: input.rationCardType || (input.isBPL ? 'BPL' : 'None'),
        state: input.state || 'All-India'
      },
      eligibleSchemes,
      partiallyEligibleSchemes,
      nextSteps
    };
  }
}
