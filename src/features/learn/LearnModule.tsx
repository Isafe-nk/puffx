import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { getModule, phaseSlugForModule, lessonSlug } from './learnConfig';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import { useVisited, readCount } from './progress';

export default function LearnModule() {
  const { moduleSlug } = useParams();
  const mod = moduleSlug ? getModule(moduleSlug) : undefined;
  usePageTitle(mod ? `Module ${mod.code.replace('M', '')} · ${mod.title}` : undefined);
  const visited = useVisited();

  // Unknown slug → back to the Learn landing.
  if (!mod) return <Navigate to="/learn" replace />;

  const readHere = readCount(visited, mod.lessons.map((l) => l.id));

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header */}
        <div className="pt-12 lg:pt-16">
          <Link
            to={`/learn/phase/${phaseSlugForModule(mod)}`}
            className="inline-flex items-center gap-1 text-[11px] text-[#75806F] hover:text-[#243129] font-medium mb-7 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> {mod.phase}
          </Link>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#3E7355]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9AA394] font-semibold">Module {mod.code.replace('M', '')}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#243129] leading-tight">{mod.title}</h1>
          <p className="mt-4 text-[15px] text-[#75806F] leading-relaxed max-w-2xl">{mod.blurb}</p>
          <p className="mt-3 text-[12px] text-[#9AA394] font-mono">
            {mod.level} · {mod.lessons.length} lessons
            {readHere > 0 && <span className="text-[#3E7355]"> · {readHere} of {mod.lessons.length} read</span>}
          </p>
        </div>

        {/* Lessons — every curriculum lesson is a reading page; the lesson view
            resolves its content chunk on open and shows a fallback if missing. */}
        <ol className="mt-10 border-t border-[#DCE0D2]">
          {mod.lessons.map((l) => {
            const read = visited.has(l.id);
            return (
              <li key={l.id} className="border-b border-[#E8EADF]">
                <Link
                  to={`/learn/${mod.slug}/${lessonSlug(l.id)}`}
                  className="group flex items-center gap-4 py-3.5 text-[#4A544C] hover:text-[#243129] transition-colors"
                >
                  <span
                    className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${read ? 'bg-[#3E7355]' : 'border border-[#C7CDBB]'}`}
                    aria-label={read ? 'Read' : 'Not read yet'}
                  >
                    {read && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[11px] font-mono text-[#9AA394] w-10 shrink-0">{l.id}</span>
                  <span className="text-[14px] leading-snug">{l.title}</span>
                  <ChevronRight className="w-4 h-4 ml-auto shrink-0 text-[#C7CDBB] group-hover:text-[#3E7355] group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
