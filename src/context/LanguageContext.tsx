import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'English' | 'Tamil' | 'Hindi';

export interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.followups': 'My Follow-ups',
    'nav.tasks': 'Upcoming Tasks',
    'nav.tests': 'Tests & Referrals',
    'nav.instructions': 'Care Instructions',
    'nav.timeline': 'Timeline',
    'nav.reminders': 'Reminders',
    'nav.help': 'Help / Human Review',
    'nav.doctor_view': 'Doctor / Coordinator View',
    'nav.sign_out': 'Sign Out',
    'nav.patient_portal': 'Patient Recovery Portal',

    // Headers & Dashboard
    'dash.title': 'Recovery Journey & Care Plan',
    'dash.subtitle': 'Discharge Instructions Transformed into Verifiable Steps',
    'dash.progress': 'Overall Recovery Progress',
    'dash.milestones': 'Verified Milestones',
    'dash.next_action': 'Next Scheduled Action',
    'dash.pending_tasks': 'Pending Clinical Tasks',
    'dash.notice': 'Care Coordination Notice',
    'dash.monitoring': 'Your Care Team is monitoring your post-discharge timeline in real time.',
    'dash.urgent_review': 'Urgent Review Required',
    'dash.routine_care': 'Routine Follow-up',

    // Section Titles
    'section.followup_appts': 'Follow-up Appointments',
    'section.required_tests': 'Required Tests & Diagnostic Labs',
    'section.medications': 'Medications & Prescriptions',
    'section.care_instructions': 'Daily Care & Activity Instructions',
    'section.warning_signs': 'Warning Signs & Emergency Symptoms',
    'section.contact_support': 'Patient Support & Care Coordination',

    // Action Labels
    'action.schedule': 'Schedule Appointment',
    'action.book': 'Book Appointment',
    'action.view_details': 'View Details',
    'action.mark_done': 'Mark Done',
    'action.verify': 'Verify Completion',
    'action.confirm': 'Confirm Attendance',
    'action.send_message': 'Send Message',
    'action.sending': 'Sending...',
    'action.search': 'Search tasks...',
    'action.all': 'All',
    'action.pending': 'Pending',
    'action.completed': 'Completed',
    'action.overdue': 'Overdue',
    'action.due': 'Due',

    // Help & Contact Form
    'contact.title': 'Contact Care Coordinator',
    'contact.subtitle': 'Direct communication with your dedicated hospital discharge care team.',
    'contact.name': 'Your Full Name',
    'contact.email': 'Your Email Address',
    'contact.subject': 'Subject / Topic',
    'contact.message': 'Message / Clinical Question',
    'contact.send': 'Send Email Notification',
    'contact.success': 'Your message was successfully sent to the care coordination team.',
    'contact.error': 'Failed to send message. Please check connection.',

    // Warning banner
    'warning.emergency_title': 'Emergency Notice',
    'warning.emergency_body': 'If you experience severe chest pain, sudden shortness of breath, or uncontrollable bleeding, immediately call emergency services (108/911) or visit the nearest emergency room.',
  },

  Tamil: {
    // Nav
    'nav.dashboard': 'முகப்பு பலகை',
    'nav.followups': 'பின்தொடர் சந்திப்புகள்',
    'nav.tasks': 'வரவிருக்கும் பணிகள்',
    'nav.tests': 'பரிசோதனைகள் & பரிந்துரைகள்',
    'nav.instructions': 'பராமரிப்பு வழிமுறைகள்',
    'nav.timeline': 'காலவரிசை',
    'nav.reminders': 'நினைவூட்டல்கள்',
    'nav.help': 'உதவி / ஒருங்கிணைப்பாளர்',
    'nav.doctor_view': 'மருத்துவர் பார்வை',
    'nav.sign_out': 'வெளியேறு',
    'nav.patient_portal': 'நோயாளி பராமரிப்பு தளம்',

    // Headers & Dashboard
    'dash.title': 'குணமடைதல் & பராமரிப்பு திட்டம்',
    'dash.subtitle': 'மருத்துவமனை வழிமுறைகள் எளிய சரிபார்க்கக்கூடிய படிகளாக மாற்றப்பட்டுள்ளன',
    'dash.progress': 'ஒட்டுமொத்த குணமடைதல் முன்னேற்றம்',
    'dash.milestones': 'சரிபார்க்கப்பட்ட மைல்கற்கள்',
    'dash.next_action': 'அடுத்த திட்டமிடப்பட்ட செயல்',
    'dash.pending_tasks': 'நிலுவையில் உள்ள பணிகள்',
    'dash.notice': 'பராமரிப்பு ஒருங்கிணைப்பு அறிவிப்பு',
    'dash.monitoring': 'உங்கள் பராமரிப்பு குழு உங்கள் உடல்நிலையை நேரடியாக கண்காணித்து வருகிறது.',
    'dash.urgent_review': 'அவசர மறுஆய்வு தேவை',
    'dash.routine_care': 'வழக்கமான பின்தொடர்தல்',

    // Section Titles
    'section.followup_appts': 'பின்தொடர் மருத்துவ சந்திப்புகள்',
    'section.required_tests': 'தேவையான ஆய்வக பரிசோதனைகள்',
    'section.medications': 'மருந்துகள் & மருந்தளவு',
    'section.care_instructions': 'தினசரி பராமரிப்பு & வழிகாட்டுதல்கள்',
    'section.warning_signs': 'எச்சரிக்கை அறிகுறிகள் & அவசரநிலைகள்',
    'section.contact_support': 'நோயாளி ஆதரவு & பராமரிப்பு உதவி',

    // Action Labels
    'action.schedule': 'நேரம் ஒதுக்கு',
    'action.book': 'முன்பதிவு செய்',
    'action.view_details': 'விவரங்களை காண்க',
    'action.mark_done': 'முடிந்தது என குறி',
    'action.verify': 'சரிபார்',
    'action.confirm': 'வருகையை உறுதி செய்',
    'action.send_message': 'செய்தி அனுப்பு',
    'action.sending': 'அனுப்பப்படுகிறது...',
    'action.search': 'பணிகளை தேடு...',
    'action.all': 'அனைத்தும்',
    'action.pending': 'நிலுவை',
    'action.completed': 'முடிந்தது',
    'action.overdue': 'காலதாமதம்',
    'action.due': 'கடைசி நாள்',

    // Help & Contact Form
    'contact.title': 'பராமரிப்பு ஒருங்கிணைப்பாளரைத் தொடர்பு கொள்ளவும்',
    'contact.subtitle': 'உங்கள் மருத்துவமனை பராமரிப்பு குழுவுடன் நேரடி தொடர்பு.',
    'contact.name': 'உங்கள் முழுப் பெயர்',
    'contact.email': 'மின்னஞ்சல் முகவரி',
    'contact.subject': 'பொருள் / தலைப்பு',
    'contact.message': 'உங்கள் செய்தி அல்லது கேள்வி',
    'contact.send': 'மின்னஞ்சல் அனுப்பு',
    'contact.success': 'உங்கள் செய்தி பராமரிப்பு குழுவிற்கு வெற்றிகரமாக அனுப்பப்பட்டது.',
    'contact.error': 'செய்தி அனுப்புவதில் தோல்வி. மீண்டும் முயற்சிக்கவும்.',

    // Warning banner
    'warning.emergency_title': 'அவசர அறிவிப்பு',
    'warning.emergency_body': 'கடுமையான மார்பு வலி, திடீர் மூச்சுத்திணறல் அல்லது கடுமையான இரத்தப்போக்கு ஏற்பட்டால், உடனடியாக அவசர மருத்துவ சேவையை (108) அழைக்கவும் அல்லது அவசர சிகிச்சை பிரிவிற்கு செல்லவும்.',
  },

  Hindi: {
    // Nav
    'nav.dashboard': 'डैशबोर्ड',
    'nav.followups': 'मेरे फॉलो-अप',
    'nav.tasks': 'आगामी कार्य',
    'nav.tests': 'जांच और रेफरल',
    'nav.instructions': 'देखभाल निर्देश',
    'nav.timeline': 'समयरेखा (टाइमलाइन)',
    'nav.reminders': 'याद दिलाने वाले संदेश',
    'nav.help': 'मदद / समन्वयक',
    'nav.doctor_view': 'डॉक्टर व्यू',
    'nav.sign_out': 'लॉग आउट',
    'nav.patient_portal': 'मरीज रिकवरी पोर्टल',

    // Headers & Dashboard
    'dash.title': 'स्वास्थ्य सुधार एवं देखभाल योजना',
    'dash.subtitle': 'डिस्चार्ज निर्देशों को स्पष्ट चरणों में व्यवस्थित किया गया है',
    'dash.progress': 'स्वास्थ्य सुधार की प्रगति',
    'dash.milestones': 'पूरे किए गए लक्ष्य',
    'dash.next_action': 'अगला निर्धारित कार्य',
    'dash.pending_tasks': 'बाकी बचे कार्य',
    'dash.notice': 'देखभाल समन्वय सूचना',
    'dash.monitoring': 'आपकी केयर टीम आपके स्वास्थ्य पर लगातार नजर रख रही है।',
    'dash.urgent_review': 'तत्काल समीक्षा आवश्यक',
    'dash.routine_care': 'नियमित फॉलो-अप',

    // Section Titles
    'section.followup_appts': 'फॉलो-अप अपॉइंटमेंट',
    'section.required_tests': 'आवश्यक मेडिकल टेस्ट व लैब्स',
    'section.medications': 'दवाइयां और पर्चे',
    'section.care_instructions': 'दैनिक देखभाल व गतिविधि निर्देश',
    'section.warning_signs': 'चेतावनी के लक्षण व आपातकालीन स्थिति',
    'section.contact_support': 'मरीज सहायता एवं देखभाल समन्वय',

    // Action Labels
    'action.schedule': 'अपॉइंटमेंट तय करें',
    'action.book': 'बुक करें',
    'action.view_details': 'विवरण देखें',
    'action.mark_done': 'पूरा हुआ चिन्हित करें',
    'action.verify': 'सत्यापित करें',
    'action.confirm': 'उपस्थिति पक्की करें',
    'action.send_message': 'संदेश भेजें',
    'action.sending': 'भेजा जा रहा है...',
    'action.search': 'खोजें...',
    'action.all': 'सभी',
    'action.pending': 'बाकी',
    'action.completed': 'पूर्ण',
    'action.overdue': 'अतिदेय (विलंबित)',
    'action.due': 'नियत तिथि',

    // Help & Contact Form
    'contact.title': 'केयर कोऑर्डिनेटर से संपर्क करें',
    'contact.subtitle': 'अपनी अस्पताल देखभाल टीम से सीधा संपर्क करें।',
    'contact.name': 'आपका पूरा नाम',
    'contact.email': 'ईमेल पता',
    'contact.subject': 'विषय',
    'contact.message': 'आपका संदेश या प्रश्न',
    'contact.send': 'ईमेल संदेश भेजें',
    'contact.success': 'आपका संदेश केयर टीम को सफलतापूर्वक भेज दिया गया है।',
    'contact.error': 'संदेश भेजने में त्रुटि। कृपया पुनः प्रयास करें।',

    // Warning banner
    'warning.emergency_title': 'आपातकालीन सूचना',
    'warning.emergency_body': 'यदि आपको सीने में तेज दर्द, सांस लेने में अचानक तकलीफ, या भारी रक्तस्राव हो, तो तुरंत आपातकालीन सेवा (108/112) को कॉल करें या निकटतम अस्पताल जाएं।',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('careflow_language');
    if (saved === 'Tamil' || saved === 'Hindi' || saved === 'English') {
      return saved;
    }
    return 'English';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('careflow_language', lang);
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const enDict = translations['English'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'English' as SupportedLanguage,
      setLanguage: () => {},
      t: (_key: string, defaultText?: string) => defaultText || _key
    };
  }
  return context;
}
