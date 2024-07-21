// 設定事件監聽器
document.getElementById('toggleSettingsButton').addEventListener('click', () => toggleSection('settings', 'toggleSettingsButton', '隱藏設定 ▲', '顯示設定 ▼'));
document.getElementById('addRoomButton').addEventListener('click', () => toggleSection('addRoomSection', 'addRoomButton', '隱藏 直播間相關設定▲', '顯示 直播間相關設定▼'));
document.getElementById('addShortcutButton').addEventListener('click', () => toggleSection('addShortcutSection', 'addShortcutButton', '隱藏 快捷發送相關設定▲', '顯示 快捷發送相關設定▼'));
document.getElementById('toggleLogButton').addEventListener('click', () => toggleSection('logContainer', 'toggleLogButton', '隱藏Log ▲', '顯示Log ▼'));
document.getElementById('toggleTokenButton').addEventListener('click', () => toggleSection('tokenSection', 'toggleTokenButton', '隱藏Token ▲', '顯示Token ▼'));
document.getElementById('toggleImportExportButton').addEventListener('click', () => toggleSection('importExportSection', 'toggleImportExportButton', '隱藏匯入/匯出 ▲', '顯示匯入/匯出 ▼'));
document.getElementById('toggleOpacityButton').addEventListener('click', () => toggleSection('opacitySection', 'toggleOpacityButton', '隱藏透明度 ▲', '顯示透明度 ▼'));

// 其他事件監聽器
document.getElementById('getRoomIdButton').addEventListener('click', getRoomId);
document.getElementById('saveRoomButton').addEventListener('click', saveRoom);
document.getElementById('deleteRoomButton').addEventListener('click', deleteRoom);
document.getElementById('saveShortcutButton').addEventListener('click', saveShortcut);
document.getElementById('deleteShortcutButton').addEventListener('click', deleteShortcut);
document.getElementById('sendDanmuButton').addEventListener('click', sendDanmu);
document.getElementById('sendShortcutButton').addEventListener('click', sendShortcutDanmu);
document.getElementById('readTokenButton').addEventListener('click', readToken);
document.getElementById('saveTokenButton').addEventListener('click', saveToken);
document.getElementById('importJsonButton').addEventListener('click', () => document.getElementById('importJsonFile').click());
document.getElementById('importJsonFile').addEventListener('change', importJson);
document.getElementById('exportJsonButton').addEventListener('click', exportJson);

// 監聽動作選擇變更
document.getElementById('roomActionSelect').addEventListener('change', handleRoomActionChange);
document.getElementById('shortcutActionSelect').addEventListener('change', handleShortcutActionChange);

// 監聽透明度滑塊變更
document.getElementById('opacityRange').addEventListener('input', (event) => {
    const opacity = event.target.value;
    document.querySelector('.container').style.opacity = opacity;
    document.getElementById('opacityValue').innerText = `透明度: ${opacity}`; // 顯示當前透明度
    // 保存透明度值到 Chrome 存儲
    chrome.storage.local.set({ 'popupOpacity': opacity });
});

// 初始化配置時讀取並應用保存的透明度值
chrome.storage.local.get(['popupOpacity'], function(result) {
    if (result.popupOpacity) {
        const opacity = result.popupOpacity;
        document.querySelector('.container').style.opacity = opacity;
        document.getElementById('opacityRange').value = opacity;
        document.getElementById('opacityValue').innerText = `透明度: ${opacity}`; // 顯示當前透明度
    }
});

// 初始化配置
chrome.storage.local.get(['config'], function(result) {
    if (result.config) {
        loadConfig(result.config);
    } else {
        const config = initializeConfig();
        loadConfig(config);
    }
});

function toggleSection(sectionId, buttonId, showText, hideText) {
    const section = document.getElementById(sectionId);
    const button = document.getElementById(buttonId);
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        button.innerText = showText;
    } else {
        section.style.display = 'none';
        button.innerText = hideText;
    }
}

