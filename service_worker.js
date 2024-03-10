const NEWSDATA_API_KEY = "pub_39287098fdbf226b85801a309234f917c8d01";
const COINMARKETCAL_API_KEY = "LTRFcwhmor8WjJ0g681jy2EopuCxGusT26iw8Pwl"
const NEWSAPI_API_KEY = "fd08c286c97044189ad4972ac1b007e3"

const ONE_INCH_API_KEY = 'VhpT0bmGAaUKv27KL7989kdMWaqjjIEq'

// background script

// get yesterday date like this 2024-03-01
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
const yesterdayFormatted = yesterday.toISOString().split('T')[0];
const newsDataStorageKey = `news_data_${yesterdayFormatted}`;

// todo need to create a server endpoint and in there call newsapi and all other server stuff, 
// lets say we have 10 clients, it will already eat up all of the free plan per day,
// need to have a cached server endpoint and then also cache it in chrome storage for faster retrival


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_NEWS_DATA") {
        chrome.storage.local.get([newsDataStorageKey])
            .then(storageData => {
                if (Boolean(storageData[newsDataStorageKey])) {
                    sendResponse(storageData[newsDataStorageKey])
                    return
                } else {
                    chrome.storage.local.clear()
                    // get data from api
                    fetch('https://crypto-dashboard-backend-nz6h.onrender.com/news-data')
                        .then(res => res.json())
                        .then(res => {
                            chrome.storage.local.set({
                                [newsDataStorageKey]: res
                            })
                            sendResponse(res)
                        })
                        .catch(console.log)
                }
            })
    } else if (message.type === "GET_CRYPTO_PRICES") {
        fetch('https://api.coincap.io/v2/assets?limit=20')
            .then(res => res.json())
            .then(res => sendResponse(res))
    } else if (message.type === 'ACTIVATE_WEBSOCKET') {
        disconnect();
        connect(message.coinsToTrack);
    } else if (message.type === 'DISCONNECT_WEBSOCKET') {
        disconnect();
    }
    return true
});

function keepAlive() {
    const keepAliveIntervalId = setInterval(
        () => {
            if (webSocket) {
                webSocket.send('keepalive');
            } else {
                clearInterval(keepAliveIntervalId);
            }
        },
        // Set the interval to 20 seconds to prevent the service worker from becoming inactive.
        20 * 1000
    );
}

let webSocket = null;

function connect(coinsToTrack) {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        console.warn('WebSocket connection already open');
        return;
    }

    webSocket = new WebSocket(`wss://ws.coincap.io/prices?assets=${coinsToTrack.join(',')}`);

    webSocket.onopen = () => {
        keepAlive();
    };

    webSocket.onmessage = (event) => {
        chrome.runtime.sendMessage({
            type: 'WEBSOCKET_MESSAGE',
            data: JSON.parse(event.data)
        });

    };

    webSocket.onclose = (event) => {
        webSocket = null;
    };
}

function disconnect() {
    if (webSocket == null) {
        return;
    }
    webSocket.close();
}


chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onStartup.addListener(disconnect);
    chrome.runtime.onSuspend.addListener(disconnect);
});