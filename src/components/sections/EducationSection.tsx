import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Code2,
  Sparkles
} from 'lucide-react';

export const EducationSection: React.FC = () => {
  const { data, isStudioRoute, isStudioPreviewMode, selectedElement, setSelectedElement } = usePortfolio();

  const canSelectInStudio = isStudioRoute && !isStudioPreviewMode;
  const isSelected = selectedElement?.id === 'sec-education' || selectedElement?.type === 'education';

  const defaultEducation = {
    institute: 'Aptech Learning, North Nazimabad',
    location: 'North Nazimabad, Karachi',
    program: 'Information Systems Management',
    currentStatus: 'In Progress',
    progressNote: 'The one-year course is not yet completed. Approximately six to seven months have been completed.',
    semesters: [
      {
        id: 'sem-1',
        shortName: 'CPISM',
        name: 'Certificate of Proficiency in Information Systems Management',
        status: 'Completed' as const,
        completionNote: 'Completed & Certified',
        modules: [
          'Effective Productivity through Office Automation',
          'Progressive Website Development',
          'Bootstrap and jQuery for Responsive Web',
          'Distributed Version Control',
          'Optimize Web for Search Engines',
          'Modern Web with XML',
          'CPISM eProject'
        ]
      },
      {
        id: 'sem-2',
        shortName: 'DISM',
        name: 'Diploma in Information Systems Management',
        status: 'In Progress' as const,
        completionNote: 'Currently Active (Finalizing Coursework & Projects)',
        modules: [
          'Dynamic Website Development (WordPress & Core PHP)',
          'Modern Web with Next JS',
          'Developing Mobile Apps (Flutter)',
          'UI and UX Design with Figma',
          'DISM eProject'
        ]
      }
    ]
  };

  const eduData = data.education || defaultEducation;

  return (
    <section id="education" className="py-24 relative border-t border-white/[0.06] bg-[#080b11]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          onClick={(e) => {
            if (canSelectInStudio) {
              e.stopPropagation();
              setSelectedElement({
                type: 'education',
                id: 'sec-education',
                label: 'Education & Academic Training',
                breadcrumbs: [
                  { id: 'home', label: 'Home', type: 'section' },
                  { id: 'sec-education', label: 'Education', type: 'education' }
                ]
              });
            }
          }}
          className={`mb-16 max-w-3xl p-2 -m-2 rounded-xl transition-all relative ${
            canSelectInStudio ? 'cursor-pointer hover:ring-1 hover:ring-sky-400/40' : ''
          } ${isSelected && canSelectInStudio ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-[#090b10]' : ''}`}
        >
          {isSelected && canSelectInStudio && (
            <span className="absolute -top-3 left-2 px-1.5 py-0.5 rounded bg-sky-500 text-white font-mono text-[9px] font-bold z-30 shadow-md">
              Education Section
            </span>
          )}

          <div className="text-xs sm:text-sm font-mono text-amber-400 mb-3 uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Formal Academic Education</span>
          </div>

          <h2 className="section-major-heading">
            Structured learning & technical curriculum.
          </h2>

          <p className="text-slate-400 text-base sm:text-lg mt-3 font-normal leading-relaxed">
            Hands-on qualification in Information Systems Management covering web architecture, CMS engineering, and modern digital development.
          </p>
        </div>

        {/* Institution & Overview Summary Card */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#0f131a] border border-white/[0.08] relative overflow-hidden group hover:border-amber-400/30 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/70 transition-all duration-500" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 font-mono text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{eduData.institute}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/25 text-sky-300 font-mono text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Status: {eduData.currentStatus}</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                {eduData.program}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {eduData.progressNote}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 text-xs font-mono text-slate-400 border-t lg:border-t-0 border-white/[0.08] pt-4 lg:pt-0">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>1-Year Diploma Track (2024 – Present)</span>
              </div>
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Active Aptech Student</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Semester Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {eduData.semesters.map((sem, idx) => {
            const isCompleted = sem.status === 'Completed';

            return (
              <div
                key={sem.id}
                className="p-6 sm:p-8 rounded-2xl bg-[#0f131a] border border-white/[0.08] hover:border-amber-400/40 hover:bg-[#121622] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group/card"
              >
                {/* Top Accent Gradient Line */}
                <div
                  className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${
                    isCompleted
                      ? 'via-emerald-400/60'
                      : 'via-amber-400/60'
                  } to-transparent`}
                />

                <div>
                  {/* Semester Badge Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                      Semester {idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>CPISM Certified</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                          <span>In Progress</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Short Name */}
                  <h4 className="text-xl sm:text-2xl font-bold text-white font-heading group-hover/card:text-amber-200 transition-colors mb-2">
                    {sem.shortName}
                  </h4>
                  <p className="text-sm text-slate-400 mb-6 font-medium">
                    {sem.name}
                  </p>

                  {/* Module List */}
                  <div className="space-y-2.5 mb-6">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>Curriculum Modules & Competencies</span>
                    </div>

                    <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                      {sem.modules.map((mod, mIdx) => (
                        <li
                          key={mIdx}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                        >
                          <span
                            className={`mt-0.5 shrink-0 ${
                              isCompleted ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                          <span className="leading-snug">{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-4 border-t border-white/[0.06] text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span className="text-slate-500">{sem.completionNote}</span>
                  <span className="text-sky-400 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Hands-on Lab</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
