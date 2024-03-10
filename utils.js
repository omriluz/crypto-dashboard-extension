function normalizePrice(price) {
    priceNum = Number(price);
    if (isNaN(priceNum)) {
        return "N/A"
    }
    if (priceNum >= 1) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceNum)
    } else {
        // find how many 0 are after the decimal point
        const afterDecimalPoint = price.split(".")[1]
        if (!afterDecimalPoint || afterDecimalPoint[0] !== '0') {
            return `$${priceNum.toFixed(2)}`
        }
        const zeroCount = afterDecimalPoint.match(/^0+/g)[0].split('').length
        return `$${priceNum.toFixed(zeroCount + 2)}`
    }
}

function normalizeShortCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short'
      }).format(num)
}

function normalizeSupply(supply) {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
      }).format(supply)
}