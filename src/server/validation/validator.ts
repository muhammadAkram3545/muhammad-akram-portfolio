import { PortfolioData } from '../../types/portfolio';
import { PublishValidationResult } from '../../types/backend';

export function validatePortfolioForPublish(data: PortfolioData): PublishValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Personal Identity Validation
  if (!data.personal?.fullName || data.personal.fullName.trim().length === 0) {
    errors.push('Full name is required in Hero settings.');
  }

  if (!data.personal?.roles || data.personal.roles.length === 0) {
    errors.push('At least one professional role/discipline must be configured.');
  }

  if (!data.personal?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) {
    errors.push('A valid contact email address is required.');
  }

  // 2. Sections Visibility Validation
  const visibleSections = data.sections?.filter((s) => s.isVisible) || [];
  if (visibleSections.length === 0) {
    errors.push('At least one section must be visible to visitors.');
  }

  // 3. Projects Validation
  const visibleProjects = data.projects?.filter((p) => p.isVisible) || [];
  if (visibleProjects.length === 0) {
    warnings.push('No projects are currently marked as visible in the showcase.');
  }

  visibleProjects.forEach((proj, idx) => {
    if (!proj.title || proj.title.trim().length === 0) {
      errors.push(`Project #${idx + 1} is missing a title.`);
    }
    if (!proj.imageUrl) {
      warnings.push(`Project "${proj.title}" does not have a featured image.`);
    }
  });

  // 4. Skills & Services
  const visibleSkills = data.skills?.filter((s) => s.isVisible) || [];
  if (visibleSkills.length === 0) {
    warnings.push('No skills are currently set to visible.');
  }

  const visibleServices = data.services?.filter((s) => s.isVisible) || [];
  if (visibleServices.length === 0) {
    warnings.push('No capabilities/services are currently set to visible.');
  }

  // 5. Media Reference Checks
  if (!data.personal?.avatarUrl) {
    warnings.push('Hero portrait avatar is not set. A default placeholder will be displayed.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      activeSections: visibleSections.length,
      activeProjects: visibleProjects.length,
      skillsCount: visibleSkills.length,
      servicesCount: visibleServices.length,
      mediaItems: data.media?.length || 0
    }
  };
}
