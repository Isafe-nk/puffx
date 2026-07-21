/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useDeferredValue } from "react";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldAlert,
  CreditCard,
  Info,
  ChevronRight,
  ChevronDown,
  Calculator,
  History,
  Plus,
  Trash2,
  X,
  Lock,
  Unlock,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle
} from "lucide-react";
import SliderInput from "../../../shared/components/SliderInput";
import Card from "../../../shared/components/Card";
import KpiCard from "../../../shared/components/KpiCard";
import { TimelineChart, AllocationPie } from "./components/Charts";
import { MonteCarloChart } from "./components/MonteCarloChart";
import { DebtVsInvestingLab } from "./components/DebtVsInvestingLab";
import { RiskProfile } from "./components/RiskProfile";
import { runDeterministicSimulation, getPortfolioStats, calculateMonthlyPayment, auditFinancialHealth, routeCashflow } from "./engine/finance";
import { runMonteCarlo } from "./engine/monteCarlo";
import { INITIAL_USER_INPUTS, DEFAULT_MARKET_ASSUMPTIONS } from "./constants";
import { UserInputs, DebtProfile, AssetAllocation, FinancialHealth } from "./engine/types";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { usePageTitle } from "../../../shared/hooks/usePageTitle";
import { formatRM } from "../../../shared/utils/format";

// Tab order drives the page-transition direction (left/right slide).
const TAB_IDS = ["timeline", "allocation", "risk", "debt"];

