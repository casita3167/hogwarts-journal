/* 此檔案只保存公開 Firebase Web 設定，不需要 GitHub 權杖。 */
(async()=>{
const state=window.journalSync={ready:false,uid:null,db:null,api:null};
const notice=document.querySelector('#syncStatus');
const message=t=>{notice.textContent=t};
window.canEditJournalPage=p=>!!(state.ready&&p&&p.ownerUid===state.uid&&p.cloudId);
window.saveJournalPage=async(page,old)=>{
 if(!state.ready)throw new Error('同步尚未連線，內容已保留在編輯器。');
 if(old&&!canEditJournalPage(old))throw new Error('只有建立者可以修改這一頁。');
 if(new TextEncoder().encode(JSON.stringify(page)).length>850000)throw new Error('這篇圖片與文字合計過大，請縮小圖片或拆成兩篇後再儲存。');
 const {doc,collection,runTransaction,serverTimestamp}=state.api;
 const ref=old?doc(state.db,'hogwartsJournalPages',old.cloudId):doc(collection(state.db,'hogwartsJournalPages'));
 await runTransaction(state.db,async tx=>{let revision=0;if(old){const snap=await tx.get(ref);if(!snap.exists())throw new Error('這頁已被刪除。');const data=snap.data();if(data.ownerUid!==state.uid)throw new Error('只有建立者可以修改這一頁。');if(data.revision!==old.revision)throw new Error('另一個視窗已更新此頁，請重新開啟最新版再編輯。');revision=data.revision}
 const content={name:page.name,year:page.year,size:page.size||16,html:page.html||'',src:page.src||'',ownerUid:state.uid,revision:revision+1,updatedAt:serverTimestamp()};
 if(!old)content.createdAt=serverTimestamp();tx.set(ref,content,{merge:!!old});});
 return ref.id;
};
window.deleteJournalPage=async page=>{if(!canEditJournalPage(page))throw new Error('只有建立者可以刪除這一頁。');await state.api.runTransaction(state.db,async tx=>{const ref=state.api.doc(state.db,'hogwartsJournalPages',page.cloudId),snap=await tx.get(ref);if(!snap.exists())return;if(snap.data().revision!==page.revision)throw new Error('這頁剛被更新，請查看最新版後再刪除。');tx.delete(ref)})};
try{
const config=window.JOURNAL_FIREBASE_CONFIG;
if(!config?.apiKey||!config?.projectId){message('尚未設定共用資料庫；請先完成 Firebase 連線。');return}
const base='https://www.gstatic.com/firebasejs/12.19.0/';
const [appSDK,authSDK,dbSDK]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
const app=appSDK.initializeApp(config),auth=authSDK.getAuth(app);
await authSDK.setPersistence(auth,authSDK.browserLocalPersistence);
if(typeof auth.authStateReady==='function')await auth.authStateReady();
const user=auth.currentUser||(await authSDK.signInAnonymously(auth)).user;
state.uid=user.uid;state.db=dbSDK.getFirestore(app);state.api=dbSDK;
let baseline=JSON.parse(document.querySelector('#initial').textContent);
try{const r=await fetch(new URL('journal.json',location.href),{cache:'no-store'});if(r.ok){const data=await r.json();if(Array.isArray(data.pages))baseline=data.pages}}catch(e){}
baseline=baseline.map(p=>({...p,cloudId:null,ownerUid:null}));
state.ready=true;
dbSDK.onSnapshot(dbSDK.collection(state.db,'hogwartsJournalPages'),snapshot=>{
 const live=snapshot.docs.map(d=>({...d.data(),cloudId:d.id})).sort((a,b)=>(a.createdAt?.toMillis?.()||0)-(b.createdAt?.toMillis?.()||0)||a.cloudId.localeCompare(b.cloudId));
 pages=[...baseline,...live.map(p=>({...p,...(p.html?{html:clean(p.html)}:{})}))];pageCache.clear();render();
 message('已連線：儲存後自動同步。只有建立者能修改、刪除自己的頁面。');
},e=>{state.ready=false;message('同步失敗：'+(e.code==='permission-denied'?'請檢查 Firestore 權限規則。':e.message))});
}catch(e){message('無法連線：'+(e.code==='auth/operation-not-allowed'?'請在 Firebase Authentication 啟用匿名登入。':e.message))}
})();
