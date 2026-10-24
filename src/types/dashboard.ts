export type DashboardTab =
  | 'dashboard'
  | 'home'
  | 'about'
  | 'skills'
  | 'services'
  | 'projects'
  | 'experience'
  | 'contact'
  | 'socials'
  | 'media'
  | 'navigation'
  | 'footer'
  | 'settings';

export interface DashboardNavEntry {
  id: DashboardTab;
  label: string;
  sublabel: string;
  iconName: string;
}
