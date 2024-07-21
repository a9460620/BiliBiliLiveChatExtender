# BiliBiliLiveChatExtender

### 專案介紹與使用說明

這是一個可以在任何網頁發送 Bilibili 彈幕的 Chrome 擴展與 Tampermonkey 腳本組合。擴展允許用戶在任何網頁中通過快捷按鈕發送彈幕至指定的 Bilibili 直播間。以下是如何安裝和使用該擴展的詳細說明。

### 安裝指南

1. **下載或克隆此專案**
   ```
   git clone <repository-url>
   ```
   或直接下載壓縮包並解壓縮。

2. **安裝 Chrome 擴展**
   - 打開 Chrome 瀏覽器，輸入 `chrome://extensions/`。
   - 打開開發者模式。
   - 點擊 "加載已解壓的擴展程序"，選擇剛剛下載並解壓的專案目錄。

3. **安裝 Tampermonkey 腳本**
   - 確保已安裝 Tampermonkey 擴展（可以從 [Chrome 網上應用商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) 安裝）。
   - 打開 Tampermonkey 儀表板，點擊 "新增腳本"。
   - 將以下腳本代碼複製並粘貼到 Tampermonkey 編輯器中，然後保存。
   ```javascript
   // ==UserScript==
   // @name        BiliBiliLiveChatExtender(腳本端)
   // @namespace    http://tampermonkey.net/
   // @version      2.1
   // @description  在任何網頁發送Bilibili彈幕的腳本
   // @author       Your Name
   // @match        *://*/*
   // @grant        GM_getValue
   // @grant        GM_setValue
   // @grant        GM_xmlhttpRequest
   // @connect      api.live.bilibili.com
   // ==/UserScript==

   (function() {
       'use strict';

       // 接收來自擴展的消息
       window.addEventListener('message', function(event) {
           console.log("收到消息:", event.data);
           if (!event.data.type) {
               console.log("消息類型不存在");
               return;
           }
           if (event.data.type == 'sendDanmu') {
               const { roomId, message, token } = event.data;
               console.log("開始發送彈幕，直播間ID:", roomId, "彈幕內容:", message, "Token:", token);
               sendDanmu(roomId, message, token);
           }
       });

       // 发送弹幕函数
       function sendDanmu(roomId, message, token) {
           if (!token || token.trim() === '') {
               console.log('未找到 CSRF Token，請確保已登入');
               return;
           } else {
               console.log('Token:', token);
           }

           if (!roomId || roomId.trim() === '') {
               console.log('直播间ID不能为空');
               return;
           } else {
               console.log('直播间ID:', roomId);
           }

           const csrfToken = token;

           const statistics = encodeURIComponent(JSON.stringify({ appId: 100, platform: 5 }));
           const danmuData = `bubble=5&msg=${encodeURIComponent(message)}&color=16772431&mode=4&room_type=0&jumpfrom=86002&reply_mid=0&reply_attr=0&replay_dmid=&statistics=${statistics}&fontsize=25&rnd=${Math.floor(Date.now() / 1000)}&roomid=${roomId}&csrf=${csrfToken}&csrf_token=${csrfToken}`;

           console.log('彈幕數據:', danmuData);

           // 設置 cookie，確保身份驗證信息被攜帶
           GM_xmlhttpRequest({
               method: 'POST',
               url: 'https://api.live.bilibili.com/msg/send',
               headers: {
                   'Content-Type': 'application/x-www-form-urlencoded'
               },
               data: danmuData,
               onload: function(response) {
                   if (response.status === 200) {
                       console.log('弹幕发送成功：', response.responseText);
                   } else {
                       console.log('弹幕发送失败：', response.responseText);
                   }
               },
               onerror: function(response) {
                   console.log('弹幕发送错误：', response.responseText);
               }
           });
       }
   })();
   ```

### 使用說明

1. **打開 Bilibili 直播間**
   - 在 Chrome 瀏覽器中打開一個 Bilibili 直播間。

2. **配置擴展**
   - 點擊瀏覽器右上角的擴展圖標，打開配置頁面。
   - 添加或選擇直播間和快捷發送的消息。
   - 如果是在 Bilibili 網頁中，可以點擊 "讀取當前直播間號碼" 按鈕自動獲取直播間 ID。

3. **發送彈幕**
   - 在任意網頁中，使用快捷發送按鈕或手動輸入消息並發送彈幕。

### 注意事項

- **同一瀏覽器的不同標籤頁：**
  在同一個 Chrome 瀏覽器的不同標籤頁（A 標籤頁是 Bilibili，B 和 C 標籤頁）中，可以正常使用擴展發送彈幕。

- **不同瀏覽器或不同瀏覽器窗口：**
  如果在不同的 Chrome 瀏覽器窗口或不同的瀏覽器中使用擴展，會出現無法發送彈幕的情況。

### 示例

- **相同瀏覽器的多標籤頁：**

  ```
  Chrome 瀏覽器：
  - A 標籤頁 (Bilibili)
  - B 標籤頁 (其他網頁)
  - C 標籤頁 (其他網頁)
  ```

  在 B 和 C 標籤頁中使用擴展發送彈幕，可以成功發送至 A 標籤頁的 Bilibili 直播間。

- **不同瀏覽器窗口：**

  ```
  Chrome 瀏覽器 A 窗口：
  - A 標籤頁 (Bilibili)
  
  Chrome 瀏覽器 B 窗口：
  - B 標籤頁 (其他網頁)
  - C 標籤頁 (其他網頁)
  ```

  在 B 和 C 標籤頁中使用擴展發送彈幕，可能無法成功發送至 A 標籤頁的 Bilibili 直播間。

### 貢獻

如果您想為此專案做出貢獻，歡迎提交 Pull Request 或提出 Issue。

### 許可

此專案使用 The Unlicense 許可證。詳細信息請參閱 [LICENSE](LICENSE) 文件。
