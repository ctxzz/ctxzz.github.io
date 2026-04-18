# リポジトリ Secrets の設定

このドキュメントでは、本リポジトリの GitHub Actions ワークフローが必要とする Secrets と、その作成手順を説明します。

---

## COPILOT_GITHUB_TOKEN

`update-publications` アgentic ワークフロー（`workflows/update-publications.md`）が Copilot コーディングエージェントに Issue を割り当てる際に使用するトークンです。

### 作成手順

1. GitHub の **Settings → Developer settings → Personal access tokens → Fine-grained tokens** を開く
2. **Generate new token** をクリック
3. 以下のとおり設定する

| 項目 | 値 |
|------|-----|
| Token name | 任意（例: `copilot-github-token-ctxzz`） |
| Expiration | 任意（定期的に更新する場合は 90 日など） |
| Resource owner | `ctxzz` |
| Repository access | `Only select repositories` → `ctxzz.github.io` |

**Repository permissions**

| Permission | Access |
|-----------|--------|
| Contents | Read and write |
| Issues | Read and write |
| Pull requests | Read and write |

**Account permissions**

| Permission | Access |
|-----------|--------|
| Copilot Chat | Read-only |

> **注意**: Fine-grained PAT の Account permissions に「GitHub Copilot」という項目は存在しません。**「Copilot Chat」** を選択してください。

4. **Generate token** をクリックしてトークンをコピーする
5. リポジトリの **Settings → Secrets and variables → Actions → New repository secret** を開く
6. Name に `COPILOT_GITHUB_TOKEN`、Secret にコピーしたトークンを貼り付けて **Add secret** をクリックする
