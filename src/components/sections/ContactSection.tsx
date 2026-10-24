import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PlatformIcon } from '../common/PlatformIcon';
import {
  Mail,
  Copy,
  Check,
  Send,
  CheckCircle2,
  Phone,
  PhoneCall,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { data, isStudioRoute, isStudioPreviewMode, selectedElement, setSelectedElement } = usePortfolio();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: data.contact.formServices[0] || 'Full-Stack Web Development',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const phoneNumber = data.personal.phonePlaceholder || '03347365583';
  const whatsappNumber = '03347365583';
  const whatsappLink = data.contact.whatsappUrl || 'https://wa.me/923347365583';

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;
  const isSelected = selectedElement?.type === 'contact';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(data.personal.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'whatsapp' | 'email';
    title: string;
    message: string;
    actionUrl?: string;
  } | null>(null);

  const validateForm = (): boolean => {
    setValidationError(null);
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMsg = formData.message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setValidationError('Please enter your full name (minimum 2 characters).');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setValidationError('Please provide a valid email address.');
      return false;
    }

    if (!trimmedMsg || trimmedMsg.length < 10) {
      setValidationError('Please write a brief message describing your inquiry (minimum 10 characters).');
      return false;
    }

    if (trimmedMsg.length > 2000) {
      setValidationError('Your message exceeds the 2000-character limit. Please summarize your inquiry.');
      return false;
    }

    return true;
  };

  const handleWhatsAppSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedService = formData.service || 'Web Development';
    const trimmedMsg = formData.message.trim();

    // Dynamically generate properly URL-encoded WhatsApp message
    const formattedMessage = `Hello Muhammad Akram,\n\nI am contacting you from your portfolio website.\n\n*Name:* ${trimmedName}\n*Email:* ${trimmedEmail}\n*Service Required:* ${trimmedService}\n\n*Project Scope & Details:*\n${trimmedMsg}`;
    const targetUrl = `https://wa.me/923347365583?text=${encodeURIComponent(formattedMessage)}`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    setSubmissionFeedback({
      type: 'whatsapp',
      title: 'WhatsApp Opened',
      message: 'WhatsApp opened with your inquiry. Please review and press Send.',
      actionUrl: targetUrl
    });
    setSubmitted(true);
  };

  const handleEmailSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedService = formData.service || 'Web Development';
    const trimmedMsg = formData.message.trim();

    const subject = `Project Inquiry: ${trimmedService} — ${trimmedName}`;
    const body = `Hello Muhammad Akram,\n\nI am contacting you from your portfolio website.\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\nService Required: ${trimmedService}\n\nProject Scope & Details:\n${trimmedMsg}\n\nBest regards,\n${trimmedName}`;
    const mailtoUrl = `mailto:muhammadakramkhan3545@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    setSubmissionFeedback({
      type: 'email',
      title: 'Email Application Opened',
      message: 'Email draft opened in your email client with your inquiry details. Please review and click Send.',
      actionUrl: mailtoUrl
    });
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 relative border-t border-white/[0.06] bg-[#07090e]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          onClick={(e) => {
            if (canSelectInStudio) {
              e.stopPropagation();
              setSelectedElement({
                type: 'contact',
                id: 'sec-contact',
                label: 'Availability & Contact Status',
                breadcrumbs: [
                  { id: 'home', label: 'Home', type: 'section' },
                  { id: 'sec-contact', label: 'Contact', type: 'contact' }
                ]
              });
            }
          }}
          className={`max-w-3xl mb-16 p-2 -m-2 rounded-xl transition-all relative ${
            canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40' : ''
          } ${isSelected && canSelectInStudio ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10]' : ''}`}
        >
          {isSelected && canSelectInStudio && (
            <span className="absolute -top-3 left-2 px-1.5 py-0.5 rounded bg-sky-500 text-white font-mono text-[9px] font-bold z-30 shadow-md">
              Contact & Availability
            </span>
          )}
          {/* Live Availability Status Indicator */}
          {data.contact.availableForWork && (
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold">{data.contact.availableBadgeText}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{data.contact.responseTime}</span>
            </div>
          )}

          <h2 className="section-major-heading">
            {data.contact.sectionTitle}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3 font-normal leading-relaxed">
            {data.contact.sectionSubtitle}
          </p>
        </div>

        {/* 2-Column Contact Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Inquiries & Channel Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Phone Card with 1-Click Dial & Copy */}
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a] hover:border-amber-400/40 hover:bg-[#121622] hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-300 relative overflow-hidden group/card">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover/card:via-amber-400/80 transition-all duration-500" />
              <div className="text-xs font-mono text-amber-400 mb-1 uppercase tracking-wider font-semibold flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Direct Mobile Dial</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mb-4 group-hover/card:text-amber-200 transition-colors font-heading tracking-wide">
                {phoneNumber}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 rounded-lg transition-colors cursor-pointer shadow-md shadow-amber-400/20"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-950" />
                  <span>Call {phoneNumber}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp Card with Instant Chat */}
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a] hover:border-emerald-400/40 hover:bg-[#121622] hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-400/5 transition-all duration-300 relative overflow-hidden group/card">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/0 to-transparent group-hover/card:via-emerald-400/80 transition-all duration-500" />
              <div className="text-xs font-mono text-emerald-400 mb-1 uppercase tracking-wider font-semibold flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Instant Messaging</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mb-4 group-hover/card:text-emerald-200 transition-colors font-heading tracking-wide">
                WhatsApp: {whatsappNumber}
              </div>
              <div>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </a>
              </div>
            </div>

            {/* Quick Email Card with 1-Click Copy */}
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a] hover:border-amber-400/40 hover:bg-[#121622] hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-300 relative overflow-hidden group/card">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover/card:via-amber-400/80 transition-all duration-500" />
              <div className="text-xs font-mono text-amber-400 mb-1 uppercase tracking-wider font-semibold">
                Direct Electronic Mail
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mb-4 break-all group-hover/card:text-amber-200 transition-colors font-heading">
                {data.personal.email}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${data.personal.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-300 rounded-lg transition-colors cursor-pointer shadow-md shadow-amber-400/20"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-950" />
                  <span>Send Direct Mail</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Connect Options */}
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a] space-y-4">
              <div className="text-xs font-mono text-slate-500 mb-2">
                Verified Professional Profiles
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://www.linkedin.com/in/muhammad-akram-a54324406/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors group cursor-pointer"
                >
                  <PlatformIcon platformOrIcon="linkedin" className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-medium truncate">LinkedIn Profile</span>
                </a>

                <a
                  href="https://www.fiverr.com/akramtech3545"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors group cursor-pointer"
                >
                  <PlatformIcon platformOrIcon="fiverr" className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-medium truncate">Fiverr Profile</span>
                </a>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors group cursor-pointer"
                >
                  <PlatformIcon platformOrIcon="whatsapp" className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-medium truncate">WhatsApp: 03347365583</span>
                </a>

                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white transition-colors group cursor-pointer"
                >
                  <PlatformIcon platformOrIcon="phone" className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-medium truncate">Phone: {phoneNumber}</span>
                </a>
              </div>
            </div>

            {/* Hiring Statement */}
            <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0f131a]">
              <h4 className="text-sm font-semibold text-white mb-2">
                {data.contact.hiringCtaTitle}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {data.contact.hiringCtaDescription}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Proposal & Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0f131a]">
              {submitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
                    {submissionFeedback?.title || 'Inquiry Prepared'}
                  </h3>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm max-w-md mx-auto leading-relaxed">
                    {submissionFeedback?.message || 'WhatsApp opened with your inquiry. Please review and press Send.'}
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Selected Service: <span className="text-sky-300 font-semibold">{formData.service}</span>
                    <br />
                    Destination: <span className="text-slate-200 font-mono">03347365583 (WhatsApp)</span>
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {submissionFeedback?.actionUrl && (
                      <a
                        href={submissionFeedback.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Re-open WhatsApp (03347365583)</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Also Open Email Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setSubmissionFeedback(null);
                        setFormData({
                          name: '',
                          email: '',
                          service: data.contact.formServices[0] || '',
                          message: ''
                        });
                      }}
                      className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                    >
                      Write Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWhatsAppSubmit} className="space-y-5">
                  {validationError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {validationError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {data.contact.nameFieldLabel || 'Your Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-4 py-2.5 text-sm bg-[#090b10] border border-white/[0.08] focus:border-sky-400 rounded-lg text-white placeholder:text-slate-600 outline-none transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        {data.contact.emailFieldLabel || 'Email Address'}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="alex@company.com"
                        className="w-full px-4 py-2.5 text-sm bg-[#090b10] border border-white/[0.08] focus:border-sky-400 rounded-lg text-white placeholder:text-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Service selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Service / Primary Interest
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-[#090b10] border border-white/[0.08] focus:border-sky-400 rounded-lg text-white outline-none transition-colors cursor-pointer"
                    >
                      {data.contact.formServices.map((srv) => (
                        <option key={srv} value={srv} className="bg-[#0f131a] text-white">
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {data.contact.messageFieldLabel || 'Project Overview & Scope'}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Describe your objectives, timeline, or specific questions..."
                      className="w-full px-4 py-2.5 text-sm bg-[#090b10] border border-white/[0.08] focus:border-sky-400 rounded-lg text-white placeholder:text-slate-600 outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Actions: Primary WhatsApp + Alternative Email Draft */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 hover:from-emerald-300 hover:to-emerald-200 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer font-heading tracking-wide"
                      title="Send inquiry directly via WhatsApp to 03347365583"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-950" />
                      <span>Send Inquiry via WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      className="inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-semibold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-xl transition-all cursor-pointer"
                      title="Open prefilled email draft to muhammadakramkhan3545@gmail.com"
                    >
                      <Mail className="w-4 h-4 text-amber-400" />
                      <span>Open Email Draft</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
