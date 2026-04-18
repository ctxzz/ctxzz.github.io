---
on:
  schedule:
    - cron: '0 0 1 * *'   # 毎月1日 00:00 UTC (09:00 JST)
  workflow_dispatch:

permissions:
  contents: read
  issues: read

tools:
  web-fetch:
  github:
    toolsets: [context, repos]

network:
  allowed:
    - defaults
    - researchmap.jp
    - scholar.google.co.jp
    - cir.nii.ac.jp
    - jstage.jst.go.jp
    - ken.ieice.org
    - www.jstage.jst.go.jp

safe-outputs:
  create-issue:
    title-prefix: "🤖 [auto-publications] "
    labels: [auto-publications]
    close-older-issues: true
    max: 1
  assign-to-agent:
    name: copilot
    max: 1

timeout-minutes: 20
---

# 月次業績自動追加エージェント

小俣 敦士 (Atsushi Omata) の最新研究業績をウェブから調査し、まだリポジトリに追加されていない業績があれば GitHub Issue を作成して Copilot コーディングエージェントに追加を依頼してください。

---

## ステップ 1: 既存業績の把握

GitHub API を使って `content/publication/` ディレクトリ内のフォルダ一覧を取得し、既に登録済みの業績ディレクトリ名をリストアップしてください。
（例: `omata2025jsai`, `hirobe2024vrsj`, …）

---

## ステップ 2: 最新業績の調査

以下の URL をすべて取得・確認し、新しい業績を探してください。

1. **researchmap** — https://researchmap.jp/a_omata
   - 「研究論文」「発表・講演」「書籍等出版物」タブを順に確認する
2. **Google Scholar** — https://scholar.google.co.jp/citations?user=ZNBWz98AAAAJ&hl=ja
3. **CiNii Research** — https://cir.nii.ac.jp/search?q=%E5%B0%8F%E4%BF%A3%E6%95%A6%E5%A3%AB&type=researcher
   （クエリ `%E5%B0%8F%E4%BF%A3%E6%95%A6%E5%A3%AB` は「小俣敦士」をURLエンコードしたもの）

---

## ステップ 3: 差分の特定

調査結果と Step 1 の既存リストを照合し、**まだ `content/publication/` に存在しないもの**を特定してください。
差分がなければ `noop`（追加不要）を出力して終了してください。

---

## ステップ 4: GitHub Issue の作成

新しい業績が見つかった場合は、以下の情報を含む GitHub Issue を1件作成してください。

### Issue タイトル
「月次業績追加 {YYYY}-{MM}: {N}件の新規業績」（{YYYY}・{MM}・{N} を実際の値に置き換える）

### Issue 本文

下記の内容をすべて含めてください。

---

**概要**
今回の調査で YYYY 年 MM 月時点の未登録業績を N 件発見しました。
以下の手順で `content/publication/` へ追加し、PR を作成してください。

**追加対象**（見つかった業績を列挙）

| # | タイトル | 著者 | 発表先 | 発表日 | URL |
|---|----------|------|--------|--------|-----|
| 1 | …        | …    | …      | …      | …   |

**ディレクトリ命名規則**
`<筆頭著者の姓（ローマ字）><発表年><学会略称>` （すべて小文字）
例: `omata2026jsai` / `hirobe2025vrsj` / `oohara2026ieice`

よく使う学会略称: `jsai` / `vrsj` / `cihcd` / `asd` / `ieice` / `ipsj` / `interaction` / `gcce` / `jpca` / `jastro`

**index.md テンプレート**

```yaml
---
title: "論文タイトル"
authors:
- admin          # 小俣 敦士 / Atsushi Omata は必ず "admin"
- 著者名2
author_notes:
- "Equal contribution"
date: "YYYY-MM-DDT00:00:00+09:00"
doi: ""
publishDate: "YYYY-MM-DDT00:00:00+09:00"
publication_types: ["Domestic conference"]
publication: "学会名の正式名称"
publication_short: "学会略称 YYYY"
abstract: "アブストラクト本文"
summary: "学会名の正式名称"
tags:
- Conference paper
categories:
featured: false
links:
  - name: 学会名
    url: 学会ページURL
url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''
image:
  caption: ''
  focal_point: ""
  preview_only: true
projects: []
slides: ""
---
```

**注意事項**
- 著者名の先頭の発表者マーク（「〇」U+25CB や「◯」U+25EF など、丸囲みの記号すべて）・所属（括弧書き）は除去すること
- 小俣 敦士 / Atsushi Omata は `admin` と記載すること
- 日付が不明な場合は学会開催日を使用し、不明なら `YYYY-01-01T00:00:00+09:00`
- 既存業績との重複追加は避けること
- 詳細は `.ai/prompts/add-publications.md` を参照

---

作成した Issue を Copilot コーディングエージェントに割り当ててください。
