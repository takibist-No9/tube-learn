# 12. Vercelへのデプロイ

## 概要
完成したアプリケーションをVercelにデプロイし、本番環境で公開します。

## 関連技術
- Vercel
- Next.js
- Supabase
- Git/GitHub

## 実装の詳細

### 1. デプロイ前の準備

#### コードの最終チェック
- [ ] すべての機能が正常に動作することを確認
- [ ] エラーハンドリングが適切に実装されている
- [ ] 環境変数がハードコードされていない
- [ ] console.logなどのデバッグコードを削除
- [ ] ESLintエラーがない（`npm run lint`）
- [ ] TypeScriptエラーがない（`npm run build`）

#### .gitignoreの確認
`.gitignore`に以下が含まれていることを確認：
```
# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 2. GitHubリポジトリの準備

#### リポジトリの作成
1. GitHubで新しいリポジトリを作成
2. ローカルリポジトリをGitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/tube-learn.git
git push -u origin main
```

### 3. Vercelプロジェクトの作成

#### Vercelアカウント
1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでサインアップ/ログイン

#### プロジェクトのインポート
1. Vercelダッシュボードで「Add New Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクト名を設定（例: `tube-learn`）

#### ビルド設定
- **Framework Preset**: Next.js
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）

### 4. 環境変数の設定

Vercelプロジェクトの設定ページで以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
```

**重要:** 本番環境用のSupabaseプロジェクトを使用するか、開発環境と同じプロジェクトを使用するか決定します。

### 5. Supabaseの本番環境設定

#### リダイレクトURLの追加
Supabaseダッシュボード → Authentication → URL Configuration で以下を追加：

- **Site URL**: `https://your-vercel-domain.vercel.app`
- **Redirect URLs**:
  - `https://your-vercel-domain.vercel.app/auth/callback`
  - `https://your-custom-domain.com/auth/callback`（カスタムドメインを使用する場合）

#### Google OAuth設定の更新
Google Cloud Consoleで承認済みのリダイレクトURIに本番環境のURLを追加：
- `https://your-project.supabase.co/auth/v1/callback`

### 6. デプロイの実行

#### 初回デプロイ
1. Vercelプロジェクト設定画面で「Deploy」をクリック
2. ビルドログを確認
3. デプロイが成功したら、URLにアクセスして動作確認

#### 自動デプロイの設定
- `main`ブランチへのプッシュで自動的にデプロイされる（デフォルト）
- プルリクエストごとにプレビューデプロイが作成される

### 7. カスタムドメインの設定（オプション）

#### ドメインの追加
1. Vercelプロジェクト → Settings → Domains
2. 所有しているドメインを入力
3. DNSレコードを設定（Vercelの指示に従う）

#### SSL証明書
- Vercelが自動的にSSL証明書を発行（Let's Encrypt）
- HTTPSが自動的に有効化される

### 8. 本番環境での動作確認

#### 機能テスト
- [ ] トップページが正しく表示される
- [ ] 講座一覧が表示される
- [ ] 講座詳細ページが表示される
- [ ] 動画視聴ページが表示される
- [ ] Google認証が正常に動作する
- [ ] ログイン/ログアウトが正常に動作する
- [ ] 管理画面にアクセスできる（管理者のみ）
- [ ] 講座・動画のCRUD操作が正常に動作する

#### パフォーマンステスト
- [ ] ページの読み込み速度を確認
- [ ] Lighthouseスコアを確認（目標: Performance 90+）
- [ ] Core Web Vitalsを確認

#### セキュリティテスト
- [ ] HTTPSが有効になっている
- [ ] 認証とアクセス制御が正常に動作する
- [ ] 環境変数が公開されていない

### 9. モニタリングとログ

#### Vercel Analytics（オプション）
1. Vercelプロジェクト → Analytics
2. Analyticsを有効化
3. トラフィックとパフォーマンスを監視

#### エラーログの確認
1. Vercelプロジェクト → Logs
2. Functionsタブでサーバーサイドのログを確認
3. エラーが発生した場合、ログを確認して修正

### 10. 継続的なデプロイメント

#### ブランチ戦略
- `main`ブランチ: 本番環境
- `develop`ブランチ: ステージング環境（オプション）
- `feature/*`ブランチ: 機能開発

#### デプロイフロー
1. 機能ブランチで開発
2. プルリクエストを作成
3. Vercelが自動的にプレビューデプロイを作成
4. レビュー後、`main`にマージ
5. 本番環境に自動デプロイ

### 11. パフォーマンス最適化（必要に応じて）

#### 画像最適化
- next/imageを使用（既に実装済み）
- 適切なサイズの画像を使用
- WebP形式の画像を使用（Vercelが自動変換）

#### キャッシング
- Supabaseクエリのキャッシング設定を確認
- `revalidate`オプションを適切に設定

#### バンドルサイズの削減
```bash
# バンドルサイズを分析
npm run build
# または
npx @next/bundle-analyzer
```

### 12. バックアップとセキュリティ

#### Supabaseバックアップ
- Supabaseの自動バックアップが有効になっていることを確認
- 定期的に手動バックアップを実行（重要なマイルストーン時）

#### セキュリティベストプラクティス
- [ ] RLSポリシーが正しく設定されている
- [ ] 環境変数が安全に管理されている
- [ ] HTTPS通信が強制されている
- [ ] CSP（Content Security Policy）を設定（オプション）

## トラブルシューティング

### ビルドエラー
- Vercelのビルドログを確認
- ローカルで`npm run build`を実行してエラーを再現
- 依存関係の問題を確認（`package-lock.json`を最新化）

### 環境変数エラー
- Vercel設定で環境変数が正しく設定されているか確認
- 環境変数名が正確か確認（`NEXT_PUBLIC_`プレフィックス）
- デプロイ後に環境変数を変更した場合、再デプロイが必要

### 認証エラー
- SupabaseのリダイレクトURLが正しく設定されているか確認
- Google OAuthの承認済みリダイレクトURIが正しいか確認
- ブラウザのコンソールでエラーメッセージを確認

## Todo

- [ ] コードの最終チェックを実行
- [ ] .gitignoreを確認
- [ ] GitHubリポジトリを作成してプッシュ
- [ ] Vercelアカウントを作成
- [ ] Vercelプロジェクトをインポート
- [ ] 環境変数を設定
- [ ] SupabaseのリダイレクトURLを更新
- [ ] Google OAuthの設定を更新
- [ ] 初回デプロイを実行
- [ ] 本番環境で動作確認
- [ ] パフォーマンステストを実行
- [ ] Lighthouseスコアを確認
- [ ] カスタムドメインを設定（オプション）
- [ ] モニタリングを設定
- [ ] ドキュメントを更新（README.mdに本番URLを記載）

## 参考資料
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Web Performance](https://web.dev/performance/)
