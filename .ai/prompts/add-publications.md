# 業績（論文）追加プロンプト

このプロンプトは、本Webサイトに新しい業績（論文）を追加する際にAIに指示する内容をまとめたものです。

## 目的

研究業績の追加作業を効率化し、一貫性のあるフォーマットで論文情報を管理する。

## 使用方法

AIツール（GitHub Copilot、Claude、ChatGPT など）に、以下の情報と本プロンプトを提供して、新しい論文エントリを作成してもらいます。

## 必要な情報

新しい論文を追加する際には、以下の情報を提供してください：

1. **論文タイトル** (日本語または英語)
2. **著者リスト** (著者順に)
3. **発表日** (YYYY-MM-DD形式)
4. **DOI** (Digital Object Identifier、ある場合)
5. **出版物の種類**:
   - Conference paper (学会発表)
   - Journal article (ジャーナル論文)
   - Domestic conference (国内学会)
   - Preprint / Working Paper
   - Report
   - Book
   - Book section
   - Thesis
   - Patent
6. **出版物名** (学会名、ジャーナル名など)
7. **アブストラクト** (論文の要旨)
8. **タグ** (分類用キーワード)
9. **URL情報** (pdf、code、dataset、posterなどへのリンク、ある場合)

## 作業手順

### 1. ディレクトリ作成

`content/publication/` 配下に、以下の命名規則で新しいディレクトリを作成：

```
{第一著者の姓}{発表年}{学会/ジャーナルの略称}
```

例:
- `omata2024chi` (Omata氏が2024年にCHIで発表)
- `ishikawa2023icmi` (Ishikawa氏が2023年にICMIで発表)

### 2. index.md ファイル作成

作成したディレクトリ内に `index.md` ファイルを作成し、以下のテンプレートを使用：

```yaml
---
title: "論文タイトル"
authors:
- 著者名1
- 著者名2
- 著者名3
author_notes:
- "Equal contribution"  # 必要に応じて
date: "YYYY-MM-DDT00:00:00+09:00"
doi: "10.xxxx/xxxxx"  # DOIがある場合

# Schedule page publish date (NOT publication's date).
publishDate: "YYYY-MM-DDT00:00:00+09:00"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["Conference paper"]  # または "Journal article" など

# Publication name and optional abbreviated publication name.
publication: "学会名またはジャーナル名（フルネーム）"
publication_short: "略称"

abstract: "論文のアブストラクト（要旨）をここに記載"

# Summary. An optional shortened abstract.
summary: 学会名またはジャーナル名

tags:
- Conference paper  # または Journal article
- キーワード1
- キーワード2
categories: 
featured: false

# links:
# - name: ""
#   url: ""
url_pdf: ''
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

### 3. cite.bib ファイル作成

同じディレクトリ内に `cite.bib` ファイルを作成し、BibTeX形式の引用情報を記載：

```bibtex
@inproceedings{AuthorYearVenue,
  title={論文タイトル},
  author={Author1, Firstname1 and Author2, Firstname2},
  booktitle={Conference/Journal Name},
  year={YYYY},
  doi={10.xxxx/xxxxx}
}
```

### 4. 画像ファイル追加（オプション）

論文に関連する画像がある場合は、`featured.jpg` または `featured.png` という名前で同じディレクトリに配置。

## 注意事項

- 日付は ISO 8601 形式 (`YYYY-MM-DDT00:00:00+09:00`) で記載
- 著者名は日本語の場合はフルネーム、英語の場合は "Firstname Lastname" 形式
- タグは既存の論文エントリと一貫性を持たせる
- DOIがある場合は必ず記載
- URLフィールドは、リンクがない場合は空文字列 `''` のままにする

## 例

### 国際会議論文の例

```yaml
---
title: "Interactive Video Analysis for Dementia Care Training"
authors:
- Atsushi Omata
- Shogo Ishikawa
- Yoichi Takebayashi
date: "2024-03-15T00:00:00+09:00"
doi: "10.1145/3613904.3642123"

publishDate: "2024-03-15T00:00:00+09:00"

publication_types: ["Conference paper"]

publication: "Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems"
publication_short: "CHI 2024"

abstract: "This paper presents an interactive video analysis system designed to enhance dementia care training..."

summary: CHI 2024

tags:
- Conference paper
- Human-Computer Interaction
- Video Analysis
- Dementia Care
categories: 
featured: true

url_pdf: 'https://dl.acm.org/doi/pdf/10.1145/3613904.3642123'
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

### 国内学会論文の例

```yaml
---
title: "認知症ケアスキル習得のためのビデオ分析支援システムの開発"
authors:
- 小俣 敦士
- 石川 翔吾
- 竹林 洋一
date: "2024-03-01T00:00:00+09:00"
doi: ""

publishDate: "2024-03-01T00:00:00+09:00"

publication_types: ["Domestic conference"]

publication: "情報処理学会全国大会"
publication_short: "IPSJ 2024"

abstract: "本研究では、認知症ケアにおけるインタラクションスキルの習得を支援するビデオ分析システムを提案する..."

summary: 情報処理学会全国大会

tags:
- Domestic conference
- Video Analysis
- Dementia Care
categories: 
featured: false

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

## AIへの指示例

以下のように、AIに情報と共に指示を与えます：

```
以下の情報を基に、新しい論文エントリを作成してください：

- タイトル: "Interactive Video Analysis for Dementia Care Training"
- 著者: Atsushi Omata, Shogo Ishikawa, Yoichi Takebayashi
- 発表日: 2024-03-15
- DOI: 10.1145/3613904.3642123
- 種類: Conference paper
- 出版物: CHI 2024
- アブストラクト: [論文の要旨]
- タグ: Human-Computer Interaction, Video Analysis, Dementia Care

.ai/prompts/add-publications.md のフォーマットに従って、
content/publication/omata2024chi/ ディレクトリに index.md と cite.bib を作成してください。
```

## 更新履歴

- 2024-10-04: 初版作成