// Health-audit verdicts as words, not just colored dots (UX review D8).
const HealthBadge = ({ tone }: { tone: 'good' | 'warn' | 'bad' }) => {
  const cls =
    tone === 'good' ? 'bg-[#3E7355]/10 text-[#3E7355]' :
    tone === 'warn' ? 'bg-[#D99A2B]/10 text-[#D99A2B]' :
    'bg-[#3E7355]/10 text-[#3E7355]';
  const label = tone === 'good' ? 'On track' : tone === 'warn' ? 'Tight' : 'At risk';
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cls}`}>{label}</span>;
};

// Directional page slide: new page enters from the side you're navigating toward,
// old page exits the opposite way. Subtle offset so it reads as a page swipe.
const pageVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 28 : -28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -28 : 28, opacity: 0 }),
};

export default function App() {
  usePageTitle('Wealth Simulator');
  const [inputs, setInputs] = useState<UserInputs>(INITIAL_USER_INPUTS);
  const [lockedAssets, setLockedAssets] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"timeline" | "allocation" | "risk" | "debt">("timeline");
  const [showSidebar, setShowSidebar] = useState(true);
  // Only Life Parameters starts open — the full stack of sections at once is
  // overwhelming on a first visit (UX review D4).
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(['health', 'debt', 'allocation'])
  );
  const [tabDirection, setTabDirection] = useState(0);

  const selectTab = (id: string) => {
    setTabDirection(TAB_IDS.indexOf(id) >= TAB_IDS.indexOf(activeTab) ? 1 : -1);
    setActiveTab(id as any);
  };

  const toggleSection = (id: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(id)) newCollapsed.delete(id);
    else newCollapsed.add(id);
    setCollapsedSections(newCollapsed);
  };

  const updateDebt = (index: number, updates: Partial<DebtProfile>) => {
    const newDebts = [...inputs.debts];
    if (newDebts[index]) {
      const updatedDebt = { ...newDebts[index], ...updates };
      // Recalculate monthly payment
      updatedDebt.monthlyPayment = calculateMonthlyPayment(
        updatedDebt.principal,
        updatedDebt.interestRate,
        updatedDebt.termYears
      );
      newDebts[index] = updatedDebt;
      setInputs({ ...inputs, debts: newDebts });
    }
  };

  const addDebt = () => {
    const newDebt: DebtProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Debt",
      principal: 10000,
      interestRate: 0.05,
      termYears: 5,
      monthlyPayment: calculateMonthlyPayment(10000, 0.05, 5)
    };
    setInputs({ ...inputs, debts: [...inputs.debts, newDebt] });
  };

  const removeDebt = (index: number) => {
    const newDebts = inputs.debts.filter((_, i) => i !== index);
    setInputs({ ...inputs, debts: newDebts });
  };

  const deterministicData = useMemo(() => {
    return runDeterministicSimulation(inputs, DEFAULT_MARKET_ASSUMPTIONS);
  }, [inputs]);

  // The 1000-path Monte Carlo is the one expensive computation — run it on a
  // deferred copy of the inputs so slider drags stay responsive; while the
  // deferred value lags, the Risk tab shows a "Recalculating" hint.
  const deferredInputs = useDeferredValue(inputs);
  const mcResult = useMemo(() => {
    return runMonteCarlo(deferredInputs, DEFAULT_MARKET_ASSUMPTIONS, 1000);
  }, [deferredInputs]);
  const mcRecalculating = deferredInputs !== inputs;

  const portfolioStats = useMemo(() => {
    return getPortfolioStats(inputs.allocation, DEFAULT_MARKET_ASSUMPTIONS);
  }, [inputs.allocation]);

  const healthAudit = useMemo(() => {
    return auditFinancialHealth(inputs);
  }, [inputs]);

  const formatCurrency = formatRM;

  const finalNetWorth = deterministicData[deterministicData.length - 1]?.netWorth || 0;
  const finalInflationAdjusted = deterministicData[deterministicData.length - 1]?.inflationAdjustedNetWorth || 0;

  return (
    <MotionConfig reducedMotion="user">
    <div className="w-full bg-[#F6F4EC]">
      {/* Top Premium Status Navigation */}
      <header className="border-b border-[#DCE0D2] bg-white/75 backdrop-blur-xl backdrop-saturate-150 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 font-display">
            <TrendingUp size={20} className="text-[#3E7355]" /> 
            Wealth Simulator
          </h2>
          <div className="flex items-center gap-6 text-sm font-medium text-[#75806F]">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] text-[#9AA394] uppercase tracking-wider font-bold">Projected Net Worth</span>
              <span className="text-[#243129] font-mono font-bold text-base">{formatCurrency(finalNetWorth)}</span>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label={showSidebar ? 'Hide input panel' : 'Show input panel'}
              aria-expanded={showSidebar}
              className={`p-1.5 rounded-lg transition-all active:scale-90 flex items-center gap-2 border ${showSidebar
                ? "bg-white border-[#DCE0D2] text-[#75806F] hover:text-[#243129] hover:border-[#C7CDBB]"
                : "bg-[#3E7355] border-[#3E7355] text-white hover:bg-[#325E45]"
                }`}
            >
              {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/*
        On desktop the two columns are independent scroll panes (the page itself does not
        scroll): the parameter sidebar scrolls on its own while the results panel stays put,
        so adjusting an input always keeps the chart in view. The 120px subtracted from the
        pane height accounts for the fixed chrome above the grid (just this page's own header
        ~70px, now that tool switching moved to the SideNav) plus the grid's vertical padding
        (~48px). Mobile keeps natural stacking.
      */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Inputs */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:col-span-4 pr-2 max-lg:pb-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto scrollbar-thin"
            >
              {/* top veil — content fades into the page background instead of a hard cut */}
              <div className="hidden lg:block sticky top-0 z-10 h-24 -mb-24 pointer-events-none bg-gradient-to-b from-[#F6F4EC] to-transparent" />
              <div className="space-y-6">
              <p className="text-[11px] text-[#75806F] leading-relaxed px-1">
                Start with your life parameters — everything on the right updates as you go. Open the other sections when you're ready.
              </p>
              <div className="bg-white border border-[#DCE0D2] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('life')}
                  aria-expanded={!collapsedSections.has('life')}
                  aria-controls="section-life"
                  className="w-full p-6 flex items-center justify-between text-[#4A544C] hover:text-[#243129] transition-colors"
                >
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                    <Calculator size={16} /> Life Parameters
                  </h2>
                  {collapsedSections.has('life') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {!collapsedSections.has('life') && (
                    <motion.div
                      id="section-life"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 space-y-4"
                    >

                      <SliderInput
                        label="Current Age"
                        value={inputs.currentAge}
                        min={18} max={60}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, currentAge: v })}
                      />
                      <SliderInput
                        label="Retirement Age"
                        value={inputs.retirementAge}
                        min={inputs.currentAge + 1} max={80}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, retirementAge: v })}
                      />
                      <SliderInput
                        label="Monthly Salary"
                        value={inputs.monthlySalary}
                        min={2000} max={30000} step={100}
                        format={formatCurrency}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, monthlySalary: v })}
                        subLabel={`(${formatCurrency(inputs.monthlySalary * 12)}/yr)`}
                        tooltip="Your gross monthly income before taxes."
                      />
                      <SliderInput
                        label="Savings Rate"
                        value={inputs.savingsRate * 100}
                        min={0} max={70}
                        format={(v) => `${Math.round(v)}%`}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => {
                          const newRate = v / 100;
                          // Ensure contribution doesn't exceed new savings
                          const newContribution = Math.min(inputs.monthlyContribution, inputs.monthlySalary * newRate);
                          setInputs({ ...inputs, savingsRate: newRate, monthlyContribution: newContribution });
                        }}
                        subLabel={`(${formatCurrency(inputs.monthlySalary * inputs.savingsRate)}/mo saved)`}
                        tooltip="Percentage of income you do not spend. Sets your lifestyle and retirement goal."
                      />
                      <SliderInput
                        label="Investment Contribution"
                        value={inputs.monthlyContribution}
                        min={0} max={inputs.monthlySalary * inputs.savingsRate} step={50}
                        format={formatCurrency}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, monthlyContribution: v })}
                        tooltip="The exact amount deployed into your portfolio each month."
                      />

                      {(() => {
                        const totalDebtPayments = inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
                        const { bufferContribution, discretionarySpend, bufferTarget } = routeCashflow({
                          monthlySalary: inputs.monthlySalary,
                          savingsRate: inputs.savingsRate,
                          monthlyContribution: inputs.monthlyContribution,
                          activeMonthlyDebtPayments: totalDebtPayments,
                          currentCashBalance: inputs.initialCash,
                          bufferTargetMonths: inputs.emergencyFundTargetMonths,
                        });
                        const toBufferMo = bufferContribution / 12;
                        const leakMo = discretionarySpend / 12;
                        if (toBufferMo + leakMo <= 0.005) return null;
                        const filling = toBufferMo > 0.005;
                        const leaking = leakMo > 0.005;
                        return (
                          <div className="p-3 bg-[#4E7A96]/5 rounded-lg border border-[#4E7A96]/15 space-y-1.5 mb-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-[#4E7A96] uppercase font-semibold">Uninvested Cash Flow</span>
                              <span className="text-sm font-mono text-[#4E7A96] font-bold">{formatCurrency(toBufferMo + leakMo)}/mo</span>
                            </div>
                            {filling && (
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-[#75806F]">↳ Filling cash buffer</span>
                                <span className="font-mono text-[#4E7A96]">{formatCurrency(toBufferMo)}/mo</span>
                              </div>
                            )}
                            {leaking && (
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-[#75806F]">↳ Discretionary / lifestyle spend</span>
                                <span className="font-mono text-[#D99A2B]">{formatCurrency(leakMo)}/mo</span>
                              </div>
                            )}
                            <p className="text-[10px] text-[#9AA394] italic leading-relaxed pt-0.5">
                              {leaking && !filling
                                ? `Buffer is at its ${inputs.emergencyFundTargetMonths}-month target (${formatCurrency(bufferTarget)}). Surplus is spent, not hoarded.`
                                : `Cash tops up toward a ${inputs.emergencyFundTargetMonths}-month buffer (${formatCurrency(bufferTarget)}); any excess is spent.`}
                            </p>
                          </div>
                        );
                      })()}

                      {inputs.savingsRate === 0 && (
                        <div className="p-3 bg-[#D99A2B]/5 rounded-lg border border-[#D99A2B]/15 flex items-start gap-2">
                          <AlertTriangle size={14} className="text-[#D99A2B] mt-0.5 shrink-0" />
                          <span className="text-[11px] text-[#D99A2B] leading-relaxed">
                            Savings rate is 0% — no contributions will be made to your portfolio or cash buffer, regardless of your contribution setting.
                          </span>
                        </div>
                      )}

                      {(() => {
                        const totalDebtPayments = inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
                        const lifestyleBudget = inputs.monthlySalary * (1 - inputs.savingsRate);
                        const debtOverflow = Math.max(0, totalDebtPayments - lifestyleBudget);
                        return debtOverflow > 0 ? (
                          <div className="p-3 bg-[#3E7355]/5 rounded-lg border border-[#3E7355]/15 flex items-start gap-2">
                            <AlertTriangle size={14} className="text-[#3E7355] mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[11px] text-[#3E7355] font-semibold leading-relaxed">
                                Debt overflow: {formatCurrency(debtOverflow)}/mo eating into savings
                              </span>
                              <span className="text-[10px] text-[#3E7355]/70 leading-relaxed mt-0.5">
                                Your debt payments ({formatCurrency(totalDebtPayments)}/mo) exceed your lifestyle budget ({formatCurrency(lifestyleBudget)}/mo). The excess reduces your effective savings.
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })()}

                      <div className="p-3 bg-[#F6F4EC] rounded-lg border border-[#DCE0D2] flex justify-between items-center mb-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#9AA394] uppercase font-semibold">Monthly Expenses</span>
                          <span className="text-[11px] text-[#75806F] italic leading-none mt-0.5">
                            {inputs.debts.length > 0 ? 'Lifestyle + Debt payments' : 'Derived from savings'}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-[#D99A2B] font-bold">
                          {formatCurrency(inputs.monthlySalary * (1 - inputs.savingsRate) + inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0))}
                        </span>
                      </div>

                      <SliderInput
                        label="Initial Portfolio"
                        value={inputs.initialSavings}
                        min={0} max={500000} step={1000}
                        format={formatCurrency}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, initialSavings: v })}
                      />
                      <SliderInput
                        label="Initial Cash Buffer"
                        value={inputs.initialCash}
                        min={0} max={200000} step={1000}
                        format={formatCurrency}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, initialCash: v })}
                      />
                      <SliderInput
                        label="Emergency Fund Target"
                        value={inputs.emergencyFundTargetMonths}
                        min={3} max={12} step={1}
                        format={(v) => `${v} Months`}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, emergencyFundTargetMonths: v })}
                        subLabel={`(${formatCurrency((inputs.monthlySalary * (1 - inputs.savingsRate) + inputs.debts.reduce((s, d) => s + d.monthlyPayment, 0)) * inputs.emergencyFundTargetMonths)} target)`}
                        tooltip="Cash buffer target, in months of essential expenses (lifestyle + debt). Savings top up to this level; any surplus is spent, not hoarded or invested."
                      />
                      <SliderInput
                        label="Salary Growth"
                        value={inputs.salaryGrowth * 100}
                        min={0} max={10} step={0.1}
                        format={(v) => `${v}%`}
                        layout="inline"
                        inputWidth={90}
                        labelWidth={150}
                        onChange={(v) => setInputs({ ...inputs, salaryGrowth: v / 100 })}
                      />

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Financial Health Audit */}
              <div className="bg-white border border-[#DCE0D2] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('health')}
                  aria-expanded={!collapsedSections.has('health')}
                  aria-controls="section-health"
                  className="w-full p-6 flex items-center justify-between text-[#4A544C] hover:text-[#243129] transition-colors"
                >
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck size={16} className="text-[#3E7355]" /> Financial Health Audit
                  </h2>
                  {collapsedSections.has('health') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {!collapsedSections.has('health') && (
                    <motion.div
                      id="section-health"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#9AA394]">Emergency Fund</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${healthAudit.emergencyFundStatus === 'good' ? 'text-[#3E7355]' : healthAudit.emergencyFundStatus === 'warning' ? 'text-[#D99A2B]' : 'text-[#3E7355]'}`}>
                              {healthAudit.emergencyFundMonths.toFixed(1)} Months
                            </span>
                            <HealthBadge tone={healthAudit.emergencyFundStatus === 'good' ? 'good' : healthAudit.emergencyFundStatus === 'warning' ? 'warn' : 'bad'} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#9AA394]">Debt-to-Income (DTI)</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${healthAudit.debtToIncomeStatus === 'high' ? 'text-[#3E7355]' : healthAudit.debtToIncomeStatus === 'caution' ? 'text-[#D99A2B]' : 'text-[#3E7355]'}`}>
                              {(healthAudit.debtToIncomeRatio * 100).toFixed(1)}%
                            </span>
                            <HealthBadge tone={healthAudit.debtToIncomeStatus === 'high' ? 'bad' : healthAudit.debtToIncomeStatus === 'caution' ? 'warn' : 'good'} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#9AA394]">Savings Rate</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${healthAudit.savingsRateStatus === 'aggressive' ? 'text-[#3E7355]' : healthAudit.savingsRateStatus === 'healthy' ? 'text-[#3E7355]/70' : 'text-[#D99A2B]'}`}>
                              {healthAudit.savingsRateStatus.toUpperCase()}
                            </span>
                            <HealthBadge tone={healthAudit.savingsRateStatus === 'low' ? 'warn' : 'good'} />
                          </div>
                        </div>
                      </div>
                      {healthAudit.emergencyFundStatus !== 'good' && (
                        <div className="mt-4 p-3 bg-[#3E7355]/5 border border-[#3E7355]/15 rounded-lg">
                          <p className="text-[10px] text-[#3E7355] leading-relaxed">
                            Professional Tip: Prioritize building a 6-month emergency fund before aggressive investing.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-white border border-[#DCE0D2] rounded-lg overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <button
                    onClick={() => toggleSection('debt')}
                    aria-expanded={!collapsedSections.has('debt')}
                    aria-controls="section-debt"
                    className="flex-1 flex items-center justify-between text-[#4A544C] hover:text-[#243129] transition-colors text-left"
                  >
                    <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                      <CreditCard size={16} /> Debt Profile
                    </h2>
                    {collapsedSections.has('debt') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {!collapsedSections.has('debt') && (
                    <button
                      onClick={addDebt}
                      className="ml-4 p-1.5 bg-[#3E7355]/10 text-[#3E7355] rounded-lg hover:bg-[#3E7355]/20 active:scale-90 transition duration-200"
                      title="Add Debt"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {!collapsedSections.has('debt') && (
                    <motion.div
                      id="section-debt"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 space-y-6"
                    >
                      {inputs.debts.length === 0 && (
                        <p className="text-xs text-[#9AA394] italic text-center py-4">No active debts. Great job!</p>
                      )}
                      {inputs.debts.map((debt, idx) => (
                        <div key={debt.id} className="p-4 bg-[#F6F4EC] rounded-lg border border-[#DCE0D2] relative group flex flex-col gap-3">
                          <button
                            onClick={() => removeDebt(idx)}
                            aria-label="Remove debt"
                            className="absolute top-2 right-2 p-1 text-[#9AA394] hover:text-[#3E7355] focus-visible:text-[#3E7355] active:scale-90 transition-all z-10"
                          >
                            <Trash2 size={14} />
                          </button>

                          <input
                            type="text"
                            value={debt.name}
                            onChange={(e) => updateDebt(idx, { name: e.target.value })}
                            className="bg-transparent border-none text-sm font-bold text-[#243129] focus:ring-0 p-0 w-full"
                            placeholder="Debt Name"
                          />

                          <SliderInput
                            label="Principal"
                            value={debt.principal}
                            min={0} max={200000} step={1000}
                            format={formatCurrency}
                            layout="inline"
                            labelWidth={100}
                            inputWidth={90}
                            onChange={(v) => updateDebt(idx, { principal: v })}
                          />
                          <SliderInput
                            label="Interest Rate"
                            value={debt.interestRate * 100}
                            min={0} max={20} step={0.1}
                            format={(v) => `${v}%`}
                            layout="inline"
                            labelWidth={100}
                            inputWidth={90}
                            onChange={(v) => updateDebt(idx, { interestRate: v / 100 })}
                          />
                          <SliderInput
                            label="Term"
                            value={debt.termYears}
                            min={1} max={35} step={1}
                            format={(v) => `${v} Years`}
                            layout="inline"
                            labelWidth={100}
                            inputWidth={90}
                            onChange={(v) => updateDebt(idx, { termYears: v })}
                          />

                          <div className="pt-2 border-t border-[#DCE0D2] flex justify-between items-center">
                            <span className="text-[10px] text-[#9AA394] uppercase">Monthly Payment</span>
                            <span className="text-xs font-mono text-[#3E7355]">{formatCurrency(debt.monthlyPayment)}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-white border border-[#DCE0D2] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('allocation')}
                  aria-expanded={!collapsedSections.has('allocation')}
                  aria-controls="section-allocation"
                  className="w-full p-6 flex items-center justify-between text-[#4A544C] hover:text-[#243129] transition-colors"
                >
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                    <PieChartIcon size={16} /> Asset Allocation
                  </h2>
                  {collapsedSections.has('allocation') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {!collapsedSections.has('allocation') && (
                    <motion.div
                      id="section-allocation"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      {[
                        { key: 'equity', label: 'Equity (Stocks)', color: 'bg-[#3E7355]' },
                        { key: 'fixedIncome', label: 'Fixed Income (Bonds/Funds)', color: 'bg-[#4E7A96]' },
                        { key: 'realEstate', label: 'Real Estate (REITs)', color: 'bg-[#243129]' },
                        { key: 'gold', label: 'Gold/Alternatives', color: 'bg-[#D99A2B]' },
                      ].map((asset) => (
                        <div key={asset.key} className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-[#9AA394] uppercase tracking-wider font-semibold">{asset.label}</label>
                            <button
                              onClick={() => {
                                const newLocked = new Set(lockedAssets);
                                if (newLocked.has(asset.key)) newLocked.delete(asset.key);
                                else newLocked.add(asset.key);
                                setLockedAssets(newLocked);
                              }}
                              className={`p-1 rounded active:scale-90 transition duration-200 ${lockedAssets.has(asset.key) ? 'text-[#3E7355] bg-[#3E7355]/10' : 'text-[#75806F] hover:text-[#75806F]'}`}
                              title={lockedAssets.has(asset.key) ? "Unlock asset" : "Lock asset"}
                            >
                              {lockedAssets.has(asset.key) ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>
                          </div>
                          <SliderInput
                            label=""
                            value={inputs.allocation[asset.key as keyof AssetAllocation] * 100}
                            min={0} max={100}
                            format={(v) => `${v.toFixed(0)}%`}
                            onChange={(v) => {
                              const newValue = v / 100;
                              const currentKey = asset.key as keyof AssetAllocation;
                              const oldAllocation = { ...inputs.allocation };

                              const newAllocation = { ...oldAllocation };
                              newAllocation[currentKey] = newValue;

                              const otherKeys = Object.keys(oldAllocation).filter(k => k !== currentKey) as (keyof AssetAllocation)[];
                              const unlockedOtherKeys = otherKeys.filter(k => !lockedAssets.has(k));

                              if (unlockedOtherKeys.length === 0) return; // Can't adjust if all others are locked

                              const totalOtherUnlockedOld = unlockedOtherKeys.reduce((sum, k) => sum + oldAllocation[k], 0);
                              const totalOtherLocked = otherKeys.filter(k => lockedAssets.has(k)).reduce((sum, k) => sum + oldAllocation[k], 0);

                              const targetUnlockedTotal = 1 - newValue - totalOtherLocked;

                              if (targetUnlockedTotal < 0) {
                                newAllocation[currentKey] = 1 - totalOtherLocked;
                                unlockedOtherKeys.forEach(k => newAllocation[k] = 0);
                              } else if (totalOtherUnlockedOld > 0) {
                                const ratio = targetUnlockedTotal / totalOtherUnlockedOld;
                                unlockedOtherKeys.forEach(k => {
                                  newAllocation[k] = oldAllocation[k] * ratio;
                                });
                              } else {
                                unlockedOtherKeys.forEach(k => {
                                  newAllocation[k] = targetUnlockedTotal / unlockedOtherKeys.length;
                                });
                              }

                              setInputs({ ...inputs, allocation: newAllocation });
                            }}
                          />
                        </div>
                      ))}

                      {(() => {
                        const totalPct = Object.values(inputs.allocation).reduce((s, v) => s + v, 0) * 100;
                        const balanced = Math.abs(totalPct - 100) < 0.5;
                        return (
                          <div className="flex justify-between items-center pt-3 border-t border-[#DCE0D2] text-xs">
                            <span className="text-[#75806F] font-semibold">Total Allocation</span>
                            <span className={`font-mono font-bold ${balanced ? 'text-[#3E7355]' : 'text-[#3E7355]'}`}>
                              {totalPct.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })()}

                      <div className="mt-6 p-4 bg-[#F6F4EC] rounded-lg border border-[#DCE0D2]">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-[#9AA394]">Expected Portfolio Return</span>
                          <span className="text-[#3E7355] font-mono">{(portfolioStats.expectedReturn * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#9AA394]">Portfolio Volatility</span>
                          <span className="text-[#D99A2B] font-mono">{(portfolioStats.volatility * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 bg-[#3E7355]/5 border border-[#3E7355]/15 rounded-lg">
                <p className="text-[10px] text-[#3E7355]/60 leading-relaxed uppercase tracking-tighter">
                  Disclaimer: This is a purely educational simulation. Past performance does not guarantee future results.
                  Not financial advice.
                </p>
              </div>
              </div>
              {/* bottom veil */}
              <div className="hidden lg:block sticky bottom-0 z-10 h-24 -mt-24 pointer-events-none bg-gradient-to-t from-[#F6F4EC] to-transparent" />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area — own scroll pane; the glass bar is sticky so the content
            scrolls underneath and refracts through it (native iOS liquid-glass behaviour) */}
        <section className={`${showSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} lg:h-[calc(100vh-120px)] lg:overflow-y-auto scrollbar-thin transition-all duration-300`}>
          {/* top veil — fades content into the background behind the floating glass bar */}
          <div className="hidden lg:block sticky top-0 z-10 h-24 -mb-24 pointer-events-none bg-gradient-to-b from-[#F6F4EC] to-transparent" />
          {/* Tabs — static frosted-glass bar (iOS Liquid Glass): it does not move or
              animate; the "liquid" effect is the content heavily blurred + saturated as it
              scrolls beneath it. Sticky so content passes under it. */}
          <div className="lg:sticky lg:top-0 z-20 mx-auto flex w-fit gap-1 p-1.5 rounded-full bg-surface border border-[#DCE0D2]">
            {[
              { id: "timeline", label: "Timeline", icon: History },
              { id: "allocation", label: "Allocation Lab", icon: PieChartIcon },
              { id: "risk", label: "Risk Reality", icon: ShieldAlert },
              { id: "debt", label: "Debt vs Invest", icon: CreditCard },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`relative flex items-center justify-center gap-2 py-2.5 px-5 rounded-full text-sm font-medium transition-colors duration-200 ${isActive
                    ? "text-[#3E7355] font-semibold"
                    : "text-[#9AA394] hover:text-[#4A544C]"
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tabGlass"
                      className="absolute inset-0 rounded-full bg-white border border-[#3E7355]/25"
                      transition={{ type: "spring", stiffness: 280, damping: 24 }}
                    />
                  )}
                  <tab.icon size={16} className="relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Tab Content — scrolls underneath the sticky glass bar; slides directionally on switch */}
          <div className="mt-6 pr-1 pb-2 overflow-x-clip relative">
          <AnimatePresence mode="popLayout" custom={tabDirection}>
            <motion.div
              key={activeTab}
              custom={tabDirection}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              {activeTab === "timeline" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#DCE0D2] p-6 rounded-lg">
                      <p className="text-xs text-[#9AA394] uppercase mb-1">Retirement Age</p>
                      <p className="text-2xl font-bold">{inputs.retirementAge}</p>
                    </div>
                    <div className="bg-white border border-[#DCE0D2] p-6 rounded-lg">
                      <p className="text-xs text-[#9AA394] uppercase mb-1">Inflation Adjusted</p>
                      <p className="text-2xl font-bold text-[#4E7A96]">{formatCurrency(finalInflationAdjusted)}</p>
                    </div>
                    <div className="bg-white border border-[#DCE0D2] p-6 rounded-lg">
                      <p className="text-xs text-[#9AA394] uppercase mb-1">Success Prob.</p>
                      <p className="text-2xl font-bold text-[#3E7355]">{(mcResult.successProbability * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {inputs.debts.length > 0 && (
                    <div className="bg-[#3E7355]/5 border border-[#3E7355]/15 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-3 border-b border-[#3E7355]/15 pb-2">
                        <CreditCard className="text-[#3E7355]" size={20} />
                        <h4 className="text-sm font-semibold text-[#3E7355]">Debt Projection</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inputs.debts.map((debt) => {
                          const payoffAge = inputs.currentAge + debt.termYears;
                          const carriesIntoRetirement = payoffAge > inputs.retirementAge;
                          return (
                            <div key={debt.id} className="flex justify-between items-center bg-white/50 p-2.5 rounded-lg border border-[#3E7355]/10">
                              <div>
                                <p className="text-xs font-medium text-[#4A544C] flex items-center gap-2">
                                  {debt.name}
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${carriesIntoRetirement ? 'bg-[#3E7355]/10 text-[#3E7355]' : 'bg-[#3E7355]/10 text-[#3E7355]'}`}>
                                    Settles Age {payoffAge}
                                  </span>
                                </p>
                                <p className="text-[10px] text-[#9AA394] mt-0.5">
                                  {formatCurrency(debt.principal)} @ {(debt.interestRate * 100).toFixed(1)}% for {debt.termYears}y
                                </p>
                              </div>
                              <div className="text-right flex flex-col justify-center">
                                <p className="text-xs font-mono font-bold text-[#3E7355]">{formatCurrency(debt.monthlyPayment)}<span className="text-[10px] font-normal text-[#9AA394]">/mo</span></p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-2 border-t border-[#3E7355]/15 flex justify-between items-center">
                        <span className="text-[10px] text-[#3E7355]/70 uppercase font-bold tracking-wider">Initial Monthly Commitment</span>
                        <span className="text-sm font-mono font-bold text-[#3E7355]">
                          {formatCurrency(inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0))}
                        </span>
                      </div>
                    </div>
                  )}

                  <TimelineChart data={deterministicData} />
                  <div className="bg-white border border-[#DCE0D2] p-6 rounded-lg flex items-start gap-4">
                    <div className="p-2 bg-[#4E7A96]/10 rounded-lg">
                      <Info className="text-[#4E7A96]" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Understanding the Curve</h3>
                      <p className="text-sm text-[#75806F] leading-relaxed">
                        The solid green area represents your nominal net worth. The dashed blue line shows your
                        <span className="text-[#4E7A96] font-medium"> inflation-adjusted</span> net worth,
                        representing today's purchasing power. Notice how compounding accelerates in the final 15 years.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "allocation" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-4 bg-white border border-[#DCE0D2] p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-4 text-[#243129]">Portfolio Composition</h3>
                    <AllocationPie allocation={inputs.allocation} />
                    <div className="space-y-3 mt-4">
                      {[
                        { key: 'equity', label: 'Equity', color: 'bg-[#3E7355]' },
                        { key: 'fixedIncome', label: 'Fixed Income', color: 'bg-[#4E7A96]' },
                        { key: 'realEstate', label: 'Real Estate', color: 'bg-[#243129]' },
                        { key: 'gold', label: 'Gold', color: 'bg-[#D99A2B]' },
                      ].map((asset) => (
                        <div key={asset.key} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${asset.color}`} />
                            <span className="text-sm text-[#4A544C]">{asset.label}</span>
                          </div>
                          <span className="text-sm font-mono text-[#243129]">{(inputs.allocation[asset.key as keyof AssetAllocation] * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="xl:col-span-8 bg-white border border-[#DCE0D2] p-6 rounded-lg space-y-6">
                    <h3 className="text-lg font-bold text-[#243129]">Risk/Return Profile</h3>
                    <RiskProfile stats={portfolioStats} allocation={inputs.allocation} />
                  </div>
                </div>
              )}

              {activeTab === "risk" && (
                <div className="space-y-6">
                  <div className="bg-white border border-[#DCE0D2] p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          Monte Carlo Simulation
                          {mcRecalculating && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#75806F] bg-[#F6F4EC] border border-[#DCE0D2] rounded-full px-2 py-0.5 animate-pulse">
                              Recalculating
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-[#9AA394]">1,000 randomized market paths based on current allocation.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#9AA394] uppercase">Retirement Success</p>
                        <p className={`text-2xl font-bold ${mcResult.successProbability > 0.8 ? 'text-[#3E7355]' : mcResult.successProbability > 0.5 ? 'text-[#D99A2B]' : 'text-[#3E7355]'}`}>
                          {(mcResult.successProbability * 100).toFixed(0)}%
                        </p>
                        <p className="text-[11px] text-[#75806F]">
                          Out of 1,000 simulated futures, you reached your goal in {Math.round(mcResult.successProbability * 1000).toLocaleString()}.
                        </p>
                      </div>
                    </div>
                    <div className={mcRecalculating ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                      <MonteCarloChart result={mcResult} currentAge={inputs.currentAge} />
                    </div>
                    <div className="mt-4 p-4 bg-[#F6F4EC] rounded-lg border border-[#DCE0D2]">
                      <p className="text-xs text-[#75806F] leading-relaxed">
                        <span className="text-[#3E7355] font-semibold">Success Definition:</span> We define success as reaching a net worth of at least <span className="text-[#243129] font-mono font-bold">25x your final annual expenses</span> at the point of retirement.
                        This is based on the "4% Rule," which suggests you can safely withdraw 4% of your nest egg annually to sustain your lifestyle.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border border-[#DCE0D2] p-6 rounded-lg space-y-4">
                    <h4 className="text-sm font-semibold text-[#243129]">Understanding the "Spaghetti" Chart</h4>
                    <p className="text-sm text-[#75806F] leading-relaxed">
                      The thin lines represent 50 individual market paths. Even with the same strategy,
                      market luck (sequence of returns) can lead to vastly different outcomes.
                      A <span className="text-[#3E7355]">90% success rate</span> means that in 900 out of 1,000 simulated universes,
                      you reached your retirement goal.
                    </p>
                  </div>
                  <div className="bg-[#3E7355]/5 border border-[#3E7355]/15 p-6 rounded-lg flex items-start gap-4">
                    <ShieldAlert className="text-[#3E7355] shrink-0" size={24} />
                    <div>
                      <h4 className="text-sm font-semibold text-[#3E7355] mb-1">Sequence of Returns Risk</h4>
                      <p className="text-sm text-[#75806F] leading-relaxed">
                        The red line represents the bottom 10% of outcomes. Even with a high "average" return, a market crash
                        early in your journey can significantly derail long-term results. This is why diversification is
                        critical as you approach retirement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "debt" && (
                <DebtVsInvestingLab />
              )}
            </motion.div>
          </AnimatePresence>
          </div>
          {/* bottom veil — content fades into the page background at the pane's bottom edge */}
          <div className="hidden lg:block sticky bottom-0 z-10 h-24 -mt-24 pointer-events-none bg-gradient-to-t from-[#F6F4EC] to-transparent" />
        </section>
      </main>
    </div>
    </MotionConfig>
  );
}
