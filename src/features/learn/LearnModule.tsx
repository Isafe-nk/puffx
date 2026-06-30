import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, Circle } from 'lucide-react';
import { getModule } from './learnConfig';

export default function LearnModule() {
  const { moduleSlug } = useParams();
  const mod = moduleSlug ? getModule(moduleSlug) : undefined;

  // Unknown slug → back to the Learn overview.
  if (!mod) return <Navigate to="/learn" replace />;

  return (
    <div className="w-full">
      <header className="border-b border-[#E6E6E6] bg-white/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto">
          <Link to="/learn" className="inline-flex items-center gap-1 text-[11px] text-[#727579] hover:text-[#212121] font-medium mb-2 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> All modules
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold text-[#D91222] bg-[#D91222]/10 px-2 py-0.5 rounded shrink-0">{mod.code}</span>
            <h1 className="text-xl font-bold font-display tracking-tight text-[#212121]">{mod.title}</h1>
          </div>
          <p className="text-xs text-[#727579] font-sans mt-1">
            {mod.phase} · {mod.level} · {mod.lessons.length} lessons — {mod.blurb}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 lg:p-6">
        <ol className="space-y-2">
          {mod.lessons.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 border border-[#E6E6E6]"
            >
              <Circle className="w-3.5 h-3.5 text-[#D0D1D2] shrink-0" />
              <span className="text-[10px] font-mono text-[#A2A3A5] w-9 shrink-0">{l.id}</span>
              <span className="text-[13px] text-[#44474D]">{l.title}</span>
            </li>
          ))}
        </ol>

        <p className="text-[11px] text-[#A2A3A5] mt-4 px-1">
          Lesson content is being written. Each lesson opens as a short, bite-sized read once published.
        </p>
      </main>
    </div>
  );
}
