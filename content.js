function main() {
    chrome.storage.local.get(null, (tags) => {
        // `tags` には保存されたすべてのタグとワードリストが含まれる
        tagToForbiddenWordsMap = tags;
        
        // 現在有効な禁止ワードセット
        let currentForbiddenWords = [];

        // グローバルな禁止ワードセット
        let globalForbiddenWords = [];

        let forbiddenWords = [];

        // チャット入力欄と送信ボタンの要素を選択
        const chatInputSelector = 'div[data-a-target="chat-input"]';
        const sendButtonSelector = 'button[data-a-target="chat-send-button"]';

        
        // 送信イベントの監視と処理を行う関数
        const handleSendEvent = (event) => {
            const chatInput = document.querySelector(chatInputSelector);
            const message = chatInput.textContent.toLowerCase();
            if (forbiddenWords.some(word => message.includes(word))) {
                if (!confirm('要注意ワードが含まれています。本当に送信しますか？')) {
                    event.preventDefault(); // 送信を中断
                    event.stopPropagation(); // イベントの伝播を停止
                }
            }
        };

        // エンターキーでの送信を検知して処理を行う関数
        const handleEnterPress = (event) => {
            if (event.keyCode === 13) { // macでの変換エンター識別対策
                const chatInput = document.querySelector(chatInputSelector);
                const message = chatInput.textContent.toLowerCase(); // メッセージを小文字に変換

                if (forbiddenWords.some(word => message.includes(word))) {
                    event.preventDefault(); // デフォルトの送信を中止
                    const isConfirmed = confirm('要注意ワードが含まれています。本当に送信しますか？');
                    if (!isConfirmed) {
                        // 送信を中断
                        event.stopPropagation(); // イベントの伝播を停止
                        return false;
                    }　else {
                        // 送信を継続
                        chatInput.style.backgroundColor = '';
                        return true;
                    }
                }
            }
        };
        
        // 背景色を変更する関数
        const changeBackgroundColor = () => {
            const chatInput = document.querySelector(chatInputSelector);
            const message = chatInput.textContent.toLowerCase();
            chatInput.style.backgroundColor = forbiddenWords.some(word => message.includes(word)) ? 'lightcoral' : '';
        };
        
        // チャット入力欄にイベントリスナーを設定する関数
        const setupEventListeners = () => {
            const chatInput = document.querySelector(chatInputSelector);
            const sendButton = document.querySelector(sendButtonSelector);
            if (chatInput && sendButton) {
                chatInput.addEventListener('input', changeBackgroundColor);
                chatInput.addEventListener('keyup', changeBackgroundColor);
                chatInput.addEventListener('keydown', handleEnterPress);
                sendButton.addEventListener('click', handleSendEvent);
            }
        };
        
        
        // 配信者のタグを定期的にチェックする関数
        const checkStreamerTagsInterval = setInterval(() => {
            const tagElements = document.querySelectorAll('a[data-a-target][class*="tw-tag"] span');
            const tags = Array.from(tagElements).map(el => el.textContent.trim().toLowerCase());
            // タグに対応する禁止ワードを取得
            tags.forEach(tag => {
                if (tagToForbiddenWordsMap[tag]) {
                    currentForbiddenWords = currentForbiddenWords.concat(tagToForbiddenWordsMap[tag]);
                }
            });
            // グローバルな禁止ワードを取得
            globalForbiddenWords = tagToForbiddenWordsMap[''] || [];
            // 禁止ワードを結合
            forbiddenWords = currentForbiddenWords.concat(globalForbiddenWords);
            setupEventListeners(); // イベントリスナーを設定
            if (currentForbiddenWords.length > 0) {
                clearInterval(checkStreamerTagsInterval); // 適切なタグが見つかったらsetIntervalをクリア
            }
        }, 1000); // 1秒ごとにチェック
    });
}

// ページ読み込み時に実行
main();

// ページ遷移時にイベントリスナーを再設定
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "URL_CHANGED") {
        // URLが変更されたときに再実行する処理
        console.log("URLが変更されました: ", message.url);
        main();
    }
});