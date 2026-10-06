霍格華茲社刊：Firebase 同步版

使用方式
閱讀不需要登入。網站會自動建立匿名身分，新增社刊按儲存後同步給其他讀者。
只有原建立者可以編輯或刪除；身分綁定原瀏覽器，換裝置或清除網站資料會失去管理權。
圖片支援文繞圖、寬度與圖下備註。大張圖片會縮小，以節省資料庫空間。
同一篇若被另一個視窗改過，儲存時會提示衝突，保留目前草稿。
舊版已發布社刊繼續顯示，但沒有建立者身分，暫時不開放編輯或刪除。

第一次設定（Firebase 專案 hogwarts-journal）
1. Authentication → 開始使用 → Sign-in method → Anonymous（匿名）→ 啟用 → 儲存。
2. Firestore Database → 建立資料庫 → Standard edition（標準版）→ 選地區 → 正式版模式。
3. Firestore Database → 規則 → 貼上 firestore.rules 的完整內容 → 發布。
   若同專案已有其他應用程式，請保留既有規則，只加入 /hogwartsJournalPages 的 match 區塊。
4. GitHub 儲存庫 casita3167/hogwarts-journal：上傳 index.html、firebase-config.js、sync.js 到最外層。
   原本 journal.json 保留，不要刪除；它包含先前已發布內容。
5. 等 GitHub Pages 更新完成，Ctrl+F5 重新整理。
   「更新內容」面板會顯示「已連線」。之後新增、儲存、刪除均直接同步，不使用 GitHub 權杖。

驗證
用一個瀏覽器新增測試頁，第二個瀏覽器應自動看到。
第二個瀏覽器不應顯示該頁的編輯／刪除按鈕。
回原瀏覽器編輯或刪除，第二個瀏覽器應同步變更。

限制
每篇圖片與文字合計約 850 KB；過大時請減少圖片或拆成兩篇。圖片儲存於 Firestore，不需要啟用 Cloud Storage。
免費額度內仍有使用量限制，實際用量請查看 Firebase 控制台。
Firebase Web config 是公开設定；真正的編輯與刪除權限由 firestore.rules 強制檢查。
公開投稿沒有內容審核功能；本版權限限制為只能修改或刪除自己建立的頁面。
