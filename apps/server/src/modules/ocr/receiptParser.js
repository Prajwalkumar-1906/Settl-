"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReceiptImage = parseReceiptImage;
function parseReceiptImage(imageNameOrData) {
    const name = imageNameOrData.toLowerCase();
    if (name.includes('restaurant') || name.includes('dinner') || name.includes('food')) {
        return {
            vendor: 'Le Gourmet Bistro',
            date: new Date().toISOString().split('T')[0],
            totalAmount: 142.50,
            category: 'Food',
            lineItems: [
                { description: 'Truffle Pasta x2', price: 54.00 },
                { description: 'Sparkling Water', price: 8.50 },
                { description: 'Artisan Wine Bottle', price: 60.00 },
                { description: 'Service & Tax (15%)', price: 20.00 },
            ],
            suggestedSplitType: 'equal',
            confidenceScore: 0.96,
        };
    }
    if (name.includes('flight') || name.includes('airline') || name.includes('travel')) {
        return {
            vendor: 'Air France Booking',
            date: new Date().toISOString().split('T')[0],
            totalAmount: 480.00,
            category: 'Travel',
            lineItems: [
                { description: 'Passenger Flight Ticket CDG-JFK x4', price: 440.00 },
                { description: 'Checked Luggage Fee', price: 40.00 },
            ],
            suggestedSplitType: 'equal',
            confidenceScore: 0.98,
        };
    }
    if (name.includes('grocery') || name.includes('flat') || name.includes('supermarket')) {
        return {
            vendor: 'Whole Foods Market',
            date: new Date().toISOString().split('T')[0],
            totalAmount: 89.20,
            category: 'Food',
            lineItems: [
                { description: 'Organic Milk & Eggs', price: 14.20 },
                { description: 'Fresh Fruits & Veggies', price: 32.00 },
                { description: 'Dish Soap & Supplies', price: 18.00 },
                { description: 'Snacks & Beverages', price: 25.00 },
            ],
            suggestedSplitType: 'equal',
            confidenceScore: 0.94,
        };
    }
    // Default fallback receipt OCR
    return {
        vendor: 'Universal Retail Store',
        date: new Date().toISOString().split('T')[0],
        totalAmount: 65.00,
        category: 'Shopping',
        lineItems: [
            { description: 'Shared Group Item A', price: 35.00 },
            { description: 'Shared Group Item B', price: 30.00 },
        ],
        suggestedSplitType: 'equal',
        confidenceScore: 0.91,
    };
}
