# 業績（論文発表）追加プロンプト

## 概要
このプロンプトは、研究業績をWebサイトに追加する際の手順と注意点をまとめたものです。

## 追加手順

### 1. 既存の業績を確認
まず、既存の業績ファイルの構造とフォーマットを確認します。

```bash
# 業績ディレクトリの確認
ls -la content/publication/

# 既存の業績例を参照（例: hirobe2024vrsj）
cat content/publication/hirobe2024vrsj/index.md
```

### 2. ディレクトリ命名規則の確認
- 命名規則: `<筆頭著者の姓><発表年><学会略称>`
- 例: `hirobe2025vrsj` (廣部 2025年 VRSJ)
- 例: `yasukawa2025vrsj` (安川 2025年 VRSJ)

### 3. 必要な情報の収集
新しい業績を追加する際に必要な情報:

- **title**: 論文タイトル
- **authors**: 著者リスト（姓名スペース区切り、◯マークは除去）
- **date**: 発表日（YYYY-MM-DDTHH:mm:ss+09:00形式）
- **publication**: 学会名・会議名の正式名称
- **publication_short**: 学会名の略称
- **abstract**: アブストラクト（概要）
- **url_pdf**: PDFファイルのURL
- **links**: 関連リンク（学会サイトなど）
  - name: リンク名
  - url: URL
- **tags**: タグ（Conference paper, VR, Care educationなど）

### 4. ディレクトリとファイルの作成

```bash
# ディレクトリを作成
mkdir -p content/publication/<新しい業績のディレクトリ名>

# index.mdファイルを作成
# （次のセクションのテンプレートを使用）
```

### 5. index.md テンプレート

```yaml
---
title: "論文タイトル"
authors:
- 著者名1
- 著者名2
- 著者名3
author_notes:
- "Equal contribution"
date: "YYYY-MM-DDTHH:mm:ss+09:00"
doi: ""

# Schedule page publish date (NOT publication's date).
publishDate: "YYYY-MM-DDTHH:mm:ss+09:00"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["Domestic conference"]

# Publication name and optional abbreviated publication name.
publication: "学会名の正式名称"
publication_short: "学会略称"

abstract: "アブストラクト本文"

# Summary. An optional shortened abstract.
summary: 学会名の正式名称

tags:
- Conference paper
- その他のタグ
categories: 
featured: false

links:
  - name: 学会名
    url: 学会サイトURL
url_pdf: 'PDFファイルのURL'
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
image:
  caption: ''
  focal_point: ""
  preview_only: true

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: []

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: ""
---
```

### 6. 著者名の処理について
- 著者名は姓と名の間にスペースを入れる
- ◯マーク（発表者マーク）は除去する
- 所属情報は除去する（括弧内の情報）

例:
```
入力: 〇廣部 敬太(静岡大学)
出力: 廣部 敬太
```

### 7. タグの選定
過去の業績から適切なタグを選定:
- Conference paper / Journal article
- VR
- Care education
- Patient eXperience
- Immersive content
- Generative AI
- Co-creation
- Simulation training
など

### 8. 確認とコミット

```bash
# ファイルの確認
cat content/publication/<新しい業績のディレクトリ名>/index.md

# git statusで変更を確認
git status

# ビルドが成功することを確認（オプション）
hugo # または make serve

# コミット
git add content/publication/<新しい業績のディレクトリ名>/
git commit -m "Add publication: <論文タイトル>"
```

## 注意事項

1. **日付フォーマット**: ISO 8601形式を使用（例: 2025-09-10T00:00:00+09:00）
2. **文字エンコーディング**: UTF-8
3. **引用符**: YAMLで特殊文字を含む場合は引用符で囲む
4. **URL**: 正確なPDFのURLを確認（conference.vrsj.org/ac2025/program/doc/*.pdf など）
5. **既存構造の維持**: 既存ファイルの構造とフォーマットを維持する

## 実行例

### VRSJ 2025の業績追加例

2つの業績を追加する場合:

1. `hirobe2025vrsj` - 廣部敬太の発表
   - タイトル: "認知症当事者との共同創造における生成AIを活用した幻覚モデリング手法"
   - PDF: https://conference.vrsj.org/ac2025/program/doc/1B2-07.pdf

2. `yasukawa2025vrsj` - 安川陽大の発表
   - タイトル: "認知症ケア実践知高度化のためのVRシミュレーション教育の初期検討"
   - PDF: https://conference.vrsj.org/ac2025/program/doc/1B2-09.pdf

## トラブルシューティング

- **ビルドエラーが発生した場合**: YAMLのシンタックスを確認
- **日本語が文字化けする場合**: ファイルがUTF-8で保存されているか確認
- **PDFリンクが機能しない場合**: URLが正確か、アクセス可能か確認

## 関連ドキュメント

- `.ai/README.md`: .aiディレクトリの概要
- 既存の業績ファイル: `content/publication/*/index.md`
