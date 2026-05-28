# MY-IBKR S&P 500 Drag Visualizer — Technical Specification

This document serves as the absolute functional and mathematical specification for the S&P 500 ETF Total Cost of Ownership (TCO) and Cash Drag Visualizer.

---

## 1. Domain Context & Core Objectives

Malaysian retail investors face a distinct structural trade-off when investing in S&P 500 ETFs via Interactive Brokers (IBKR):
* **US-domiciled ETFs (e.g., VOO, IVV, SPY):** NYSE listed. Ultra-low management expense ratios (TER) but subject to a **30% Dividend Withholding Tax (WHT)** and US Estate Taxes on values $> \$60,000$.
* **Ireland-domiciled UCITS ETFs (e.g., CSPX, VUAA, SPYL):** LSE listed. Slightly higher TER but optimized to **15% WHT** under the US-Ireland Bilateral Double Tax Treaty, with no US Estate Tax exposure.
* **Transaction Friction:** Fixed fee minimums on IBKR spot conversions and London Stock Exchange brokerage commissions create high recurring drag on small contribution volumes.

---

## 2. Definitive Mathematical Model

All core engine simulations natively operate in **USD** and are presented in **MYR (RM)** at the exchange spot rate.

### A. IBKR Transaction Friction Calculations
* **FX Spot Conversions (RM to USD):**
  $$\text{FX Fee (USD)} = \max(2.00, 0.00002 \times \text{Volume in USD})$$
* **US NYSE Commissions:**
  $$\text{Broker Fee (USD)} = \min(0.01 \times \text{Trade Value}, \max(0.35, \text{Shares} \times 0.0035))$$
* **London Stock Exchange LSE UCITS Commissions:**
  $$\text{Broker Fee (USD)} = \max(1.90, 0.0005 \times \text{Trade Value})$$
* **ETF Bid-Ask Spread Cost (implicit slippage):**
  $$\text{Spread Cost (USD)} = \frac{\text{Spread}_{\text{bps}}}{10000} \times \frac{1}{2} \times \text{Trade Value}$$
  Default spread values (bps): VOO/IVV/SPY = 1, CSPX = 3, VUAA = 5, SPYL = 8.

### B. Monthly Compounding & Leakage Pipeline
For each month $m$ over the simulation horizon:
1. **Gross Contributions:** Add monthly savings and apply purchase rules based on selection frequency (Monthly, Quarterly, Bi-Annually, Annually).
2. **Transaction Drag Deduction:** Deduct FX and broker fees calculated via the friction model to obtain net investable capital.
3. **Market Growth Appreciation:**
   Let $g_m = (1 + g_{\text{annual}})^{1/12} - 1$ (appreciation rate).
   Let $d_m = d_{\text{annual}} / 12$ (dividend yield rate).
   $$\text{Gross Return} = \text{Bal} \times (g_m + d_m)$$
4. **Leakage & Admin Deductions:**
   * **Withholding Tax Leakage:** Deducts WHT on dividends ($30\%$ for US domiciles, $15\%$ for Ireland domiciles):
     $$\text{Tax Withheld} = \text{Bal} \times d_m \times \text{WHT Rate}$$
   * **Product Expense Drag (TER):**
     $$\text{TER Drag} = \text{Bal} \times \left(\frac{\text{TER}_{\text{annual}}}{12}\right)$$
5. **Net Portfolio compounding balance:**
   $$\text{Bal}_{new} = \text{Bal} + \text{Gross Return} - \text{Tax Withheld} - \text{TER Drag}$$

---

## 3. Application State & Interface Parameters

### A. React State Glossaries (`src/App.tsx`)
* **Inputs:** `initialInvestmentRM`, `monthlyContributionRM`, `horizonYears`, `feeOptimizationFreq`.
* **Advanced Tuning:** `grossMarketGrowth` (%), `marketDividendYield` (%), `usdMyrRate`.
* **Overriding Inputs:** `overridePriceA`, `overridePriceB`, `overrideTerA`, `overrideTerB`, `overrideSpreadA`, `overrideSpreadB` (custom overrides).
* **UI Controls:** `showInUsd` (currency toggle), `activeTab` (`"performance" | "leakage"`).

### B. UI Presentation Standards
* **Dashboard Style:** Modern dark fintech (#06080F dark theme).
* **Friction Warning Banner:** Automatically activates if cumulative trade friction exceeds **2.0%** of contribution size.
* **Visualization Stacks:** Chart.js configurations utilizing blue accents for US assets, emerald for Irish assets, and amber for cost leakages.
