# 株式会社グリーンテクノ - LP サイト

愛媛県松山市の防水工事専門会社「株式会社グリーンテクノ」の法人向けランディングページです。

## ファイル構成

```
green-techno/
├── index.html      ← HTML 本体
├── style.css       ← スタイルシート
├── script.js       ← JavaScript
├── privacy.html    ← プライバシーポリシー（別途作成）
├── thanks.html     ← フォーム送信完了ページ（別途作成）
└── images/         ← 施工写真フォルダ
    ├── case-factory-before.jpg
    ├── case-factory-after.jpg
    ├── case-mansion-process.jpg
    ├── case-mansion-after.jpg
    └── ogp.jpg
```

## 公開前に変更が必要な箇所

### index.html
```html
<!-- YOUR_USERNAME を自分の GitHub ユーザー名に変更 -->
<link rel="canonical" href="https://YOUR_USERNAME.github.io/green-techno/">
<meta property="og:url" content="https://YOUR_USERNAME.github.io/green-techno/">
```

## 開発・確認方法

ブラウザで `index.html` を直接開くか、VSCode の Live Server 拡張機能を使用してください。

## フォームについて

現在のフォームは **Netlify Forms** 用の設定（`data-netlify="true"`）になっています。

- **GitHub Pages** でホスティングする場合：フォームは動作しません。Googleフォームへの差し替えをご検討ください。
- **Netlify** でホスティングする場合：そのまま動作します（無料プランで月100件まで受信可能）。

## ライセンス

Copyright © 2026 Green Techno Co., Ltd. All Rights Reserved.