function handleRoomActionChange() {
    const action = document.getElementById('roomActionSelect').value;
    const roomListSelect = document.getElementById('roomListSelect');
    const roomNameInput = document.getElementById('roomNameInput');
    const roomIdInput = document.getElementById('roomIdInput');
    const saveRoomButton = document.getElementById('saveRoomButton');
    const deleteRoomButton = document.getElementById('deleteRoomButton');
    const getRoomIdButton = document.getElementById('getRoomIdButton');

    roomNameInput.value = '';
    roomIdInput.value = '';

    if (action === 'edit' || action === 'delete') {
        roomListSelect.classList.remove('hidden');
        if (action === 'edit') {
            roomNameInput.classList.remove('hidden');
            roomIdInput.classList.remove('hidden');
            saveRoomButton.classList.remove('hidden');
            deleteRoomButton.classList.add('hidden');
        } else {
            roomNameInput.classList.add('hidden');
            roomIdInput.classList.add('hidden');
            saveRoomButton.classList.add('hidden');
            deleteRoomButton.classList.remove('hidden');
        }
    } else {
        roomListSelect.classList.add('hidden');
        roomNameInput.classList.remove('hidden');
        roomIdInput.classList.remove('hidden');
        saveRoomButton.classList.remove('hidden');
        deleteRoomButton.classList.add('hidden');
    }

    // 檢查是否在 Bilibili 網頁且選擇了新增
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0].url.includes('bilibili.com') && action === 'add') {
            getRoomIdButton.classList.remove('hidden');
        } else {
            getRoomIdButton.classList.add('hidden');
        }
    });

    loadConfigFields();
}

function handleShortcutActionChange() {
    const action = document.getElementById('shortcutActionSelect').value;
    const shortcutListSelect = document.getElementById('shortcutListSelect');
    const buttonNameInput = document.getElementById('buttonNameInput');
    const messageInput = document.getElementById('messageInput');
    const saveShortcutButton = document.getElementById('saveShortcutButton');
    const deleteShortcutButton = document.getElementById('deleteShortcutButton');

    buttonNameInput.value = '';
    messageInput.value = '';

    if (action === 'edit' || action === 'delete') {
        shortcutListSelect.classList.remove('hidden');
        if (action === 'edit') {
            buttonNameInput.classList.remove('hidden');
            messageInput.classList.remove('hidden');
            saveShortcutButton.classList.remove('hidden');
            deleteShortcutButton.classList.add('hidden');
        } else {
            buttonNameInput.classList.add('hidden');
            messageInput.classList.add('hidden');
            saveShortcutButton.classList.add('hidden');
            deleteShortcutButton.classList.remove('hidden');
        }
    } else {
        shortcutListSelect.classList.add('hidden');
        buttonNameInput.classList.remove('hidden');
        messageInput.classList.remove('hidden');
        saveShortcutButton.classList.remove('hidden');
        deleteShortcutButton.classList.add('hidden');
    }

    loadConfigFields();
}

function getRoomId() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            func: () => {
                const roomIdMatch = window.location.href.match(/live\.bilibili\.com\/(\d+)/);
                const roomOwner = document.querySelector('.room-owner-username');
                const roomName = roomOwner ? roomOwner.textContent.trim() : '';
                return { roomId: roomIdMatch ? roomIdMatch[1] : '-1', roomName: roomName };
            }
        }, (results) => {
            if (results && results[0] && results[0].result) {
                document.getElementById('roomIdInput').value = results[0].result.roomId;
                document.getElementById('roomNameInput').value = results[0].result.roomName;
                logMessage('直播間ID 和 名稱 已讀取: ' + results[0].result.roomId + ' (' + results[0].result.roomName + ')');
            } else {
                document.getElementById('roomIdInput').value = '-1';
                logMessage('未找到 直播間ID');
            }
        });
    });
}

