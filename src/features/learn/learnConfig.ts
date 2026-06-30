// Single source of truth for the Learn section — the FFM ("Finance For Malaysian")
// curriculum, v1 (locked 2026-06-26): 9 modules / 68 lessons across two phases.
// The SideNav children, the /learn routes, and the Learn pages all read from here,
// so adding content = editing this file. Lesson prose is authored separately
// (canonical home is Notion); these are the titles/placeholders.

export interface Lesson {
  id: string;   // e.g. "L0.1"
  title: string;
}

export interface LearnModule {
  slug: string;     // URL segment, e.g. "money-mindset"
  code: string;     // "M0"
  title: string;    // "Money Mindset & Goals"
  phase: string;    // "Personal Finance" | "Investment"
  level: string;
  blurb: string;
  lessons: Lesson[];
}

export const LEARN_MODULES: LearnModule[] = [
  {
    slug: 'money-mindset',
    code: 'M0',
    title: 'Money Mindset & Goals',
    phase: 'Personal Finance',
    level: 'Beginner',
    blurb: 'The "why" before the numbers.',
    lessons: [
      { id: 'L0.1', title: 'Why school never taught you money' },
      { id: 'L0.2', title: 'Where money actually goes (earn · spend · save · grow · protect)' },
      { id: 'L0.3', title: 'Setting real financial goals (short / mid / long term)' },
      { id: 'L0.4', title: 'The right order to fix your finances (the course roadmap)' },
    ],
  },
  {
    slug: 'know-your-money',
    code: 'M1',
    title: 'Know Your Money',
    phase: 'Personal Finance',
    level: 'Beginner',
    blurb: 'Understand what you already earn.',
    lessons: [
      { id: 'L1.1', title: 'Read your payslip, line by line' },
      { id: 'L1.2', title: 'Gross vs net (take-home) pay' },
      { id: 'L1.3', title: 'EPF/KWSP: what it is & why it’s forced savings' },
      { id: 'L1.4', title: 'EPF accounts (Akaun 1/2/3) & i-Akaun' },
      { id: 'L1.5', title: 'SOCSO/PERKESO: what you’re actually protected against' },
      { id: 'L1.6', title: 'EIS: employment insurance' },
      { id: 'L1.7', title: 'PCB & how income tax works (LHDN basics)' },
      { id: 'L1.8', title: 'Calculate your net worth' },
      { id: 'L1.9', title: 'Track your cash flow' },
    ],
  },
  {
    slug: 'spend-save-smart',
    code: 'M2',
    title: 'Spend & Save Smart',
    phase: 'Personal Finance',
    level: 'Beginner → Intermediate',
    blurb: 'Make a system that actually sticks.',
    lessons: [
      { id: 'L2.1', title: 'Why budgeting fails (and how to make it stick)' },
      { id: 'L2.2', title: 'The 50/30/20 method' },
      { id: 'L2.3', title: 'The 6-jar method' },
      { id: 'L2.4', title: 'Tracking your spending' },
      { id: 'L2.5', title: 'Needs vs wants & lifestyle inflation' },
      { id: 'L2.6', title: 'Emergency fund: how much you need' },
      { id: 'L2.7', title: 'Where to park your emergency fund' },
      { id: 'L2.8', title: 'Savings account vs fixed deposit vs money-market' },
    ],
  },
  {
    slug: 'conquer-debt',
    code: 'M3',
    title: 'Conquer Debt',
    phase: 'Personal Finance',
    level: 'Beginner → Intermediate',
    blurb: 'Understand and escape what you owe.',
    lessons: [
      { id: 'L3.1', title: 'Good debt vs bad debt' },
      { id: 'L3.2', title: 'How interest really works (flat vs reducing balance)' },
      { id: 'L3.3', title: 'PTPTN: repayment & strategy' },
      { id: 'L3.4', title: 'Credit cards: how they really work' },
      { id: 'L3.5', title: 'Escaping credit-card debt' },
      { id: 'L3.6', title: 'Car loans: the true cost' },
      { id: 'L3.7', title: 'Home loans & mortgages: the basics' },
      { id: 'L3.8', title: 'Debt payoff: snowball vs avalanche' },
    ],
  },
  {
    slug: 'protect',
    code: 'M4',
    title: 'Protect What You Have',
    phase: 'Personal Finance',
    level: 'Intermediate',
    blurb: 'Insurance, takaful, and your estate.',
    lessons: [
      { id: 'L4.1', title: 'Why insurance/takaful exists (risk transfer)' },
      { id: 'L4.2', title: 'Insurance vs takaful (conventional vs shariah)' },
      { id: 'L4.3', title: 'Medical card & hospitalization cover' },
      { id: 'L4.4', title: 'Critical illness cover' },
      { id: 'L4.5', title: 'Life insurance: who actually needs it' },
      { id: 'L4.6', title: 'Term vs whole life ("buy term, invest the rest")' },
      { id: 'L4.7', title: 'How not to get oversold by an agent' },
      { id: 'L4.8', title: 'Wasiat, wills & faraid: what happens to your money' },
    ],
  },
  {
    slug: 'investing-foundations',
    code: 'M5',
    title: 'Investing Foundations',
    phase: 'Investment',
    level: 'Beginner → Intermediate',
    blurb: 'Principles before products.',
    lessons: [
      { id: 'L5.1', title: 'Why saving alone isn’t enough (inflation erodes cash)' },
      { id: 'L5.2', title: 'Compound interest & the power of time' },
      { id: 'L5.3', title: 'Risk vs return (no return without risk)' },
      { id: 'L5.4', title: 'The asymmetry of loss' },
      { id: 'L5.5', title: 'Asset classes 101 (cash, bonds, equities, property, gold)' },
      { id: 'L5.6', title: 'Diversification (don’t put all eggs in one basket)' },
      { id: 'L5.7', title: 'Active vs passive investing' },
      { id: 'L5.8', title: 'Your risk profile & time horizon' },
    ],
  },
  {
    slug: 'malaysian-vehicles',
    code: 'M6',
    title: 'Malaysian Investment Vehicles',
    phase: 'Investment',
    level: 'Intermediate',
    blurb: 'The local products.',
    lessons: [
      { id: 'L6.1', title: 'EPF as an investment (dividends, self-contribution, i-Invest)' },
      { id: 'L6.2', title: 'ASB / ASNB funds' },
      { id: 'L6.3', title: 'PRS (Private Retirement Scheme) & its tax relief' },
      { id: 'L6.4', title: 'Tabung Haji' },
      { id: 'L6.5', title: 'Fixed deposit & money-market funds' },
      { id: 'L6.6', title: 'Unit trusts (how they work, the fees)' },
      { id: 'L6.7', title: 'Robo-advisors (StashAway, Wahed, etc.)' },
      { id: 'L6.8', title: 'Bonds & sukuk (MGS, retail bonds)' },
    ],
  },
  {
    slug: 'investing-in-markets',
    code: 'M7',
    title: 'Investing in Markets',
    phase: 'Investment',
    level: 'Intermediate',
    blurb: 'Direct markets — including the S&P 500 question.',
    lessons: [
      { id: 'L7.1', title: 'How the stock market actually works' },
      { id: 'L7.2', title: 'Bursa Malaysia: opening a CDS & broker account' },
      { id: 'L7.3', title: 'Index funds & ETFs (incl. the S&P 500 question)' },
      { id: 'L7.4', title: 'Investing globally / US from Malaysia' },
      { id: 'L7.5', title: 'REITs (property income without buying property)' },
      { id: 'L7.6', title: 'How to read a financial statement' },
      { id: 'L7.7', title: 'Valuation basics (P/E, dividend yield)' },
      { id: 'L7.8', title: 'Crypto & DeFi: a sober look' },
      { id: 'L7.9', title: 'Avoiding scams & get-rich-quick schemes' },
    ],
  },
  {
    slug: 'optimize-plan',
    code: 'M8',
    title: 'Optimize & Plan Ahead',
    phase: 'Investment',
    level: 'Intermediate',
    blurb: 'Putting it all together.',
    lessons: [
      { id: 'L8.1', title: 'Tax reliefs & legal tax optimization (LHDN, 2026)' },
      { id: 'L8.2', title: 'Building your portfolio (asset allocation by life stage)' },
      { id: 'L8.3', title: 'Dollar-cost averaging & rebalancing' },
      { id: 'L8.4', title: 'Your retirement number (how much is enough)' },
      { id: 'L8.5', title: 'FIRE (financial independence) for Malaysians' },
      { id: 'L8.6', title: 'Putting it all together: your financial plan' },
    ],
  },
];

export const getModule = (slug: string) => LEARN_MODULES.find((m) => m.slug === slug);

export interface Phase {
  num: number;
  slug: string;
  name: string;   // must match LearnModule.phase
  blurb: string;
}

export const PHASES: Phase[] = [
  {
    num: 1,
    slug: 'personal-finance',
    name: 'Personal Finance',
    blurb: 'The foundations — know your money, spend & save smart, conquer debt, and protect what you have.',
  },
  {
    num: 2,
    slug: 'investment',
    name: 'Investment',
    blurb: 'Put money to work — principles, Malaysian vehicles, the markets, and pulling it into a real plan.',
  },
];

export const getPhase = (slug: string) => PHASES.find((p) => p.slug === slug);
export const modulesInPhase = (name: string) => LEARN_MODULES.filter((m) => m.phase === name);
export const phaseSlugForModule = (m: LearnModule) => PHASES.find((p) => p.name === m.phase)?.slug;
export const lessonCount = (mods: LearnModule[]) => mods.reduce((n, m) => n + m.lessons.length, 0);
