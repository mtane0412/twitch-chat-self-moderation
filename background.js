chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'reloadActiveTab') {
        // 現在アクティブなタブを取得してリロード
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }
});

// タブのURLが変更されたときにメッセージを送信
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        chrome.tabs.sendMessage(tabId, {
            type: "URL_CHANGED",
            url: changeInfo.url
        });
    }
});
