# Bookmark Manager Browser Extension 仕様書

## 1. プロジェクト概要

### 1.1 目的
ブラウザのブックマーク管理を効率化するための拡張機能。重複ブックマークの検出、リンク切れの検出、ブックマークの自動分類機能を提供する。

### 1.2 ターゲットユーザー
- 大量のブックマークを管理しているユーザー
- ブックマークの整理を効率化したいユーザー

### 1.3 対応ブラウザ
| ブラウザ | Manifest Version | 対応状況 |
|---------|------------------|---------|
| Chrome | MV3 | ✅ 対応 |
| Firefox | MV2 | ✅ 対応 |
| Edge | MV3 | ✅ 対応 |
| Opera | MV3 | ✅ 対応 |
| Brave | MV3 | ✅ 対応 |

---

## 2. 機能仕様

### 2.1 重複ブックマーク検出機能
**ステータス**: 実装済み

**概要**: 同一URLを持つ重複したブックマークを検出する

**動作フロー**:
1. ユーザーがPopupの「Check Duplicates」ボタンをクリック
2. Background Service Workerにメッセージ送信
3. `chrome.bookmarks.getTree()` でブックマーク全体を取得
4. URLをキーとしてブックマークをマッピング
5. 2つ以上存在するURLを重複として検出
6. コンソールに結果を出力

**データ構造**:
```typescript
interface DuplicateResult {
  url: string                          // 重複URL
  nodes: chrome.bookmarks.BookmarkTreeNode[]  // 該当ブックマーク一覧
  count: number                        // 重複数
}
```

### 2.2 リンク切れ検出機能
**ステータス**: 未実装（スタブのみ）

**概要**: ブックマークされたURLが有効かどうかを確認する

**予定動作**:
1. ブックマーク一覧を取得
2. 各URLに対してHTTPリクエストを送信
3. レスポンスステータスを確認（404等を検出）
4. リンク切れのブックマークをリスト表示

### 2.3 自動カテゴリ分類機能
**ステータス**: 未実装（スタブのみ）

**概要**: ブックマークを内容に基づいて自動的にカテゴリ分けする

**予定動作**:
1. ブックマークのURLとタイトルを分析
2. ドメインやキーワードに基づいてカテゴリを推定
3. 提案されたカテゴリをユーザーに表示
4. ユーザー承認後、フォルダに整理

---

## 3. 技術仕様

### 3.1 技術スタック

#### フロントエンド
| 技術 | バージョン | 用途 |
|-----|-----------|------|
| React | 18.2.0 | UIコンポーネント |
| TypeScript | 4.9.5 | 型安全な開発 |
| Redux Toolkit | ^1.9.5 | 状態管理 |
| TailwindCSS | ^3.3.2 | スタイリング |

#### ビルドツール
| ツール | バージョン | 用途 |
|-------|-----------|------|
| Vite | ^4.3.9 | ビルド・開発サーバー |
| @crxjs/vite-plugin | ^2.0.0-beta.17 | 拡張機能バンドル |

#### 拡張機能固有
| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| webext-redux | 3.0.1-rc | コンテキスト間状態管理 |
| webextension-polyfill | ^0.10.0 | クロスブラウザ互換 |
| redux-persist | ^7.2.1 | 状態永続化 |

### 3.2 ディレクトリ構成

```
bookmark/
├── src/
│   ├── app/                    # Redux関連
│   │   ├── features/           # 機能別スライス
│   │   │   └── counter/        # カウンター（デモ）
│   │   ├── store.ts            # Reduxストア設定
│   │   ├── proxyStore.ts       # プロキシストア
│   │   └── hooks.ts            # カスタムフック
│   ├── background/             # バックグラウンドスクリプト
│   │   └── index.ts            # Service Worker
│   ├── content/                # コンテンツスクリプト
│   │   ├── Content.tsx         # 注入コンポーネント
│   │   └── index.tsx           # エントリーポイント
│   ├── popup/                  # ポップアップUI
│   │   ├── Popup.tsx           # メインコンポーネント
│   │   └── popup.html          # HTMLテンプレート
│   ├── options/                # 設定ページ
│   └── welcome/                # 初回インストール画面
├── public/
│   └── images/                 # 拡張機能アイコン
├── tools/                      # ビルドツール
└── dist/                       # ビルド出力
```

### 3.3 アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Extension                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────────────┐    ┌──────────────┐   │
│  │  Popup   │◄──►│   Background     │◄──►│   Content    │   │
│  │   UI     │    │  Service Worker  │    │   Script     │   │
│  └────┬─────┘    └────────┬─────────┘    └──────┬───────┘   │
│       │                   │                      │           │
│       │                   │                      │           │
│       ▼                   ▼                      ▼           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Redux Store                       │    │
│  │              (webext-redux + persist)               │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Chrome APIs                          │    │
│  │     (bookmarks, storage, tabs, runtime)             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. UI仕様

### 4.1 Popup UI

**サイズ**: 幅30rem × 高さ15rem

