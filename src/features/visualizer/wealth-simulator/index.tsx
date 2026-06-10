/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
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
  PanelLeftOpen
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

export default function App() {
  const [inputs, setInputs] = useState<UserInputs>(INITIAL_USER_INPUTS);
  const [lockedAssets, setLockedAssets] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"timeline" | "allocation" | "risk" | "debt">("timeline");
  const [showSidebar, setShowSidebar] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

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

  const mcResult = useMemo(() => {
    return runMonteCarlo(inputs, DEFAULT_MARKET_ASSUMPTIONS, 1000);
  }, [inputs]);

  const portfolioStats = useMemo(() => {
    return getPortfolioStats(inputs.allocation, DEFAULT_MARKET_ASSUMPTIONS);
  }, [inputs.allocation]);

  const healthAudit = useMemo(() => {
    return auditFinancialHealth(inputs);
  }, [inputs]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-MS", { style: "currency", currency: "MYR", maximumFractionDigits: 0 }).format(v);

  const finalNetWorth = deterministicData[deterministicData.length - 1]?.netWorth || 0;
  const finalInflationAdjusted = deterministicData[deterministicData.length - 1]?.inflationAdjustedNetWorth || 0;

  return (
    <MotionConfig reducedMotion="user">
    {/* page-aurora: soft brand-tinted backdrop the glass surfaces refract against */}
    <div className="w-full page-aurora min-h-screen">
      {/* Top Premium Status Navigation */}
      <header className="border-b border-[#E6E6E6] bg-white/75 backdrop-blur-xl backdrop-saturate-150 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 font-display">
            <TrendingUp size={20} className="text-[#D91222]" /> 
            Wealth Simulator
          </h2>
          <div className="flex items-center gap-6 text-sm font-medium text-[#727579]">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] text-[#A2A3A5] uppercase tracking-wider font-bold">Projected Net Worth</span>
              <span className="text-[#212121] font-mono font-bold text-base">{formatCurrency(finalNetWorth)}</span>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-2 border ${showSidebar
                ? "bg-white border-[#E6E6E6] text-[#727579] hover:text-[#212121] hover:border-[#D0D1D2] shadow-sm"
                : "bg-[#D91222] border-[#D91222] text-white hover:bg-[#C01A2F] shadow-sm"
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
        so adjusting an input always keeps the chart in view. The 210px subtracted from the
        pane height accounts for the fixed chrome above the grid (visualizer nav + page header
        ~158px) plus the grid's vertical padding (~48px). Mobile keeps natural stacking.
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
              className="lg:col-span-4 pr-2 pb-4 space-y-6 lg:h-[calc(100vh-210px)] lg:overflow-y-auto scrollbar-thin"
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('life')}
                  className="w-full p-6 flex items-center justify-between text-[#44474D] hover:text-[#212121] transition-colors"
                >
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                    <Calculator size={16} /> Life Parameters
                  </h2>
                  {collapsedSections.has('life') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {!collapsedSections.has('life') && (
                    <motion.div
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
                          <div className="p-3 bg-[#307EF2]/5 rounded-xl border border-[#307EF2]/15 space-y-1.5 mb-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-[#307EF2] uppercase font-semibold">Uninvested Cash Flow</span>
                              <span className="text-sm font-mono text-[#307EF2] font-bold">{formatCurrency(toBufferMo + leakMo)}/mo</span>
                            </div>
                            {filling && (
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-[#727579]">↳ Filling cash buffer</span>
                                <span className="font-mono text-[#307EF2]">{formatCurrency(toBufferMo)}/mo</span>
                              </div>
                            )}
                            {leaking && (
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-[#727579]">↳ Discretionary / lifestyle spend</span>
                                <span className="font-mono text-[#FFB300]">{formatCurrency(leakMo)}/mo</span>
                              </div>
                            )}
                            <p className="text-[10px] text-[#A2A3A5] italic leading-relaxed pt-0.5">
                              {leaking && !filling
                                ? `Buffer is at its ${inputs.emergencyFundTargetMonths}-month target (${formatCurrency(bufferTarget)}). Surplus is spent, not hoarded.`
                                : `Cash tops up toward a ${inputs.emergencyFundTargetMonths}-month buffer (${formatCurrency(bufferTarget)}); any excess is spent.`}
                            </p>
                          </div>
                        );
                      })()}

                      {inputs.savingsRate === 0 && (
                        <div className="p-3 bg-[#FFB300]/5 rounded-xl border border-[#FFB300]/15 flex items-start gap-2">
                          <span className="text-[#FFB300] text-sm mt-0.5">⚠️</span>
                          <span className="text-[11px] text-[#FFB300] leading-relaxed">
                            Savings rate is 0% — no contributions will be made to your portfolio or cash buffer, regardless of your contribution setting.
                          </span>
                        </div>
                      )}

                      {(() => {
                        const totalDebtPayments = inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
                        const lifestyleBudget = inputs.monthlySalary * (1 - inputs.savingsRate);
                        const debtOverflow = Math.max(0, totalDebtPayments - lifestyleBudget);
                        return debtOverflow > 0 ? (
                          <div className="p-3 bg-[#D91222]/5 rounded-xl border border-[#D91222]/15 flex items-start gap-2">
                            <span className="text-[#D91222] text-sm mt-0.5">⚠️</span>
                            <div className="flex flex-col">
                              <span className="text-[11px] text-[#D91222] font-semibold leading-relaxed">
                                Debt overflow: {formatCurrency(debtOverflow)}/mo eating into savings
                              </span>
                              <span className="text-[10px] text-[#D91222]/70 leading-relaxed mt-0.5">
                                Your debt payments ({formatCurrency(totalDebtPayments)}/mo) exceed your lifestyle budget ({formatCurrency(lifestyleBudget)}/mo). The excess reduces your effective savings.
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })()}

                      <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E6E6E6] flex justify-between items-center mb-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#A2A3A5] uppercase font-semibold">Monthly Expenses</span>
                          <span className="text-[11px] text-[#727579] italic leading-none mt-0.5">
                            {inputs.debts.length > 0 ? 'Lifestyle + Debt payments' : 'Derived from savings'}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-[#FFB300] font-bold">
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
              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('health')}
                  className="w-full p-6 flex items-center justify-between text-[#44474D] hover:text-[#212121] transition-colors"
                >
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck size={16} className="text-[#0EB35B]" /> Financial Health Audit
                  </h2>
                  {collapsedSections.has('health') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {!collapsedSections.has('health') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#A2A3A5]">Emergency Fund</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${healthAudit.emergencyFundStatus === 'good' ? 'text-[#0EB35B]' : healthAudit.emergencyFundStatus === 'warning' ? 'text-[#FFB300]' : 'text-[#D91222]'}`}>
                              {healthAudit.emergencyFundMonths.toFixed(1)} Months
                            </span>
                            <div className={`w-2 h-2 rounded-full ${healthAudit.emergencyFundStatus === 'good' ? 'bg-emerald-500' : healthAudit.emergencyFundStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#A2A3A5]">Debt-to-Income (DTI)</span>
                          <span className={`text-xs font-bold ${healthAudit.debtToIncomeStatus === 'high' ? 'text-[#D91222]' : healthAudit.debtToIncomeStatus === 'caution' ? 'text-[#FFB300]' : 'text-[#0EB35B]'}`}>
                            {(healthAudit.debtToIncomeRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#A2A3A5]">Savings Rate</span>
                          <span className={`text-xs font-bold ${healthAudit.savingsRateStatus === 'aggressive' ? 'text-[#0EB35B]' : healthAudit.savingsRateStatus === 'healthy' ? 'text-[#0EB35B]/70' : 'text-[#FFB300]'}`}>
                            {healthAudit.savingsRateStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {healthAudit.emergencyFundStatus !== 'good' && (
                        <div className="mt-4 p-3 bg-[#D91222]/5 border border-[#D91222]/15 rounded-lg">
                          <p className="text-[10px] text-[#D91222] leading-relaxed">
                            Professional Tip: Prioritize building a 6-month emergency fund before aggressive investing.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <button
                    onClick={() => toggleSection('debt')}
                    className="flex-1 flex items-center justify-between text-[#44474D] hover:text-[#212121] transition-colors text-left"
                  >
                    <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                      <CreditCard size={16} /> Debt Profile
                    </h2>
                    {collapsedSections.has('debt') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {!collapsedSections.has('debt') && (
                    <button
                      onClick={addDebt}
                      className="ml-4 p-1.5 bg-[#0EB35B]/10 text-[#0EB35B] rounded-lg hover:bg-[#0EB35B]/20 transition-colors"
                      title="Add Debt"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {!collapsedSections.has('debt') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 space-y-6"
                    >
                      {inputs.debts.length === 0 && (
                        <p className="text-xs text-[#A2A3A5] italic text-center py-4">No active debts. Great job!</p>
                      )}
                      {inputs.debts.map((debt, idx) => (
                        <div key={debt.id} className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E6E6E6] relative group flex flex-col gap-3">
                          <button
                            onClick={() => removeDebt(idx)}
                            className="absolute top-2 right-2 p-1 text-[#727579] hover:text-[#D91222] opacity-0 group-hover:opacity-100 transition-all z-10"
                          >
                            <Trash2 size={14} />
                          </button>

                          <input
                            type="text"
                            value={debt.name}
                            onChange={(e) => updateDebt(idx, { name: e.target.value })}
                            className="bg-transparent border-none text-sm font-bold text-[#212121] focus:ring-0 p-0 w-full"
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

                          <div className="pt-2 border-t border-[#E6E6E6] flex justify-between items-center">
                            <span className="text-[10px] text-[#A2A3A5] uppercase">Monthly Payment</span>
                            <span className="text-xs font-mono text-[#D91222]">{formatCurrency(debt.monthlyPayment)}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('allocation')}
                  className="w-full p-6 flex items-center justify-between text-[#44474D] hover:text-[#212121] transition-colors"
                >
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                    <PieChartIcon size={16} /> Asset Allocation
                  </h2>
                  {collapsedSections.has('allocation') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                <AnimatePresence>
                  {!collapsedSections.has('allocation') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      {[
                        { key: 'equity', label: 'Equity (Stocks)', color: 'bg-emerald-500' },
                        { key: 'fixedIncome', label: 'Fixed Income (Bonds/Funds)', color: 'bg-indigo-500' },
                        { key: 'realEstate', label: 'Real Estate (REITs)', color: 'bg-pink-500' },
                        { key: 'gold', label: 'Gold/Alternatives', color: 'bg-yellow-500' },
                      ].map((asset) => (
                        <div key={asset.key} className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-[#A2A3A5] uppercase tracking-wider font-semibold">{asset.label}</label>
                            <button
                              onClick={() => {
                                const newLocked = new Set(lockedAssets);
                                if (newLocked.has(asset.key)) newLocked.delete(asset.key);
                                else newLocked.add(asset.key);
                                setLockedAssets(newLocked);
                              }}
                              className={`p-1 rounded transition-colors ${lockedAssets.has(asset.key) ? 'text-[#0EB35B] bg-[#0EB35B]/10' : 'text-[#727579] hover:text-[#727579]'}`}
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

                      <div className="mt-6 p-4 bg-[#F7F8FA] rounded-xl border border-[#E6E6E6]">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-[#A2A3A5]">Expected Portfolio Return</span>
                          <span className="text-[#0EB35B] font-mono">{(portfolioStats.expectedReturn * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#A2A3A5]">Portfolio Volatility</span>
                          <span className="text-[#FFB300] font-mono">{(portfolioStats.volatility * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 bg-[#0EB35B]/5 border border-[#0EB35B]/15 rounded-xl">
                <p className="text-[10px] text-[#0EB35B]/60 leading-relaxed uppercase tracking-tighter">
                  Disclaimer: This is a purely educational simulation. Past performance does not guarantee future results.
                  Not financial advice.
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area — results pane: tabs pinned at top, only the content below scrolls */}
        <section className={`${showSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} lg:h-[calc(100vh-210px)] lg:flex lg:flex-col transition-all duration-300`}>
          {/* Tabs — iOS Liquid Glass style: a frosted floating capsule bar with a glass
              lozenge that glides between tabs */}
          <div className="lg:shrink-0 flex gap-1 p-1.5 rounded-full glass-navbar">
            {[
              { id: "timeline", label: "Timeline", icon: History },
              { id: "allocation", label: "Allocation Lab", icon: PieChartIcon },
              { id: "risk", label: "Risk Reality", icon: ShieldAlert },
              { id: "debt", label: "Debt vs Invest", icon: CreditCard },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-colors duration-200 ${isActive
                    ? "text-[#D91222] font-semibold"
                    : "text-[#A2A3A5] hover:text-[#44474D]"
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tabGlass"
                      className="absolute inset-0 rounded-full glass-pill"
                      transition={{ type: "spring", stiffness: 300, damping: 17, mass: 1 }}
                    />
                  )}
                  <tab.icon size={16} className="relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content — the only part that scrolls within the results pane */}
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto scrollbar-thin mt-6 pr-1 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ type: "spring", stiffness: 400, damping: 34, mass: 0.8 }}
            >
              {activeTab === "timeline" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-6 rounded-2xl">
                      <p className="text-xs text-[#A2A3A5] uppercase mb-1">Retirement Age</p>
                      <p className="text-2xl font-bold">{inputs.retirementAge}</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl">
                      <p className="text-xs text-[#A2A3A5] uppercase mb-1">Inflation Adjusted</p>
                      <p className="text-2xl font-bold text-[#307EF2]">{formatCurrency(finalInflationAdjusted)}</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl">
                      <p className="text-xs text-[#A2A3A5] uppercase mb-1">Success Prob.</p>
                      <p className="text-2xl font-bold text-[#0EB35B]">{(mcResult.successProbability * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {inputs.debts.length > 0 && (
                    <div className="bg-[#D91222]/5 border border-[#D91222]/15 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-3 border-b border-[#D91222]/15 pb-2">
                        <CreditCard className="text-[#D91222]" size={20} />
                        <h4 className="text-sm font-semibold text-[#D91222]">Debt Projection</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inputs.debts.map((debt) => {
                          const payoffAge = inputs.currentAge + debt.termYears;
                          const carriesIntoRetirement = payoffAge > inputs.retirementAge;
                          return (
                            <div key={debt.id} className="flex justify-between items-center bg-white/50 p-2.5 rounded-lg border border-[#D91222]/10">
                              <div>
                                <p className="text-xs font-medium text-[#44474D] flex items-center gap-2">
                                  {debt.name}
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${carriesIntoRetirement ? 'bg-[#D91222]/10 text-[#D91222]' : 'bg-[#0EB35B]/10 text-[#0EB35B]'}`}>
                                    Settles Age {payoffAge}
                                  </span>
                                </p>
                                <p className="text-[10px] text-[#A2A3A5] mt-0.5">
                                  {formatCurrency(debt.principal)} @ {(debt.interestRate * 100).toFixed(1)}% for {debt.termYears}y
                                </p>
                              </div>
                              <div className="text-right flex flex-col justify-center">
                                <p className="text-xs font-mono font-bold text-[#D91222]">{formatCurrency(debt.monthlyPayment)}<span className="text-[10px] font-normal text-[#A2A3A5]">/mo</span></p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-2 border-t border-[#D91222]/15 flex justify-between items-center">
                        <span className="text-[10px] text-[#D91222]/70 uppercase font-bold tracking-wider">Initial Monthly Commitment</span>
                        <span className="text-sm font-mono font-bold text-[#D91222]">
                          {formatCurrency(inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0))}
                        </span>
                      </div>
                    </div>
                  )}

                  <TimelineChart data={deterministicData} />
                  <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-[#307EF2]/10 rounded-lg">
                      <Info className="text-[#307EF2]" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Understanding the Curve</h3>
                      <p className="text-sm text-[#727579] leading-relaxed">
                        The solid green area represents your nominal net worth. The dashed indigo line shows your
                        <span className="text-[#307EF2] font-medium"> inflation-adjusted</span> net worth,
                        representing today's purchasing power. Notice how compounding accelerates in the final 15 years.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "allocation" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-4 glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4 text-[#212121]">Portfolio Composition</h3>
                    <AllocationPie allocation={inputs.allocation} />
                    <div className="space-y-3 mt-4">
                      {[
                        { key: 'equity', label: 'Equity', color: 'bg-emerald-500' },
                        { key: 'fixedIncome', label: 'Fixed Income', color: 'bg-indigo-500' },
                        { key: 'realEstate', label: 'Real Estate', color: 'bg-pink-500' },
                        { key: 'gold', label: 'Gold', color: 'bg-yellow-500' },
                      ].map((asset) => (
                        <div key={asset.key} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${asset.color}`} />
                            <span className="text-sm text-[#44474D]">{asset.label}</span>
                          </div>
                          <span className="text-sm font-mono text-[#212121]">{(inputs.allocation[asset.key as keyof AssetAllocation] * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="xl:col-span-8 glass-card p-6 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-[#212121]">Risk/Return Profile</h3>
                    <RiskProfile stats={portfolioStats} allocation={inputs.allocation} />
                  </div>
                </div>
              )}

              {activeTab === "risk" && (
                <div className="space-y-6">
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold">Monte Carlo Simulation</h3>
                        <p className="text-sm text-[#A2A3A5]">1,000 randomized market paths based on current allocation.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#A2A3A5] uppercase">Retirement Success</p>
                        <p className={`text-2xl font-bold ${mcResult.successProbability > 0.8 ? 'text-[#0EB35B]' : mcResult.successProbability > 0.5 ? 'text-[#FFB300]' : 'text-[#D91222]'}`}>
                          {(mcResult.successProbability * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <MonteCarloChart result={mcResult} currentAge={inputs.currentAge} />
                    <div className="mt-4 p-4 bg-[#F7F8FA] rounded-xl border border-[#E6E6E6]">
                      <p className="text-xs text-[#727579] leading-relaxed">
                        <span className="text-[#0EB35B] font-semibold">Success Definition:</span> We define success as reaching a net worth of at least <span className="text-[#212121] font-mono font-bold">25x your final annual expenses</span> at the point of retirement.
                        This is based on the "4% Rule," which suggests you can safely withdraw 4% of your nest egg annually to sustain your lifestyle.
                      </p>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-semibold text-[#212121]">Understanding the "Spaghetti" Chart</h4>
                    <p className="text-sm text-[#727579] leading-relaxed">
                      The thin lines represent 50 individual market paths. Even with the same strategy,
                      market luck (sequence of returns) can lead to vastly different outcomes.
                      A <span className="text-[#0EB35B]">90% success rate</span> means that in 900 out of 1,000 simulated universes,
                      you reached your retirement goal.
                    </p>
                  </div>
                  <div className="bg-[#D91222]/5 border border-[#D91222]/15 p-6 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="text-[#D91222] shrink-0" size={24} />
                    <div>
                      <h4 className="text-sm font-semibold text-[#D91222] mb-1">Sequence of Returns Risk</h4>
                      <p className="text-sm text-[#727579] leading-relaxed">
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
        </section>
      </main>
    </div>
    </MotionConfig>
  );
}
