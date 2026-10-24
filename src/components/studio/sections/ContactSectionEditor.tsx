import React from 'react';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  Mail,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const ContactSectionEditor: React.FC = () => {
  const { draftData, updateData, toggleSectionVisibility } = usePortfolio();

  const contact = draftData.contact || {
    sectionTitle: 'Initiate Contact',
    sectionSubtitle: 'Have a project in mind?',
    email: 'muhammadakramkhan3545@gmail.com',
    whatsappUrl: '',
    availableForWork: true,
    availableBadgeText: 'Currently Available',
    hiringCtaTitle: 'Available for Select Projects',
    hiringCtaDescription: 'Let’s discuss your vision.',
    responseTime: 'Within 24 business hours',
    submitButtonText: 'Submit Project Inquiry',
    successMessage: 'Thank you for your message. I will follow up promptly.',
    nameFieldLabel: 'Your Name',
    emailFieldLabel: 'Email Address',
    messageFieldLabel: 'Project Overview & Scope'
  };

  const contactSection = draftData.sections?.find((s) => s.type === 'contact');
  const isContactVisible = contactSection ? contactSection.isVisible !== false : true;

  const handleUpdateContact = (field: string, value: any) => {
    updateData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Section Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📩 Contact & Inquiries</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure direct email, response times, inquiry form copy, and hiring availability.
          </p>
        </div>

        {contactSection && (
          <button
            onClick={() => toggleSectionVisibility(contactSection.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              isContactVisible
                ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
            }`}
          >
            {isContactVisible ? (
              <>
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Section Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Section Hidden</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Card 1: Direct Inquiries */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Direct Communication Details</h3>
            <p className="text-xs text-slate-400">Primary email and messaging channels displayed on the page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Primary Contact Email
            </label>
            <input
              type="email"
              value={contact.email || ''}
              onChange={(e) => handleUpdateContact('email', e.target.value)}
              placeholder="contact@muhammadakram.dev"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              WhatsApp or Direct Messaging Link
            </label>
            <input
              type="text"
              value={contact.whatsappUrl || ''}
              onChange={(e) => handleUpdateContact('whatsappUrl', e.target.value)}
              placeholder="https://wa.me/923347365583"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Response Time Guarantee
            </label>
            <input
              type="text"
              value={contact.responseTime || ''}
              onChange={(e) => handleUpdateContact('responseTime', e.target.value)}
              placeholder="Within 24 business hours"
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Form Text & Labels */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Inquiry Form Labels & Copy</h3>
          <p className="text-xs text-slate-400">Custom labels and messaging for the contact form</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Name Field Label
            </label>
            <input
              type="text"
              value={contact.nameFieldLabel || 'Your Name'}
              onChange={(e) => handleUpdateContact('nameFieldLabel', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Field Label
            </label>
            <input
              type="text"
              value={contact.emailFieldLabel || 'Email Address'}
              onChange={(e) => handleUpdateContact('emailFieldLabel', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Submit Button Text
            </label>
            <input
              type="text"
              value={contact.submitButtonText || 'Submit Project Inquiry'}
              onChange={(e) => handleUpdateContact('submitButtonText', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Message Field Label
            </label>
            <input
              type="text"
              value={contact.messageFieldLabel || 'Project Overview & Scope'}
              onChange={(e) => handleUpdateContact('messageFieldLabel', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Success Message
            </label>
            <input
              type="text"
              value={contact.successMessage || 'Thank you for your message. I will follow up promptly.'}
              onChange={(e) => handleUpdateContact('successMessage', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Hiring / Collaboration CTA Banner */}
      <div className="p-5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Call to Action Content</h3>
          <p className="text-xs text-slate-400">Headlines and availability indicators</p>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={contact.sectionTitle || ''}
              onChange={(e) => handleUpdateContact('sectionTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hiring Banner Heading
            </label>
            <input
              type="text"
              value={contact.hiringCtaTitle || ''}
              onChange={(e) => handleUpdateContact('hiringCtaTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Hiring Banner Description
            </label>
            <textarea
              rows={2}
              value={contact.hiringCtaDescription || ''}
              onChange={(e) => handleUpdateContact('hiringCtaDescription', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161c26] border border-white/10 text-xs text-white focus:outline-hidden focus:border-sky-500/50 resize-y"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <span className="text-xs font-medium text-slate-300">
            Show "Available for Work" Status Badge
          </span>
          <button
            onClick={() => handleUpdateContact('availableForWork', !contact.availableForWork)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              contact.availableForWork ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                contact.availableForWork ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
