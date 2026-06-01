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
import { TimelineChart, AllocationPie } from "./components/Charts";
import { MonteCarloChart } from "./components/MonteCarloChart";
import { DebtVsInvestingLab } from "./components/DebtVsInvestingLab";
import { RiskProfile } from "./components/RiskProfile";
import { runDeterministicSimulation, getPortfolioStats, calculateMonthlyPayment, auditFinancialHealth } from "./engine/finance";
import { runMonteCarlo } from "./engine/monteCarlo";
import { INITIAL_USER_INPUTS, DEFAULT_MARKET_ASSUMPTIONS } from "./constants";
import { UserInputs, DebtProfile, AssetAllocation, FinancialHealth } from "./engine/types";
import { motion, AnimatePresence } from "motion/react";

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
    <div className="w-full bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      {/* Top Bar inside component */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-zinc-900/50">
        <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={20} className="text-emerald-500" /> Wealth Simulator</h2>
        <div className="flex items-center gap-6 text-sm font-medium text-zinc-400">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Projected Net Worth</span>
            <span className="text-emerald-500 font-mono text-base">{formatCurrency(finalNetWorth)}</span>
          </div>
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-2 border ${
              showSidebar 
                ? "bg-zinc-800 border-white/10 text-zinc-300 hover:text-white" 
                : "bg-emerald-500 border-emerald-400 text-zinc-950 hover:bg-emerald-400"
            }`}
          >
            {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Inputs */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside 
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:col-span-4 space-y-6 overflow-hidden"
            >
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                <button 
                  onClick={() => toggleSection('life')}
                  className="w-full p-6 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
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
                        onChange={(v) => setInputs({ ...inputs, currentAge: v })} 
                      />
                      <SliderInput 
                        label="Retirement Age" 
                        value={inputs.retirementAge} 
                        min={inputs.currentAge + 1} max={80} 
                        onChange={(v) => setInputs({ ...inputs, retirementAge: v })} 
                      />
                      <SliderInput 
                        label="Monthly Salary" 
                        value={inputs.monthlySalary} 
                        min={2000} max={30000} step={100}
                        format={formatCurrency}
                        onChange={(v) => setInputs({ ...inputs, monthlySalary: v })} 
                        subLabel={`(${formatCurrency(inputs.monthlySalary * 12)} / yr)`}
                        tooltip="Your gross monthly income before taxes."
                      />
                      <SliderInput 
                        label="Savings Rate" 
                        value={inputs.savingsRate * 100} 
                        min={0} max={70} 
                        format={(v) => `${Math.round(v)}%`}
                        onChange={(v) => setInputs({ ...inputs, savingsRate: v / 100 })} 
                        subLabel={`(${formatCurrency(inputs.monthlySalary * inputs.savingsRate)} / mo)`}
                        tooltip="Percentage of your monthly salary saved and invested."
                      />
                      
                      <div className="p-3 bg-zinc-950/50 rounded-xl border border-white/5 flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Monthly Expenses</span>
                          <span className="text-xs text-zinc-400 italic">Derived from salary & savings</span>
                        </div>
                        <span className="text-sm font-mono text-amber-400">
                          {formatCurrency(inputs.monthlySalary * (1 - inputs.savingsRate))}
                        </span>
                      </div>

                      <SliderInput 
                        label="Initial Savings" 
                        value={inputs.initialSavings} 
                        min={0} max={500000} step={1000}
                        format={formatCurrency}
                        onChange={(v) => setInputs({ ...inputs, initialSavings: v })} 
                      />
                      <SliderInput 
                        label="Salary Growth (%)" 
                        value={inputs.salaryGrowth * 100} 
                        min={0} max={10} step={0.1}
                        format={(v) => `${v}%`}
                        onChange={(v) => setInputs({ ...inputs, salaryGrowth: v / 100 })} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Financial Health Audit */}
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                <button 
                  onClick={() => toggleSection('health')}
                  className="w-full p-6 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
                >
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck size={16} className="text-emerald-500" /> Financial Health Audit
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
                          <span className="text-xs text-zinc-500">Emergency Fund</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${healthAudit.emergencyFundStatus === 'good' ? 'text-emerald-400' : healthAudit.emergencyFundStatus === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                              {healthAudit.emergencyFundMonths.toFixed(1)} Months
                            </span>
                            <div className={`w-2 h-2 rounded-full ${healthAudit.emergencyFundStatus === 'good' ? 'bg-emerald-500' : healthAudit.emergencyFundStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">Debt-to-Income (DTI)</span>
                          <span className={`text-xs font-bold ${(healthAudit.debtToIncomeRatio * 100) > 36 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {(healthAudit.debtToIncomeRatio * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">Savings Rate</span>
                          <span className={`text-xs font-bold ${healthAudit.savingsRateStatus === 'aggressive' ? 'text-emerald-400' : healthAudit.savingsRateStatus === 'healthy' ? 'text-emerald-400/70' : 'text-amber-400'}`}>
                            {healthAudit.savingsRateStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {healthAudit.emergencyFundStatus !== 'good' && (
                        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                          <p className="text-[10px] text-red-400 leading-relaxed">
                            Professional Tip: Prioritize building a 6-month emergency fund before aggressive investing.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <button 
                    onClick={() => toggleSection('debt')}
                    className="flex-1 flex items-center justify-between text-zinc-300 hover:text-white transition-colors text-left"
                  >
                    <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
                      <CreditCard size={16} /> Debt Profile
                    </h2>
                    {collapsedSections.has('debt') ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {!collapsedSections.has('debt') && (
                    <button 
                      onClick={addDebt}
                      className="ml-4 p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
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
                        <p className="text-xs text-zinc-500 italic text-center py-4">No active debts. Great job!</p>
                      )}
                      {inputs.debts.map((debt, idx) => (
                        <div key={debt.id} className="p-4 bg-zinc-950/50 rounded-xl border border-white/5 relative group">
                          <button 
                            onClick={() => removeDebt(idx)}
                            className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          <input 
                            type="text"
                            value={debt.name}
                            onChange={(e) => updateDebt(idx, { name: e.target.value })}
                            className="bg-transparent border-none text-sm font-bold text-zinc-200 focus:ring-0 p-0 mb-4 w-full"
                            placeholder="Debt Name"
                          />

                          <SliderInput 
                            label="Principal" 
                            value={debt.principal} 
                            min={0} max={200000} step={1000}
                            format={formatCurrency}
                            onChange={(v) => updateDebt(idx, { principal: v })} 
                          />
                          <SliderInput 
                            label="Interest Rate" 
                            value={debt.interestRate * 100} 
                            min={0} max={20} step={0.1}
                            format={(v) => `${v}%`}
                            onChange={(v) => updateDebt(idx, { interestRate: v / 100 })} 
                          />
                          <SliderInput 
                            label="Term" 
                            value={debt.termYears} 
                            min={1} max={35} step={1}
                            format={(v) => `${v} Years`}
                            onChange={(v) => updateDebt(idx, { termYears: v })} 
                          />
                          
                          <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 uppercase">Monthly Payment</span>
                            <span className="text-xs font-mono text-red-400">{formatCurrency(debt.monthlyPayment)}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                <button 
                  onClick={() => toggleSection('allocation')}
                  className="w-full p-6 flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
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
                        { key: 'cash', label: 'Cash (Savings/FD)', color: 'bg-amber-500' },
                        { key: 'realEstate', label: 'Real Estate (REITs)', color: 'bg-pink-500' },
                        { key: 'gold', label: 'Gold/Alternatives', color: 'bg-yellow-500' },
                      ].map((asset) => (
                        <div key={asset.key} className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{asset.label}</label>
                            <button 
                              onClick={() => {
                                const newLocked = new Set(lockedAssets);
                                if (newLocked.has(asset.key)) newLocked.delete(asset.key);
                                else newLocked.add(asset.key);
                                setLockedAssets(newLocked);
                              }}
                              className={`p-1 rounded transition-colors ${lockedAssets.has(asset.key) ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}
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

                      <div className="mt-6 p-4 bg-zinc-950/50 rounded-xl border border-white/5">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-zinc-500">Expected Portfolio Return</span>
                          <span className="text-emerald-400 font-mono">{(portfolioStats.expectedReturn * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Portfolio Volatility</span>
                          <span className="text-amber-400 font-mono">{(portfolioStats.volatility * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase tracking-tighter">
              Disclaimer: This is a purely educational simulation. Past performance does not guarantee future results. 
              Not financial advice.
            </p>
          </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <section className={`${showSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-white/5">
            {[
              { id: "timeline", label: "Timeline", icon: History },
              { id: "allocation", label: "Allocation Lab", icon: PieChartIcon },
              { id: "risk", label: "Risk Reality", icon: ShieldAlert },
              { id: "debt", label: "Debt vs Invest", icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "timeline" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                      <p className="text-xs text-zinc-500 uppercase mb-1">Retirement Age</p>
                      <p className="text-2xl font-bold">{inputs.retirementAge}</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                      <p className="text-xs text-zinc-500 uppercase mb-1">Inflation Adjusted</p>
                      <p className="text-2xl font-bold text-indigo-400">{formatCurrency(finalInflationAdjusted)}</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                      <p className="text-xs text-zinc-500 uppercase mb-1">Success Prob.</p>
                      <p className="text-2xl font-bold text-emerald-400">{(mcResult.successProbability * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {inputs.debts.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-3 border-b border-red-500/10 pb-2">
                        <CreditCard className="text-red-400" size={20} />
                        <h4 className="text-sm font-semibold text-red-400">Active Debts</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {inputs.debts.map((debt) => (
                          <div key={debt.id} className="flex justify-between items-center">
                            <div>
                              <p className="text-xs font-medium text-zinc-300">{debt.name}</p>
                              <p className="text-[10px] text-zinc-500">
                                {formatCurrency(debt.principal)} @ {(debt.interestRate * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono text-red-400">{formatCurrency(debt.monthlyPayment)}/mo</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-red-500/10 flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500 uppercase">Total Monthly Commitment</span>
                        <span className="text-sm font-bold text-red-400">
                          {formatCurrency(inputs.debts.reduce((sum, d) => sum + d.monthlyPayment, 0))}
                        </span>
                      </div>
                    </div>
                  )}

                  <TimelineChart data={deterministicData} />
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Info className="text-indigo-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Understanding the Curve</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        The solid green area represents your nominal net worth. The dashed indigo line shows your 
                        <span className="text-indigo-400 font-medium"> inflation-adjusted</span> net worth, 
                        representing today's purchasing power. Notice how compounding accelerates in the final 15 years.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "allocation" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-4 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-4 text-zinc-100">Portfolio Composition</h3>
                    <AllocationPie allocation={inputs.allocation} />
                      <div className="space-y-3 mt-4">
                        {[
                          { key: 'equity', label: 'Equity', color: 'bg-emerald-500' },
                          { key: 'fixedIncome', label: 'Fixed Income', color: 'bg-indigo-500' },
                          { key: 'cash', label: 'Cash', color: 'bg-amber-500' },
                          { key: 'realEstate', label: 'Real Estate', color: 'bg-pink-500' },
                          { key: 'gold', label: 'Gold', color: 'bg-yellow-500' },
                        ].map((asset) => (
                          <div key={asset.key} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${asset.color}`} />
                              <span className="text-sm text-zinc-300">{asset.label}</span>
                            </div>
                            <span className="text-sm font-mono text-zinc-100">{(inputs.allocation[asset.key as keyof AssetAllocation] * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                  </div>
                  <div className="xl:col-span-8 bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
                    <h3 className="text-lg font-bold text-zinc-100">Risk/Return Profile</h3>
                    <RiskProfile stats={portfolioStats} allocation={inputs.allocation} />
                  </div>
                </div>
              )}

              {activeTab === "risk" && (
                <div className="space-y-6">
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold">Monte Carlo Simulation</h3>
                        <p className="text-sm text-zinc-500">1,000 randomized market paths based on current allocation.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase">Retirement Success</p>
                        <p className={`text-2xl font-bold ${mcResult.successProbability > 0.8 ? 'text-emerald-400' : mcResult.successProbability > 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                          {(mcResult.successProbability * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <MonteCarloChart result={mcResult} currentAge={inputs.currentAge} />
                    <div className="mt-4 p-4 bg-zinc-950/50 rounded-xl border border-white/5">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        <span className="text-emerald-400 font-semibold">Success Definition:</span> We define success as reaching a net worth of at least <span className="text-white font-mono">25x your final annual expenses</span> at the point of retirement. 
                        This is based on the "4% Rule," which suggests you can safely withdraw 4% of your nest egg annually to sustain your lifestyle.
                      </p>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-200">Understanding the "Spaghetti" Chart</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      The thin lines represent 50 individual market paths. Even with the same strategy, 
                      market luck (sequence of returns) can lead to vastly different outcomes. 
                      A <span className="text-emerald-400">90% success rate</span> means that in 900 out of 1,000 simulated universes, 
                      you reached your retirement goal.
                    </p>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="text-red-400 shrink-0" size={24} />
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-1">Sequence of Returns Risk</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">
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
        </section>
      </main>
    </div>
  );
}
