import browser from 'webextension-polyfill';
import store, { initializeWrappedStore } from '../app/store';

initializeWrappedStore();

store.subscribe(() => {
  // access store state
  // const state = store.getState();
  // console.log('state', state);
});

// show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    //show the welcome page
    const url = browser.runtime.getURL('welcome/welcome.html');
    await browser.tabs.create({ url });
  }
});

const checkDuplicates = () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const duplicates = findDuplicates(bookmarkTreeNodes);
    if (duplicates.length > 0) {
      console.log('Duplicates found:', duplicates);
    } else {
      console.log('No duplicates found.');
    }
  });
};

const findDuplicates = (bookmarks: chrome.bookmarks.BookmarkTreeNode[]) => {
  const urls: { [key: string]: boolean } = {}; // 型定義を追加

  const duplicates: unknown[] = [];
  const traverse = (bookmarkNodes: chrome.bookmarks.BookmarkTreeNode[]) => {
    for (const node of bookmarkNodes) {
      // forEachをfor...ofに変更
      if (node.url) {
        if (urls[node.url]) {
          duplicates.push(node);
        } else {
          urls[node.url] = true;
        }
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  };

  traverse(bookmarks);
  return duplicates;
};

// ブラウザアクションやポップアップからメッセージを受信したときのハンドラ
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkDuplicates') {
    checkDuplicates();
  }
});
