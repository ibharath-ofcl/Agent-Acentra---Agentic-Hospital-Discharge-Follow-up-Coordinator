import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, AlertCircle, RefreshCw, Mail, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface EmailJSContactFormProps {
  initialName?: string;
  initialEmail?: string;
  initialClinicName?: string;
  initialSubject?: string;
  toEmail?: string;
  className?: string;
  onSuccess?: () => void;
}

export const EMAILJS_CONFIG = {
  publicKey: 'Ioj9Q5HLktFP5mI3X',
  serviceId: 'service_nhiqrmi',
  templateId: 'template_k7sqdk9',
};

export function EmailJSContactForm({
  initialName = '',
  initialEmail = '',
  initialClinicName = 'CareFlow Memorial Hospital',
  initialSubject = '',
  toEmail = 'your-destination@email.com',
  className = '',
  onSuccess,
}: EmailJSContactFormProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    subject: initialSubject,
    clinic_name: initialClinicName,
    message: '',
    to_email: toEmail,
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialName) {
      setFormData(prev => ({ ...prev, name: initialName }));
    }
    if (initialEmail) {
      setFormData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialName, initialEmail]);

  // Initialize EmailJS with provided Public Key
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).emailjs) {
      try {
        (window as any).emailjs.init({
          publicKey: EMAILJS_CONFIG.publicKey,
        });
      } catch (err) {
        console.warn('EmailJS initialization warning:', err);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setSuccessMessage(null);
    setErrorMessage(null);

    const form = formRef.current || (event.currentTarget as HTMLFormElement);
    const currentTime = new Date().toLocaleString();

    // Extract elements safely
    const nameVal = (form.elements.namedItem('name') as HTMLInputElement)?.value || formData.name;
    const emailVal = (form.elements.namedItem('email') as HTMLInputElement)?.value || formData.email;
    const subjectVal = (form.elements.namedItem('subject') as HTMLInputElement)?.value || formData.subject;
    const clinicNameVal = (form.elements.namedItem('clinic_name') as HTMLInputElement)?.value || formData.clinic_name;
    const messageVal = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value || formData.message;
    const toEmailVal = emailVal || (form.elements.namedItem('to_email') as HTMLInputElement)?.value || formData.to_email;

    const templateParams = {
      name: nameVal,
      from_name: nameVal,
      user_name: nameVal,
      patient_name: nameVal,

      email: emailVal,
      from_email: emailVal,
      user_email: emailVal,
      patient_email: emailVal,
      to_email: toEmailVal,
      recipient_email: toEmailVal,
      reply_to: emailVal,

      subject: subjectVal,
      clinic_name: clinicNameVal,
      hospital_name: clinicNameVal,
      message: messageVal,
      time: currentTime,
      date: new Date().toLocaleDateString(),
    };

    const emailjsLib = typeof window !== 'undefined' ? (window as any).emailjs : null;

    if (!emailjsLib || typeof emailjsLib.send !== 'function') {
      const errMsg = 'EmailJS SDK is not loaded. Please ensure the EmailJS script is included.';
      console.error('EmailJS error:', errMsg);
      setStatus('error');
      setErrorMessage(errMsg);
      alert('FAILED: ' + JSON.stringify({ message: errMsg }));
      return;
    }

    emailjsLib
      .send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
      .then(() => {
        setStatus('success');
        setSuccessMessage('SUCCESS! Message sent successfully via EmailJS.');
        alert('SUCCESS!');
        form.reset();
        setFormData({
          name: initialName,
          email: initialEmail,
          subject: '',
          clinic_name: initialClinicName,
          message: '',
          to_email: toEmail,
        });
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch((error: any) => {
        console.error('EmailJS error:', error);
        setStatus('error');
        const errDetail = error?.text || error?.message || JSON.stringify(error);
        setErrorMessage(`FAILED: ${errDetail}`);
        alert('FAILED: ' + JSON.stringify(error));
      });
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 shadow-xs ${className}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Mail className="w-5 h-5 text-teal-800" />
        <div>
          <h3 className="text-base font-bold text-slate-900">{t('contact.title', 'Contact Care Coordinator & Clinic')}</h3>
          <p className="text-xs text-slate-500">{t('contact.subtitle', 'Send an inquiry, clarification, or notification directly via EmailJS')}</p>
        </div>
      </div>

      {status === 'success' && successMessage && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block font-bold mb-0.5">SUCCESS!</strong>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block font-bold mb-0.5">Delivery Notice</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form id="contact-form" ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Destination email: hidden input */}
        <input
          type="hidden"
          name="to_email"
          value={formData.to_email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
              {t('contact.name', 'Your Full Name')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Arun Kumar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden font-medium text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
              {t('contact.email', 'Your Email Address')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. arun.kumar@gmail.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="clinic_name" className="block text-xs font-bold text-slate-700 mb-1">
              Clinic / Hospital Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="clinic_name"
              name="clinic_name"
              required
              value={formData.clinic_name}
              onChange={handleChange}
              placeholder="e.g. CareFlow Memorial Hospital"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden font-medium text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-xs font-bold text-slate-700 mb-1">
              {t('contact.subject', 'Subject')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Question regarding Cardiology Follow-up Lab Test"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden font-medium text-slate-900"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-bold text-slate-700 mb-1">
            {t('contact.message', 'Message')} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe your inquiry, requested appointment change, or medication clarification..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-teal-700 focus:outline-hidden font-medium text-slate-900 resize-y"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Sends via EmailJS Template <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">template_k7sqdk9</code></span>
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {status === 'sending' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t('action.sending', 'Sending...')}</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('contact.send', 'Send Message')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