function saveRoom() {
    const roomAction = document.getElementById('roomActionSelect').value;
    const roomName = document.getElementById('roomNameInput').value;
    const roomId = document.getElementById('roomIdInput').value;
    const roomErrorMessage = document.getElementById('roomErrorMessage');

    if (roomAction === 'add') {
        chrome.storage.local.get(['config'], function(result) {
            const config = result.config || initializeConfig();
            if (roomId.trim() === '') {
                roomErrorMessage.textContent = '直播間號碼不能為空';
                roomErrorMessage.classList.remove('hidden');
                return;
            }
            if (config.roomList.some(room => room.roomId === roomId)) {
                roomErrorMessage.textContent = '直播間號碼已存在';
                roomErrorMessage.classList.remove('hidden');
                return;
            }
            if (config.roomList.length >= config.roomListMax) {
                roomErrorMessage.textContent = '已達到直播間數量上限';
                roomErrorMessage.classList.remove('hidden');
                return;
            }
            config.roomList.push({ roomName: roomName || '未命名直播間', roomId: roomId });
            chrome.storage.local.set({ config: config }, function() {
                logMessage('直播間已保存: ' + (roomName || '未命名直播間') + ' (' + roomId + ')');
                loadConfig(config);
                roomErrorMessage.classList.add('hidden');
                document.getElementById('roomNameInput').value = '';
                document.getElementById('roomIdInput').value = '';
            });
        });
    } else if (roomAction === 'edit') {
        const roomListSelect = document.getElementById('roomListSelect');
        const selectedRoomIndex = roomListSelect.value;

        chrome.storage.local.get(['config'], function(result) {
            const config = result.config || initializeConfig();
            const selectedRoom = config.roomList[selectedRoomIndex];
            if (!selectedRoom) {
                roomErrorMessage.textContent = '未找到直播間';
                roomErrorMessage.classList.remove('hidden');
                return;
            }
            if (roomId.trim() === '') {
                roomErrorMessage.textContent = '直播間號碼不能為空';
                roomErrorMessage.classList.remove('hidden');
                return;
            }
            selectedRoom.roomName = roomName;
            selectedRoom.roomId = roomId;
            chrome.storage.local.set({ config: config }, function() {
                logMessage('直播間已更新: ' + (roomName || '未命名直播間') + ' (' + roomId + ')');
                loadConfig(config);
                roomErrorMessage.classList.add('hidden');
            });
        });
    }
}

function deleteRoom() {
    const roomListSelect = document.getElementById('roomListSelect');
    const selectedRoomIndex = roomListSelect.value;

    chrome.storage.local.get(['config'], function(result) {
        const config = result.config || initializeConfig();
        const selectedRoom = config.roomList[selectedRoomIndex];
        if (!selectedRoom) {
            roomErrorMessage.textContent = '未找到直播間';
            roomErrorMessage.classList.remove('hidden');
            return;
        }
        config.roomList.splice(selectedRoomIndex, 1);
        chrome.storage.local.set({ config: config }, function() {
            logMessage('直播間已刪除');
            loadConfig(config);
            roomErrorMessage.classList.add('hidden');
        });
    });
}

function saveShortcut() {
    const shortcutAction = document.getElementById('shortcutActionSelect').value;
    const buttonName = document.getElementById('buttonNameInput').value;
    const message = document.getElementById('messageInput').value;
    const shortcutErrorMessage = document.getElementById('shortcutErrorMessage');

    if (shortcutAction === 'add') {
        chrome.storage.local.get(['config'], function(result) {
            const config = result.config || initializeConfig();
            if (message.trim() === '') {
                shortcutErrorMessage.textContent = '發送內容不能為空';
                shortcutErrorMessage.classList.remove('hidden');
                return;
            }
            if (config.messageList.length >= config.messageMax) {
                shortcutErrorMessage.textContent = '已達到快捷發送數量上限';
                shortcutErrorMessage.classList.remove('hidden');
                return;
            }
            config.messageList.push({ buttonName: buttonName || message, message: message });
            chrome.storage.local.set({ config: config }, function() {
                logMessage('快捷發送已保存: ' + (buttonName || message) + ' (' + message + ')');
                loadConfig(config);
                shortcutErrorMessage.classList.add('hidden');
                document.getElementById('buttonNameInput').value = '';
                document.getElementById('messageInput').value = '';
            });
        });
    } else if (shortcutAction === 'edit') {
        const shortcutListSelect = document.getElementById('shortcutListSelect');
        const selectedShortcutIndex = shortcutListSelect.value;

        chrome.storage.local.get(['config'], function(result) {
            const config = result.config || initializeConfig();
            const selectedShortcut = config.messageList[selectedShortcutIndex];
            if (!selectedShortcut) {
                shortcutErrorMessage.textContent = '未找到快捷發送';
                shortcutErrorMessage.classList.remove('hidden');
                return;
            }
            if (message.trim() === '') {
                shortcutErrorMessage.textContent = '發送內容不能為空';
                shortcutErrorMessage.classList.remove('hidden');
                return;
            }
            selectedShortcut.buttonName = buttonName;
            selectedShortcut.message = message;
            chrome.storage.local.set({ config: config }, function() {
                logMessage('快捷發送已更新: ' + (buttonName || message) + ' (' + message + ')');
                loadConfig(config);
                shortcutErrorMessage.classList.add('hidden');
            });
        });
    }
}

