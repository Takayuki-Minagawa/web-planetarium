# Web Planetarium

ブラウザ上で動作するプラネタリウムアプリケーションです。  
観測地点と日時をもとに、現在の星空をリアルタイムに再現します。

**https://takayuki-minagawa.github.io/web-planetarium/**

---

## 特徴

- **リアルタイム星空表示** - 指定した地点・日時の星空を Canvas で描画します
- **星座・恒星・惑星の表示** - 代表的な星座（12星座）、主要な恒星（36星）、5惑星、太陽、月を収録しています
- **天体の検索と詳細表示** - サイドバーから天体を選択すると、視点移動・ハイライト・詳細情報の表示を行います
- **現在見える天体の一覧** - 観測地点・時刻に基づいて、地平線より上にある天体を一覧で確認できます
- **観測条件の変更** - 日時の変更、都市の切り替え、現在地取得（Geolocation API）、緯度経度の手入力に対応しています
- **表示のカスタマイズ** - 星座線・星座名・恒星名・惑星名・地平線・グリッドの表示切替が可能です
- **直感的な操作** - ドラッグで視点移動、ホイールで拡大縮小ができます
- **今夜の見どころ** - 初回訪問時に、今夜の月・明るい星・見ごろの星座・見える惑星を紹介し、ワンタップでその天体へ案内します
- **星空図鑑** - 詳細を開いた天体が記録され、進捗リングで達成度がわかります。「次の発見へ」でまだ見ていない天体へ案内します
- **時間の早送り** - ▶ ボタンや ±1時間ボタンで時間を進め、星が東から西へ動く様子を観察できます
- **わかりやすい解説** - 「南東の空・高さ35°」のような言葉と全天図、明るさメーターで天体の位置と明るさを直感的に示します
- **天の川・太陽の描画** - 銀河面に沿った天の川と太陽を表示し、星はわずかにまたたきます
- **レスポンシブ対応** - PC・スマートフォンの両方で利用できます（ピンチ操作でのズームにも対応）
- **アクセシビリティ** - キーボード操作（矢印キー・＋／－・Esc）、フォーカス表示、動きを減らす設定（prefers-reduced-motion）に対応しています
- **静的サイトとして動作** - サーバー不要で、GitHub Pages 上に公開しています

## 技術構成

| 分類 | 使用技術 |
|------|----------|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite 8 |
| スタイリング | Tailwind CSS 4 |
| 状態管理 | Zustand |
| 天体位置計算 | [Astronomy Engine](https://github.com/cosinekitty/astronomy) |
| 日の出入り・月相計算 | [SunCalc](https://github.com/mourner/suncalc) |
| 星空描画 | Canvas API |
| CI/CD | GitHub Actions |
| ホスティング | GitHub Pages |

## ローカルでの実行

Node.js 20 以上が必要です。

```bash
git clone https://github.com/Takayuki-Minagawa/web-planetarium.git
cd web-planetarium
npm install
npm run dev
```

開発サーバーが起動し、`http://localhost:5173` でアクセスできます。

### その他のコマンド

```bash
npm run build    # 本番用ビルド（dist/ に出力）
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLint による静的解析
```

## ディレクトリ構成

```
src/
├── components/
│   ├── SkyCanvas.tsx        # 星空の Canvas 描画
│   ├── Sidebar.tsx          # 天体リスト・検索・天文情報
│   ├── ControlPanel.tsx     # 日時・場所・表示設定の操作パネル
│   ├── DetailPanel.tsx      # 選択した天体の詳細表示
│   ├── WelcomeModal.tsx     # 初回表示の「今夜の見どころ」
│   ├── DiscoveryToast.tsx   # 新しい天体を発見したときの通知
│   ├── HelpModal.tsx        # 使い方
│   └── ui/                  # アイコン・モーダル・全天図などの共通部品
├── data/
│   ├── constellations.ts    # 星座データ（名称・星座線・季節・神話）
│   ├── stars.ts             # 恒星データ（座標・等級・色）
│   ├── planets.ts           # 惑星・太陽・月データ
│   └── cities.ts            # 観測地点のプリセット
├── store/
│   └── useAppStore.ts       # アプリケーション状態の管理
├── i18n/
│   └── translations.ts      # 日本語・英語の文言
├── types/
│   └── celestial.ts         # 型定義
├── utils/
│   ├── astronomy.ts         # 天体位置計算・座標変換・可視判定
│   ├── bodies.ts            # 天体情報の組み立て・星空図鑑の定義
│   └── moonPath.ts          # 月の満ち欠けの形状
├── App.tsx
├── main.tsx
└── index.css
```

## ライセンス

MIT
