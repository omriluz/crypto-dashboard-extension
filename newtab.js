document.addEventListener('DOMContentLoaded', onLoad);
function onLoad() {

    chrome.runtime.sendMessage({ type: 'GET_NEWS_DATA' }, (res) => {
        renderNews(res);
    })
    chrome.runtime.sendMessage({ type: 'GET_CRYPTO_PRICES' }, (res) => {
        renderCryptoPrices(res);

        const coinsToTrack = res.data.map(({ id }) => id)
        chrome.runtime.sendMessage({ type: 'ACTIVATE_WEBSOCKET', coinsToTrack });
    });
    // TODO: get crypto price charts
    // TODO: try to see if possible to implement portfolio tracking
    // TODO: try to see if possible to get fear and greed index


    chrome.runtime.onMessage.addListener(({ type, data }) => {
        if (type === 'WEBSOCKET_MESSAGE') {
            Object.entries(data).forEach(([key, value]) => {
                // if (window[key].innerText.slice(1) > value) {
                //     window[key].parentElement.classList.add("color-pulse-red");
                //     setTimeout(() => {
                //         window[key].parentElement.classList.remove("color-pulse-red");
                //     }, 2000);
                // } else {
                //     window[key].parentElement.classList.add("color-pulse-green");
                //     setTimeout(() => {
                //         window[key].parentElement.classList.remove("color-pulse-green");
                //     }, 2000);
                // }

                window[key].innerText = normalizePrice(value);
            })
        }
    });
}


window.addEventListener('beforeunload', () => {
    chrome.runtime.sendMessage({ type: 'DISCONNECT_WEBSOCKET' });
});


function renderCryptoPrices(res) {
    console.log('Rendering crypto prices...', res);
    const { data } = res || {}
    const cryptoPricesTbody = document.querySelector(".crypto-prices tbody");

    if (!data) {
        cryptoPricesTbody.innerHTML = "No crypto price data found";
        return
    }

    // Render crypto prices
    data.forEach(({ id, symbol, rank, name, priceUsd, marketCapUsd, supply, volumeUsd24Hr, changePercent24Hr }) => {
        const changePercent24HrFormatted = Number(changePercent24Hr).toFixed(2)
        let changePercent24HrColor = "#16a34a";
        if (changePercent24Hr < 0) {
            changePercent24HrColor = "#dc2626";
        }
        const cryptoPrice = document.createElement("tr");
        cryptoPrice.classList.add("crypto-prices__item");
        cryptoPrice.innerHTML = `
        <td style="text-align:center;" colspan="2">${rank}</td>
        <td class="token-name" colspan="2">
        <img class="token-img" src="https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png" />
        <div style="display:flex;gap:0.125rem;flex-direction:column;">
        <span>${name}</span>
        <span style="font-size:0.75rem">${symbol}</span>
        </div>
        </td>
        <td id="${id}" class="crypto-price-usd" colspan="2">${normalizePrice(priceUsd)}</td>
        <td colspan="2">${normalizeShortCurrency(marketCapUsd)}</td>
        <td colspan="2">${normalizeSupply(supply)}</td>
        <td style="text-align:center" colspan="2">${normalizeShortCurrency(volumeUsd24Hr)}</td>
        <td style="color:${changePercent24HrColor};text-align:center" colspan="2">${changePercent24HrFormatted}%</td>
        `;

        cryptoPricesTbody.appendChild(cryptoPrice);
    });
}


function renderNews(res) {
    const { articles } = res || {}
    const newsContainer = document.querySelector(".news");


    if (!articles) {
        newsContainer.innerText = "No news found";
        return
    }

    // todo add fallback image to articles
    articles.forEach(({ source, title, description, url, urlToImage }) => {
        const newsItem = document.createElement("a");
        newsItem.href = url
        newsItem.classList.add("news__item");
        newsItem.target = "_blank";
        newsItem.innerHTML = `
            <div class="news__item-image">
                <img src="${urlToImage || './placeholder-img.jpg'}" alt="${title}">
            </div>
            <div class="news__item-content">
                <h3 class="news__item-title line-clamp" style="--line-clamp:2">${title}</h3>
                <p class="news__item-description line-clamp">${description}</p>
            </div>
            `;
        newsContainer.appendChild(newsItem);
    });
}