// Format timestamp to a readable string
function formatTimestamp(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
}

// Calculate discount price
function calculateDiscount(price, discountPercentage) {
    if (price < 0 || discountPercentage < 0 || discountPercentage > 100) {
        throw new Error('Invalid input');
    }
    const discount = (price * discountPercentage) / 100;
    return Number((price - discount).toFixed(2));
}

module.exports = {
    formatTimestamp,
    calculateDiscount
};