function deleteShortcut() {
    const shortcutListSelect = document.getElementById('shortcutListSelect');
    const selectedShortcutIndex = shortcutListSelect.value;

    chrome.storage.local.get(['config'], function(result) {
        const config = result.config || initializeConfig();
        const selectedShortcut = config.messageList[selectedShortcutIndex];
        if (!selectedShortcut) {
            shortcutErrorMessage.textContent = '未找到快捷發送';
            shortcutErrorMessage.classList.remove('hidden');
            return;
        }
        config.messageList.splice(selectedShortcutIndex, 1);
        chrome.storage.local.set({ config: config }, function() {
            logMessage('快捷發送已刪除');
            loadConfig(config);
            shortcutErrorMessage.classList.add('hidden');
        });
    });
}

function sendDanmu() {
    const roomSelect = document.getElementById('roomSelect');
    const roomIndex = roomSelect.value;
    const message = document.getElementById('danmuInput').value;

    chrome.storage.local.get(['config'], function(result) {
        const config = result.config || initializeConfig();
        const room = config.roomList[roomIndex];
        if (!room) {
            logMessage('請選擇一個有效的直播間');
            return;
        }

        const roomId = room.roomId;
        const token = config.token;

        if (!token) {
            logMessage('請先設定 Token');
            document.getElementById('noTokenMessage').classList.remove('hidden');
            return;
        }

        sendDanmuMessage(roomId, message, token);
    });

    document.getElementById('danmuInput').value = '';
}

function sendShortcutDanmu() {
    const roomSelect = document.getElementById('roomSelect');
    const roomIndex = roomSelect.value;
    const shortcutSelect = document.getElementById('shortcutSelect');
    const shortcutIndex = shortcutSelect.value;

    chrome.storage.local.get(['config'], function(result) {
        const config = result.config || initializeConfig();
        const room = config.roomList[roomIndex];
        const shortcut = config.messageList[shortcutIndex];

        if (!room || !shortcut) {
            logMessage('請選擇一個有效的直播間和快捷發送');
            return;
        }

        const roomId = room.roomId;
        const message = shortcut.message;
        const token = config.token;

        if (!token) {
            logMessage('請先設定 Token');
            document.getElementById('noTokenMessage').classList.remove('hidden');
            return;
        }

        sendDanmuMessage(roomId, message, token);
    });
}

function sendDanmuMessage(roomId, message, token) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            func: (roomId, message, token) => {
                window.postMessage({
                    type: 'sendDanmu',
                    roomId: roomId,
                    message: message,
                    token: token
                }, '*');
            },
            args: [roomId, message, token]
        });
    });
    logMessage('發送彈幕命令已發送');
}

