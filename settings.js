// 設定を保存する関数
const saveSettings = () => {
    const tag = document.getElementById('tag').value.trim().toLowerCase();
    const newWords = document.getElementById('words').value.split(',').map(word => word.trim().toLowerCase());
    // 既存の設定を取得し、新しいワードを追加
    chrome.storage.local.get(tag, (result) => {
        const existingWords = result[tag] ? result[tag] : [];
        const updatedWords = Array.from(new Set([...existingWords, ...newWords])); // 重複を排除

        // 更新されたワードリストで設定を保存
        chrome.storage.local.set({[tag]: updatedWords}, () => {
            console.log('設定が更新されました。');
            displayTagsAndWords(); // 設定を保存後、再読み込み
            document.getElementById('reloadSection').style.display = 'block'; // リロードボタンを表示
        });
    });
};

// タグとワードリストを表示する関数
const displayTagsAndWords = () => {
    chrome.storage.local.get(null, (tags) => {
        const tableBody = document.getElementById('tagsTable').querySelector('tbody');
        tableBody.innerHTML = ''; // 既存の行をクリア

        for (let tag in tags) {
            const row = tableBody.insertRow();
            const tagCell = row.insertCell(0);
            const wordsCell = row.insertCell(1);
            const deleteCell = row.insertCell(2);

            tagCell.textContent = tag === '' ? '(global)' : tag;
            wordsCell.textContent = tags[tag].join(', ');

            // 削除ボタンを追加
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&#10060;'; // '×' アイコン
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteTag(tag);
            deleteCell.appendChild(deleteBtn);
        }
    });
};

// タグを削除する関数
const deleteTag = (tag) => {
    // 確認ダイアログを表示
    if (!confirm(`Are you sure you want to delete the tag "${tag}"?`)) {
        return;
    }

    chrome.storage.local.remove(tag, () => {
        console.log(`${tag} has been deleted.`);
        displayTagsAndWords();
        document.getElementById('reloadSection').style.display = 'block'; // リロードボタンを表示
    });
};

// イベントリスナーの設定
document.getElementById('save').addEventListener('click', saveSettings);

// ページロード時に設定を読み込む
window.addEventListener('load', displayTagsAndWords);

// リロードボタンのイベントリスナーを設定
document.getElementById('reload').addEventListener('click', () => {
    // バックグラウンドスクリプトに現在のタブをリロードするように指示
    chrome.runtime.sendMessage({ action: 'reloadActiveTab' });
});

// イベントリスナーの設定
document.getElementById('save').addEventListener('click', saveSettings);