**レイアウト**:
```
┌─────────────────────────────────────┐
│  Bookmark Manager                    │
├─────────────────────────────────────┤
│                                     │
│  [Check Duplicates]                 │
│                                     │
│  [Check Broken Links]               │
│                                     │
│  [Categorize Bookmarks]             │
│                                     │
│  ─────────────────────────          │
│  Counter: [−] 0 [+]                 │
│  [Add Amount] [Add Async]           │
│                                     │
└─────────────────────────────────────┘
```

**ボタン機能**:
| ボタン | アクション | 状態 |
|--------|-----------|------|
| Check Duplicates | 重複検出実行 | 実装済み |
| Check Broken Links | リンク切れ検出 | 未実装 |
| Categorize Bookmarks | 自動分類実行 | 未実装 |

### 4.2 Content Script UI

**配置**: 画面右下固定（z-index: 999）

**機能**: Reduxストアと連携したカウンターウィジェット（デモ用）

**特徴**:
- Shadow DOMでスタイル分離
- twindによるTailwind CSSランタイム適用

### 4.3 Options Page
**ステータス**: 未実装（プレースホルダー）

**予定機能**:
- 検出設定のカスタマイズ
- 通知設定
- データエクスポート/インポート

### 4.4 Welcome Page
**ステータス**: 未実装（プレースホルダー）

**表示タイミング**: 拡張機能の初回インストール時

---

## 5. API仕様

### 5.1 Chrome Extension API

#### 使用API一覧
| API | 用途 |
|-----|------|
| `chrome.bookmarks` | ブックマーク操作 |
| `chrome.runtime` | メッセージ通信 |
| `chrome.tabs` | タブ操作 |
| `chrome.storage` | データ永続化 |

#### Manifest権限
```json
{
  "permissions": ["storage", "tabs"],
  "host_permissions": ["<all_urls>"]
}
```

### 5.2 内部メッセージAPI

**メッセージ形式**:
```typescript
interface ExtensionMessage {
  action: 'checkDuplicates' | 'checkBrokenLinks' | 'categorizeBookmarks'
  payload?: unknown
}
```

**通信フロー**:
```
Popup → chrome.runtime.sendMessage() → Background
Background → chrome.runtime.onMessage.addListener() → 処理実行
```

---

## 6. データ仕様

### 6.1 Redux State構造

```typescript
interface RootState {
  counter: CounterState
  // 今後追加予定
  // bookmarks: BookmarksState
  // settings: SettingsState
}

interface CounterState {
  value: number
  status: 'idle' | 'loading' | 'failed'
}
```

### 6.2 永続化設定

**ストレージ**: localStorage（redux-persist経由）

**永続化キー**: `root`

**バージョン**: 1

---

## 7. ビルド・デプロイ

### 7.1 開発コマンド

```bash
# 開発サーバー起動（HMR対応）
yarn dev

# プロダクションビルド
yarn build

# Firefox用MV2ビルド
yarn firefox-mv2-build

# テスト実行
yarn test

# リント実行
yarn lint

# フォーマット修正
yarn format
```

### 7.2 出力ディレクトリ

| ディレクトリ | 内容 |
|-------------|------|
| `dist/` | Manifest V3ビルド（Chrome/Edge/Opera/Brave） |
| `dist-firefox-v2/` | Manifest V2ビルド（Firefox） |

### 7.3 CI/CD

**GitHub Actions**による自動化:
- ビルド検証
- ESLint/Prettierチェック
- Jestテスト実行

---

## 8. テスト仕様

### 8.1 テストフレームワーク
- **Jest** + **React Testing Library**
- **jest-chrome**: Chrome API モック

### 8.2 テストファイル
| ファイル | 対象 |
|---------|------|
| `background.spec.ts` | Background Service Worker |
| `Popup.spec.tsx` | Popup コンポーネント |
| `Content.spec.tsx` | Content Script |
| `Options.spec.tsx` | Options ページ |
| `Welcome.spec.tsx` | Welcome ページ |
| `counterSlice.spec.ts` | Counter Redux Slice |

### 8.3 テスト実行
```bash
yarn test           # ローカル実行
yarn ci:test        # CI環境用
```

---

## 9. 今後の開発予定

### Phase 1: 基本機能完成
- [ ] リンク切れ検出機能の実装
- [ ] 自動カテゴリ分類機能の実装
- [ ] 重複検出結果のUI表示

### Phase 2: UI改善
- [ ] Options ページの実装
- [ ] Welcome ページの実装
- [ ] 検出結果の詳細表示モーダル

### Phase 3: 高度な機能
- [ ] ブックマークの一括削除機能
- [ ] カテゴリのカスタマイズ
- [ ] エクスポート/インポート機能

---

## 10. プロジェクト情報

| 項目 | 値 |
|-----|-----|
| バージョン | 0.1.0 |
| ライセンス | MIT |
| Node.js | 16+ |
| パッケージマネージャー | Yarn |
| TypeScript Target | ES6 |

---

**作成日**: 2025-11-27
**最終更新**: 2025-11-27
