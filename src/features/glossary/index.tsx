import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { LEARN_MODULES } from '../learn/learnConfig';
import { usePageTitle } from '../../shared/hooks/usePageTitle';
import raw from './data/glossary.json';

interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  modules: string[];
  figure?: string;
  source?: string;
}

const TERMS: GlossaryTerm[] = (raw as { terms: GlossaryTerm[] }).terms;

// Module code (M1…) → route slug, from the Learn config.
const MODULE_SLUG: Record<string, string> = Object.fromEntries(
  LEARN_MODULES.map((m) => [m.code, m.slug])
);

// Grouping letter for the A–Z index; non-alphabetic terms (e.g. "50/30/20 rule")
// collect under "#", listed first.
const letterOf = (term: string) => (/[a-z]/i.test(term[0]) ? term[0].toUpperCase() : '#');

const ALPHABET = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

function TermCard({ t }: { t: GlossaryTerm }) {
  return (
    <div className="rounded-2xl border border-[#DCE0D2] bg-white p-6">
      {/* scroll-mt clears the fixed mobile header + sticky letter bar when deep-linked */}
      <h3 id={t.slug} className="scroll-mt-28 text-sm font-bold font-display text-[#243129]">
        {t.term}
      </h3>
      <p className="mt-2.5 text-[13px] text-[#75806F] leading-relaxed">{t.definition}</p>
      {t.figure && (
        <p className="mt-3 pt-3 border-t border-[#E8EADF] text-[11px] text-[#9AA394] leading-relaxed">
          {t.figure}
          {t.source && <span className="block mt-0.5">Source: {t.source}</span>}
        </p>
      )}
      {t.modules.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.modules.map((code) =>
            MODULE_SLUG[code] ? (
              <Link
                key={code}
                to={`/learn/${MODULE_SLUG[code]}`}
                className="text-[10px] font-mono text-[#75806F] bg-[#F6F4EC] border border-[#DCE0D2] rounded px-1.5 py-0.5 hover:border-[#3E7355] hover:text-[#3E7355] transition-colors"
              >
                Module {code.replace('M', '')}
              </Link>
            ) : (
              <span key={code} className="text-[10px] font-mono text-[#75806F] bg-[#F6F4EC] border border-[#DCE0D2] rounded px-1.5 py-0.5">
                {code}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function Glossary() {
  usePageTitle('Glossary');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? TERMS.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
      : TERMS;
    const byLetter = new Map<string, GlossaryTerm[]>();
    for (const t of matches) {
      const letter = letterOf(t.term);
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), t]);
    }
    return [...byLetter.entries()]
      .sort(([a], [b]) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)))
      .map(([letter, terms]) => ({
        letter,
        terms: [...terms].sort((a, b) => a.term.localeCompare(b.term)),
      }));
  }, [query]);

  const matchCount = groups.reduce((n, g) => n + g.terms.length, 0);

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20">

        {/* Header */}
        <div className="pt-12 lg:pt-16">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-px bg-[#3E7355]" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9AA394] font-semibold">Reference</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black font-display tracking-tight text-[#243129] leading-tight">Glossary</h1>
          <p className="mt-4 text-[15px] text-[#75806F] leading-relaxed max-w-2xl">
            {TERMS.length} terms from the course and the visualizer — EPF to withholding tax, in plain English.
          </p>
        </div>

        {/* Core decision */}
        <section className="mt-10 rounded-2xl border border-[#DCE0D2] bg-white p-6 lg:p-7">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9AA394] font-semibold mb-2">The core decision</p>
          <h2 className="text-lg lg:text-xl font-bold font-display text-[#243129] mb-2 tracking-tight">
            US-domiciled vs Ireland-domiciled S&P 500 ETFs
          </h2>
          <p className="text-sm text-[#4A544C] leading-relaxed">
            Both track the same index, so the contest is decided by leakage, not returns.
            <strong> US funds</strong> win on fees (lower TER) but lose 30% of dividends to withholding tax and
            carry US estate-tax exposure. <strong>Irish UCITS</strong> charge a little more in TER but cut
            withholding tax to 15% and remove the estate-tax risk. The visualizer compounds those opposing
            forces over your horizon to show which one actually leaves you with more.
          </p>
        </section>

        {/* Search */}
        <div className="mt-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA394]" strokeWidth={1.75} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms and definitions…"
            aria-label="Search glossary"
            className="w-full bg-white border border-[#DCE0D2] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#243129] placeholder:text-[#9AA394] focus:outline-none focus:border-[#3E7355] focus:ring-1 focus:ring-[#3E7355]/30"
          />
          {query && (
            <p className="mt-2 text-[11px] text-[#75806F]" role="status">
              {matchCount === 0 ? 'No terms match' : `${matchCount} of ${TERMS.length} terms`}
            </p>
          )}
        </div>

        {/* A–Z jump bar — letters without terms (in the current filter) are dimmed */}
        <nav aria-label="Jump to letter" className="mt-5 flex flex-wrap gap-x-0.5 gap-y-1">
          {ALPHABET.map((letter) => {
            const has = groups.some((g) => g.letter === letter);
            return has ? (
              <a
                key={letter}
                href={`#az-${letter}`}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[12px] font-mono font-semibold text-[#4A544C] hover:text-[#3E7355] hover:bg-white active:scale-90 transition duration-150"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                aria-hidden="true"
                className="w-7 h-7 flex items-center justify-center text-[12px] font-mono text-[#C7CDBB] select-none"
              >
                {letter}
              </span>
            );
          })}
        </nav>

        {/* A–Z groups */}
        {matchCount === 0 ? (
          <p className="mt-10 text-[14px] text-[#75806F]">
            Nothing matches “{query.trim()}” — try a shorter word, or clear the search.
          </p>
        ) : (
          groups.map(({ letter, terms }) => (
            <section key={letter} className="mt-2">
              <h2
                id={`az-${letter}`}
                className="sticky top-14 lg:top-0 z-10 bg-[#F6F4EC] py-2.5 mt-4 scroll-mt-14 lg:scroll-mt-0 text-[13px] font-bold font-display text-[#243129] border-b border-[#DCE0D2]"
              >
                {letter}
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                {terms.map((t) => (
                  <TermCard key={t.slug} t={t} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Footnote */}
        <p className="mt-8 text-[11px] text-[#9AA394] leading-relaxed max-w-2xl">
          Educational only — not tax or investment advice. Rates and treaty treatment can change;
          confirm current figures with Interactive Brokers and a qualified adviser before acting.
        </p>
      </div>
    </div>
  );
}