function logMessage(message) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function loadConfig(config) {
    const roomSelect = document.getElementById('roomSelect');
    const shortcutSelect = document.getElementById('shortcutSelect');
    const roomContainer = document.getElementById('roomContainer');
    const shortcutContainer = document.getElementById('shortcutContainer');
    const noRoomMessage = document.getElementById('noRoomMessage');
    const tokenInput = document.getElementById('tokenInput');
    const noTokenMessage = document.getElementById('noTokenMessage');
    const roomErrorMessage = document.getElementById('roomErrorMessage');
    const shortcutErrorMessage = document.getElementById('shortcutErrorMessage');
    const roomListSelect = document.getElementById('roomListSelect');
    const shortcutListSelect = document.getElementById('shortcutListSelect');

    roomSelect.innerHTML = '';
    shortcutSelect.innerHTML = '';
    roomListSelect.innerHTML = '';
    shortcutListSelect.innerHTML = '';

    if (config.roomList.length > 0) {
        roomContainer.classList.remove('hidden');
        if (noRoomMessage) {
            noRoomMessage.classList.add('hidden');
        } else {
            console.error('noRoomMessage element not found');
        }
        roomSelect.innerHTML = config.roomList.map((room, index) => `<option value="${index}">${room.roomName}</option>`).join('');
        roomListSelect.innerHTML = config.roomList.map((room, index) => `<option value="${index}">${room.roomName}</option>`).join('');
        roomSelect.value = config.roomListIndex || 0;
    } else {
        roomContainer.classList.add('hidden');
        if (noRoomMessage) {
            noRoomMessage.classList.remove('hidden');
        } else {
            console.error('noRoomMessage element not found');
        }
    }

    if (config.messageList.length > 0) {
        shortcutContainer.classList.remove('hidden');
        shortcutSelect.innerHTML = config.messageList.map((shortcut, index) => `<option value="${index}">${shortcut.buttonName}</option>`).join('');
        shortcutListSelect.innerHTML = config.messageList.map((shortcut, index) => `<option value="${index}">${shortcut.buttonName}</option>`).join('');
        shortcutSelect.value = config.messageListIndex || 0;
    } else {
        shortcutContainer.classList.add('hidden');
    }

    if (config.roomList.length >= config.roomListMax) {
        if (roomErrorMessage) {
            roomErrorMessage.textContent = '已達到直播間數量上限';
            roomErrorMessage.classList.remove('hidden');
        } else {
            console.error('roomErrorMessage element not found');
        }
    } else {
        if (roomErrorMessage) {
            roomErrorMessage.classList.add('hidden');
        } else {
            console.error('roomErrorMessage element not found');
        }
    }

    if (config.messageList.length >= config.messageMax) {
        if (shortcutErrorMessage) {
            shortcutErrorMessage.textContent = '已達到快捷發送數量上限';
            shortcutErrorMessage.classList.remove('hidden');
        } else {
            console.error('shortcutErrorMessage element not found');
        }
    } else {
        if (shortcutErrorMessage) {
            shortcutErrorMessage.classList.add('hidden');
        } else {
            console.error('shortcutErrorMessage element not found');
        }
    }

    if (config.token) {
        if (tokenInput) {
            tokenInput.value = config.token;
        } else {
            console.error('tokenInput element not found');
        }
        if (noTokenMessage) {
            noTokenMessage.classList.add('hidden');
        } else {
            console.error('noTokenMessage element not found');
        }
    } else {
        if (tokenInput) {
            tokenInput.value = '';
        } else {
            console.error('tokenInput element not found');
        }
        if (noTokenMessage) {
            noTokenMessage.classList.remove('hidden');
        } else {
            console.error('noTokenMessage element not found');
        }
    }

    // 如果沒有直播間，僅顯示新增選項
    if (config.roomList.length === 0) {
        document.getElementById('roomActionSelect').innerHTML = '<option value="add">新增</option>';
        handleRoomActionChange();  // 更新動作選擇變更的顯示
    }

    // 如果沒有快捷發送，僅顯示新增選項
    if (config.messageList.length === 0) {
        document.getElementById('shortcutActionSelect').innerHTML = '<option value="add">新增</option>';
        handleShortcutActionChange();  // 更新動作選擇變更的顯示
    }
}

function initializeConfig() {
    // const defaultConfig = {
    //     roomListMax: 10,
    //     roomListIndex: 0,
    //     roomList: [],
    //     messageMax: 10,
    //     messageListIndex: 0,
    //     messageList: [],
    //     token: ''
    // };
    const defaultConfig = {
        "roomListMax": 10,
        "roomListIndex": 0,
        "roomList": [
          {
            "roomName": "七七",
            "roomId": "23899550"
          }
        ],
        "messageMax": 10,
        "messageListIndex": 0,
        "messageList": [
          {
            "buttonName": "gachi",
            "message": "七七天下第一可愛！"
          },
          {
            "buttonName": "anti",
            "message": "七七是墊的！"
          }
        ]
      };
    chrome.storage.local.set({ config: defaultConfig });
    return defaultConfig;
}

