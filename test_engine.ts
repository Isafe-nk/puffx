import { calculateTradeFees, getBrokerMin, getWhtRate } from "./src/utils/frictionModel.ts";

console.log("=== IBKR Friction Engine Test Cases ===");

// Test 1: $500 USD Investment in US ETF (e.g., VOO) - $500 price
console.log("\n--- TEST 1: US Domicile ($500 Invested) ---");
const test1 = calculateTradeFees(500, "US", 500, false);
console.log("Without Direct USD (bypassFX=false):");
console.log(`FX Fee: $${test1.fxFee.toFixed(2)}`);
console.log(`Broker Fee: $${test1.brokerFee.toFixed(4)}`);
console.log(`Net Invested: $${test1.netInv.toFixed(2)}`);

const test1Bypass = calculateTradeFees(500, "US", 500, true);
console.log("\nWith Direct USD (bypassFX=true):");
console.log(`FX Fee: $${test1Bypass.fxFee.toFixed(2)}`);
console.log(`Broker Fee: $${test1Bypass.brokerFee.toFixed(4)}`);
console.log(`Net Invested: $${test1Bypass.netInv.toFixed(2)}`);


// Test 2: $500 USD Investment in IE ETF (e.g., CSPX) - $500 price
console.log("\n--- TEST 2: IE Domicile ($500 Invested) ---");
const test2 = calculateTradeFees(500, "IE", 500, false);
console.log("Without Direct USD (bypassFX=false):");
console.log(`FX Fee: $${test2.fxFee.toFixed(2)}`);
console.log(`Broker Fee: $${test2.brokerFee.toFixed(4)}`);
console.log(`Net Invested: $${test2.netInv.toFixed(2)}`);

const test2Bypass = calculateTradeFees(500, "IE", 500, true);
console.log("\nWith Direct USD (bypassFX=true):");
console.log(`FX Fee: $${test2Bypass.fxFee.toFixed(2)}`);
console.log(`Broker Fee: $${test2Bypass.brokerFee.toFixed(4)}`);
console.log(`Net Invested: $${test2Bypass.netInv.toFixed(2)}`);


// Test 3: Large Investment to break the IE minimum floor ($5000 USD)
console.log("\n--- TEST 3: IE Domicile Large Volume ($5000 Invested) ---");
const test3 = calculateTradeFees(5000, "IE", 500, true);
console.log(`With Direct USD (bypassFX=true):`);
console.log(`FX Fee: $${test3.fxFee.toFixed(2)}`);
console.log(`Broker Fee: $${test3.brokerFee.toFixed(4)}`);
console.log(`(Note: 0.05% of $5000 is $2.50. This correctly breaks the $1.70 floor)`);

console.log("\n--- TEST 4: Constants Mapping ---");
console.log(`US WHT Rate: ${getWhtRate("US") * 100}%`);
console.log(`IE WHT Rate: ${getWhtRate("IE") * 100}%`);
console.log(`US Broker Min: $${getBrokerMin("US").toFixed(2)}`);
console.log(`IE Broker Min: $${getBrokerMin("IE").toFixed(2)}`);
