# MY-IBKR S&P 500 Drag Visualizer 📈💸

A high-fidelity, interactive Total Cost of Ownership (TCO) and Cash Drag Visualizer designed specifically for Malaysian retail investors investing in the S&P 500 index via Interactive Brokers (IBKR).

This tool compares the long-term compounding performance and cost leakages of US-domiciled ETFs (e.g., VOO, IVV, SPY) against Ireland-domiciled UCITS ETFs (e.g., CSPX, VUAA, SPYL).

---

## 1. The Core Domain Trade-off

Malaysian retail investors face a distinct structural trade-off when building their long-term portfolios:

*   **US-Domiciled ETFs (NYSE listed):** Enjoy ultra-low Expense Ratios (TER) but are subject to an unavoidable **30% Dividend Withholding Tax (WHT)** on the fund level and up to 40% US Estate Tax on values exceeding \$60,000.
*   **Ireland-Domiciled UCITS ETFs (LSE listed):** Have slightly higher TERs but are tax-optimized down to **15% WHT** under the US-Ireland Bilateral Double Tax Treaty, with zero US Estate Tax exposure.
*   **Transaction Friction:** Interactive Brokers' spot FX fees (\$2.00 USD minimum) and LSE brokerage commission minimums (\$1.90 USD minimum) create a severe percentage overhead on small, recurring retail contributions.

This visualizer models all of these variables over time to identify the **exact mathematical tipping point** where the WHT tax arbitrage of Ireland outweighs LSE's higher brokerage fees and TERs.

---

## 2. Definitive Mathematical Model

All simulations operate natively in **USD** and convert to **MYR (RM)** for presentation at the current spot exchange rate.

### A. IBKR Friction & Commission Model
*   **Spot FX Conversion Fee (RM to USD):**
    $$\text{FX Fee (USD)} = \max(2.00, 0.00002 \times \text{Volume in USD})$$
    *(Bypassed completely if "Direct USD Deposit" is active)*
*   **US NYSE Brokerage Commission:**
    $$\text{Broker Fee (USD)} = \min(0.01 \times \text{Trade Value}, \max(0.35, \text{Shares} \times 0.0035))$$
*   **London Stock Exchange (LSE) UCITS Commission:**
    $$\text{Broker Fee (USD)} = \max(1.90, 0.0005 \times \text{Trade Value})$$

### B. Monthly Compounding & Leakage Loop
For each month $m$ over the simulation horizon:
1.  **Gross Contribution Gating:** Monthly allocations are saved and batched based on the chosen **Execution Frequency** (Monthly, Quarterly, Bi-Annually, Annually).
2.  **Friction Deduction:** Buy commissions and FX spot fees are subtracted from the batched purchase size to yield the net investable capital:
    $$\text{Net Investable Capital} = \text{Batched Allocation} - \text{FX Fee} - \text{Broker Fee}$$
3.  **Market Growth Appreciation:**
    Let $g_m = (1 + g_{\text{annual}})^{1/12} - 1$ (monthly price return).
    Let $d_m = d_{\text{annual}} / 12$ (monthly dividend yield).
    $$\text{Gross Market Return} = \text{Portfolio Balance} \times (g_m + d_m)$$
4.  **Taxes & Admin Leakage:**
    *   **Dividend Withholding Tax (WHT):**
        $$\text{Tax Withheld} = \text{Portfolio Balance} \times d_m \times \text{WHT Rate}$$
        *(WHT Rate is 30% for US domiciles, 15% for Irish domiciles)*
    *   **Expense TER Drag:**
        $$\text{TER Expense} = \text{Portfolio Balance} \times \left(\frac{\text{TER}_{\text{annual}}}{12}\right)$$
5.  **Compounded Balance Update:**
    $$\text{Balance}_{\text{new}} = \text{Balance} + \text{Gross Market Return} - \text{Tax Withheld} - \text{TER Expense}$$

---

## 3. Key Premium Features

*   **Elite Minimalist Aesthetics:** Designed in a dark premium fintech theme featuring transparent glass-morphism panels, harmonious curated color schemes, and seamless micro-animations.
*   **Execution Frequency Optimization:** Simulates batching contributions (e.g. investing Quarterly instead of Monthly) to pool funds together, effectively diluting IBKR's minimum fee floor at the cost of minor cash drag.
*   **Direct USD Deposit Bypass:** Toggle option to simulate depositing USD directly (e.g., via Wise, BigPay, or multi-currency wire transfers), completely bypassing IBKR's $2.00 USD currency spot converter fee.
*   **Clean Interactive Explainers:** Interactive tooltips elegantly integrated directly into the label text via subtle dashed underlines. Hovering reveals rich explanations, keeping the UI entirely clean and icon-free.
*   **High-Fidelity Visual Charts:** Real-time dual-chart visualization (Projection vs. Cumulative Lost Cost Leakages) powered by Chart.js.
*   **Interactive Parameter Overrides:** Real-time sliders and numeric input boxes to override assumed price appreciation, dividend yield, spot USD/MYR rate, stock pricing, and expense ratios.

---

## 4. Technology Stack

*   **Framework:** React 19 + Vite (Fast dev server and optimized production bundles)
*   **Language:** TypeScript (Strict type safety across the simulation math pipeline)
*   **Styling:** Vanilla Tailwind CSS (Modern dark layout)
*   **Charts:** Chart.js (Optimized line & stacked-bar charts)
*   **Icons:** Lucide React

---

## 5. Local Setup & Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn

### Steps
1.  **Clone the project** to your local workspace.
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run in development mode:**
    ```bash
    npm run dev
    ```
    This launches the local Vite development server. Open the displayed URL (typically `http://localhost:5173`) in your browser.
4.  **Build production assets:**
    ```bash
    npm run build
    ```
    This compiles and packages the code into an optimized, highly compressed production bundle inside the `/dist` directory.