function readToken() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            func: () => {
                const match = document.cookie.match(/bili_jct=([^;]*)/);
                return match ? match[1] : null;
            }
        }, (results) => {
            if (results && results[0] && results[0].result) {
                const csrfToken = results[0].result;
                document.getElementById('tokenInput').value = csrfToken;
                logMessage('Token 已讀取: ' + csrfToken);
                document.getElementById('noTokenMessage').classList.add('hidden');
            } else {
                document.getElementById('tokenInput').value = '';
                logMessage('未找到 Token，請確保已登入 Bilibili 賬號');
                document.getElementById('noTokenMessage').classList.remove('hidden');
            }
        });
    });
}

function saveToken() {
    const token = document.getElementById('tokenInput').value;
    if (token.trim() !== '') {
        chrome.storage.local.get(['config'], function(result) {
            const config = result.config || initializeConfig();
            config.token = token;
            chrome.storage.local.set({ config: config }, function() {
                logMessage('Token 已保存: ' + token);
                document.getElementById('noTokenMessage').classList.add('hidden');
            });
        });
    } else {
        logMessage('Token 不能為空');
        document.getElementById('noTokenMessage').classList.remove('hidden');
    }
}

// 檢查是否在 Bilibili 網頁
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0].url.includes('bilibili.com')) {
        document.getElementById('readTokenButton').classList.remove('hidden');
        document.getElementById('getRoomIdButton').classList.remove('hidden');
    }
});

// 紀錄選擇位置
document.getElementById('roomSelect').addEventListener('change', function() {
    const roomIndex = document.getElementById('roomSelect').value;
    chrome.storage.local.get(['config'], function(result) {
        const config = result.config || initializeConfig();
        config.roomListIndex = roomIndex;
        chrome.storage.local.set({ config: config });
    });
});

document.getElementById('shortcutSelect').addEventListener('change', function() {
    const shortcutIndex = document.getElementById('shortcutSelect').value;
    chrome.storage.local.get(['config'], function(result) {
        const config = result.config || initializeConfig();
        config.messageListIndex = shortcutIndex;
        chrome.storage.local.set({ config: config });
    });
});

function importJson(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (validateJson(json)) {
                chrome.storage.local.get(['config'], function(result) {
                    const currentConfig = result.config || initializeConfig();
                    // 保留現有的 token 如果 JSON 沒有提供 token
                    if (!json.token) {
                        json.token = currentConfig.token;
                    }
                    chrome.storage.local.set({ config: json }, function() {
                        logMessage('配置已成功匯入');
                        loadConfig(json);
                    });
                });
            } else {
                alert('JSON 文件格式錯誤');
            }
        } catch (error) {
            alert('匯入 JSON 時發生錯誤: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function validateJson(json) {
    const requiredFields = ['roomListMax', 'roomListIndex', 'roomList', 'messageMax', 'messageListIndex', 'messageList'];
    return requiredFields.every(field => json.hasOwnProperty(field));
}

function exportJson() {
    chrome.storage.local.get(['config'], function(result) {
        const config = result.config || initializeConfig();
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.json';
        a.click();
        URL.revokeObjectURL(url);
        logMessage('配置已成功匯出');
    });
}

function loadConfigFields() {
    const roomAction = document.getElementById('roomActionSelect').value;
    const shortcutAction = document.getElementById('shortcutActionSelect').value;
    const roomListSelect = document.getElementById('roomListSelect');
    const shortcutListSelect = document.getElementById('shortcutListSelect');

    if (roomAction === 'edit') {
        const selectedRoomIndex = roomListSelect.value;
        chrome.storage.local.get(['config'], function(result) {
            const config = result.config || initializeConfig();
            const selectedRoom = config.roomList[selectedRoomIndex];
            if (selectedRoom) {
                document.getElementById('roomNameInput').value = selectedRoom.roomName;
                document.getElementById('roomIdInput').value = selectedRoom.roomId;
            }
        });
    }

    if (shortcutAction === 'edit') {
        const selectedShortcutIndex = shortcutListSelect.value;
        chrome.storage.local.get(['config'], function(result) {
            const config = result.config || initializeConfig();
            const selectedShortcut = config.messageList[selectedShortcutIndex];
            if (selectedShortcut) {
                document.getElementById('buttonNameInput').value = selectedShortcut.buttonName;
                document.getElementById('messageInput').value = selectedShortcut.message;
            }
        });
    }
}
