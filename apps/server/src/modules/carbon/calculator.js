"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateExpenseCarbonFootprint = estimateExpenseCarbonFootprint;
/**
 * Carbon Footprint Estimator for travel & trip expenses.
 * Estimates CO2 emissions in kg based on category & amount/description.
 */
function estimateExpenseCarbonFootprint(category, amount, description) {
    const descLower = description.toLowerCase();
    // Travel / Flight / Gas / Train
    if (category === 'Travel') {
        if (descLower.includes('flight') || descLower.includes('airline') || descLower.includes('plane')) {
            return Math.round(amount * 0.85 * 10) / 10; // ~0.85 kg CO2 per USD spend on aviation
        }
        if (descLower.includes('gas') || descLower.includes('fuel') || descLower.includes('drive')) {
            return Math.round(amount * 0.65 * 10) / 10;
        }
        if (descLower.includes('train') || descLower.includes('metro') || descLower.includes('bus')) {
            return Math.round(amount * 0.15 * 10) / 10; // Eco-friendly transit
        }
        return Math.round(amount * 0.4 * 10) / 10;
    }
    // Food / Dining
    if (category === 'Food') {
        if (descLower.includes('steak') || descLower.includes('bbq') || descLower.includes('burger')) {
            return Math.round(amount * 0.45 * 10) / 10;
        }
        if (descLower.includes('vegan') || descLower.includes('salad') || descLower.includes('coffee')) {
            return Math.round(amount * 0.08 * 10) / 10;
        }
        return Math.round(amount * 0.22 * 10) / 10;
    }
    // Housing / Accommodation
    if (category === 'Housing') {
        return Math.round(amount * 0.12 * 10) / 10;
    }
    // Utilities / Electricity
    if (category === 'Utilities') {
        return Math.round(amount * 0.35 * 10) / 10;
    }
    return Math.round(amount * 0.05 * 10) / 10;
}
