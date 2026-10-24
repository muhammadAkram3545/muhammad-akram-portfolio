export interface SocialPlatformConfig {
  name: string;
  key: string;
  icon: string;
  expectedDomains: string[];
  placeholder: string;
  defaultPrefix: string;
  exampleUrl: string;
  validate?: (url: string) => boolean;
}

export const SUPPORTED_SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    name: 'LinkedIn',
    key: 'linkedin',
    icon: 'Linkedin',
    expectedDomains: ['linkedin.com', 'www.linkedin.com'],
    placeholder: 'https://linkedin.com/in/username',
    defaultPrefix: 'https://linkedin.com/in/',
    exampleUrl: 'https://linkedin.com/in/username'
  },
  {
    name: 'Fiverr',
    key: 'fiverr',
    icon: 'Briefcase',
    expectedDomains: ['fiverr.com', 'www.fiverr.com'],
    placeholder: 'https://fiverr.com/username',
    defaultPrefix: 'https://fiverr.com/',
    exampleUrl: 'https://fiverr.com/username'
  },
  {
    name: 'Upwork',
    key: 'upwork',
    icon: 'Briefcase',
    expectedDomains: ['upwork.com', 'www.upwork.com'],
    placeholder: 'https://upwork.com/freelancers/~01abcdef123456',
    defaultPrefix: 'https://upwork.com/freelancers/~',
    exampleUrl: 'https://upwork.com/freelancers/~01abcdef123456'
  },
  {
    name: 'GitHub',
    key: 'github',
    icon: 'Github',
    expectedDomains: ['github.com', 'www.github.com'],
    placeholder: 'https://github.com/username',
    defaultPrefix: 'https://github.com/',
    exampleUrl: 'https://github.com/username'
  },
  {
    name: 'WhatsApp',
    key: 'whatsapp',
    icon: 'MessageSquare',
    expectedDomains: ['wa.me', 'api.whatsapp.com', 'chat.whatsapp.com'],
    placeholder: 'https://wa.me/1234567890',
    defaultPrefix: 'https://wa.me/',
    exampleUrl: 'https://wa.me/1234567890'
  },
  {
    name: 'Behance',
    key: 'behance',
    icon: 'Palette',
    expectedDomains: ['behance.net', 'www.behance.net'],
    placeholder: 'https://behance.net/username',
    defaultPrefix: 'https://behance.net/',
    exampleUrl: 'https://behance.net/username'
  },
  {
    name: 'Dribbble',
    key: 'dribbble',
    icon: 'Palette',
    expectedDomains: ['dribbble.com', 'www.dribbble.com'],
    placeholder: 'https://dribbble.com/username',
    defaultPrefix: 'https://dribbble.com/',
    exampleUrl: 'https://dribbble.com/username'
  },
  {
    name: 'X / Twitter',
    key: 'twitter',
    icon: 'Share2',
    expectedDomains: ['x.com', 'twitter.com', 'www.x.com', 'www.twitter.com'],
    placeholder: 'https://x.com/username',
    defaultPrefix: 'https://x.com/',
    exampleUrl: 'https://x.com/username'
  },
  {
    name: 'YouTube',
    key: 'youtube',
    icon: 'Share2',
    expectedDomains: ['youtube.com', 'www.youtube.com', 'youtu.be'],
    placeholder: 'https://youtube.com/@channel',
    defaultPrefix: 'https://youtube.com/@',
    exampleUrl: 'https://youtube.com/@channel'
  },
  {
    name: 'Direct Email',
    key: 'email',
    icon: 'Mail',
    expectedDomains: [],
    placeholder: 'mailto:name@domain.com',
    defaultPrefix: 'mailto:',
    exampleUrl: 'mailto:name@domain.com',
    validate: (url: string) => /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url.trim())
  },
  {
    name: 'Custom Profile',
    key: 'custom',
    icon: 'Link',
    expectedDomains: [],
    placeholder: 'https://yourwebsite.com',
    defaultPrefix: 'https://',
    exampleUrl: 'https://yourwebsite.com'
  }
];

export interface SocialValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  errorMessage?: string;
  platformName: string;
}

/**
 * Normalizes and validates a social media profile URL against the selected platform.
 * Rejects unsafe protocols (javascript:, data:), malformed URLs, and incorrect domains.
 */
export function validateSocialUrl(platformName: string, rawUrl: string): SocialValidationResult {
  const trimmed = (rawUrl || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: '',
      errorMessage: 'URL cannot be empty.',
      platformName
    };
  }

  // Reject dangerous protocols
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:')) {
    return {
      isValid: false,
      normalizedUrl: '',
      errorMessage: 'Unsafe protocol detected. Only https:// or mailto: links are permitted.',
      platformName
    };
  }

  // Handle mailto:
  if (platformName === 'Direct Email' || lower.startsWith('mailto:')) {
    const isMail = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed);
    return {
      isValid: isMail,
      normalizedUrl: trimmed,
      errorMessage: isMail ? undefined : 'Please enter a valid email address with mailto: prefix (e.g. mailto:name@domain.com).',
      platformName
    };
  }

  // Prepend https:// if protocol is omitted
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      isValid: false,
      normalizedUrl: normalized,
      errorMessage: 'Malformed URL structure. Please enter a complete web address.',
      platformName
    };
  }

  // Enforce HTTPS
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      isValid: false,
      normalizedUrl: normalized,
      errorMessage: 'Only secure HTTP/HTTPS URLs are allowed.',
      platformName
    };
  }

  // Platform domain validation
  const platform = SUPPORTED_SOCIAL_PLATFORMS.find(
    (p) => p.name.toLowerCase() === platformName.toLowerCase() || p.key.toLowerCase() === platformName.toLowerCase()
  );

  if (platform && platform.expectedDomains.length > 0) {
    const hostname = parsed.hostname.toLowerCase();
    const isDomainMatch = platform.expectedDomains.some(
      (dom) => hostname === dom || hostname.endsWith(`.${dom}`)
    );

    if (!isDomainMatch) {
      return {
        isValid: false,
        normalizedUrl: parsed.href,
        errorMessage: `The URL does not match ${platform.name}. Expected domain: ${platform.expectedDomains.join(' or ')}.`,
        platformName: platform.name
      };
    }

    // Path check: make sure user didn't just paste domain root (e.g. "https://fiverr.com/")
    if (parsed.pathname === '/' || parsed.pathname === '') {
      return {
        isValid: false,
        normalizedUrl: parsed.href,
        errorMessage: `Please include your specific ${platform.name} profile username or identifier in the URL (e.g. ${platform.exampleUrl}).`,
        platformName: platform.name
      };
    }
  }

  return {
    isValid: true,
    normalizedUrl: parsed.href,
    platformName: platform ? platform.name : platformName
  };
}
