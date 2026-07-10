import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getModule, phaseSlugForModule, lessonSlug } from './learnConfig';
import { usePageTitle } from '../../shared/hooks/usePageTitle';

export default function LearnModule() {
  const { moduleSlug } = useParams();
  const mod = moduleSlug ? getModule(moduleSlug) : undefined;
  usePageTitle(mod ? `Module ${mod.code.replace('M', '')} · ${mod.title}` : undefined);

  // Unknown slug → back to the Learn landing.
  if (!mod) return <Navigate to="/learn" replace />;

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header */}
        <div className="pt-12 lg:pt-16">
          <Link
            to={`/learn/phase/${phaseSlugForModule(mod)}`}
            className="inline-flex items-center gap-1 text-[11px] text-[#727579] hover:text-[#212121] font-medium mb-7 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> {mod.phase}
          </Link>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#D91222]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#A2A3A5] font-semibold">Module {mod.code.replace('M', '')}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#212121] leading-tight">{mod.title}</h1>
          <p className="mt-4 text-[15px] text-[#727579] leading-relaxed max-w-2xl">{mod.blurb}</p>
          <p className="mt-3 text-[12px] text-[#A2A3A5] font-mono">{mod.level} · {mod.lessons.length} lessons</p>
        </div>

        {/* Lessons — every curriculum lesson is a reading page; the lesson view
            resolves its content chunk on open and shows a fallback if missing. */}
        <ol className="mt-10 border-t border-[#E6E6E6]">
          {mod.lessons.map((l) => (
            <li key={l.id} className="border-b border-[#EEEEEE]">
              <Link
                to={`/learn/${mod.slug}/${lessonSlug(l.id)}`}
                className="group flex items-center gap-4 py-3.5 text-[#44474D] hover:text-[#212121] transition-colors"
              >
                <span className="text-[11px] font-mono text-[#A2A3A5] w-10 shrink-0">{l.id}</span>
                <span className="text-[14px] leading-snug">{l.title}</span>
                <ChevronRight className="w-4 h-4 ml-auto shrink-0 text-[#D0D1D2] group-hover:text-[#D91222] group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
