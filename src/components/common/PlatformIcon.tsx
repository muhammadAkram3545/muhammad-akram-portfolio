import React from 'react';
import {
  MessageSquare,
  Linkedin,
  Github,
  Mail,
  Briefcase,
  Globe,
  Share2,
  Palette,
  ExternalLink,
  Code,
  Phone
} from 'lucide-react';

interface PlatformIconProps {
  platformOrIcon: string;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platformOrIcon, className = 'w-4 h-4' }) => {
  const norm = (platformOrIcon || '').toLowerCase();

  // Phone / Dialer
  if (norm.includes('phone') || norm.includes('tel') || norm.includes('call') || norm.includes('03347365583')) {
    return <Phone className={className} />;
  }

  // WhatsApp
  if (norm.includes('whatsapp') || norm.includes('wa.me') || norm === 'messagesquare') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    );
  }

  // LinkedIn
  if (norm.includes('linkedin')) {
    return <Linkedin className={className} />;
  }

  // GitHub
  if (norm.includes('github') || norm.includes('git')) {
    return <Github className={className} />;
  }

  // Upwork
  if (norm.includes('upwork')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.47 6.07c-2.07 0-3.69 1.4-4.25 3.32-.97-1.47-1.72-3.23-2.05-5.39H8.73v6.78c0 1.54-.88 2.45-2.18 2.45s-2.18-.91-2.18-2.45V4H1.93v6.78c0 2.87 2.05 4.88 4.62 4.88 2.49 0 4.35-1.85 4.58-4.24.47 1.28 1.18 2.48 2.11 3.49l-1.68 7.09h2.48l1.21-5.11c1.07.67 2.33 1.05 3.69 1.05 3.16 0 5.63-2.48 5.63-5.94 0-3.45-2.47-5.93-7.1-5.93zm0 9.48c-1.28 0-2.4-.6-3.03-1.57l.32-1.35c.42-1.78 1.39-3.08 2.71-3.08 1.88 0 3.15 1.51 3.15 3.5 0 2-1.27 3.5-3.15 3.5z" />
      </svg>
    );
  }

  // Fiverr
  if (norm.includes('fiverr')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 9h2v6H8zM14 9h2v6h-2zM11 7h2v2h-2z" />
        <path d="M12 17c2.5 0 4-1 4-2.5h-1.8c0 .7-.8 1-2.2 1-1.3 0-2-.5-2-1.2h6V13c0-2-1.5-3.5-4-3.5-2.8 0-4.5 1.8-4.5 4.5 0 2.5 1.8 4 4.5 4z" />
      </svg>
    );
  }

  // Email / Mail
  if (norm.includes('mail') || norm.includes('email')) {
    return <Mail className={className} />;
  }

  // Behance
  if (norm.includes('behance')) {
    return <Palette className={className} />;
  }

  // Twitter / X
  if (norm.includes('twitter') || norm === 'x' || norm.includes('share2')) {
    return <Share2 className={className} />;
  }

  // Fallback
  return <Briefcase className={className} />;
};
