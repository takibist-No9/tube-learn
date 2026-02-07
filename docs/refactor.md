# パフォーマンス改善・リファクタリング

## 概要
本番環境へのデプロイ前後に実施するパフォーマンス最適化とコード品質向上のためのタスクリスト。
影響度と実装難易度を考慮した優先順位で整理しています。

## 高優先度（即時実装推奨）

### 1. 画像最適化の強化
**影響度: ⭐⭐⭐⭐⭐ | 難易度: 低 | 期待効果: LCP 30-50%改善**

- [x] `next.config.ts`にAVIF/WebP形式を追加
- [x] YouTubeサムネイル用のリモートパターンを追加
- [x] `course-card.tsx`に`sizes`属性を追加
- [x] トップページ最初の3枚に`priority`を設定
- [x] `course-header.tsx`のサムネイルに適切な`sizes`を設定
- [x] すべての`Image`コンポーネントで`alt`属性を確認

```tsx
// next.config.ts に追加
images: {
  remotePatterns: [
    { hostname: 'images.unsplash.com' },
    { hostname: 'i.ytimg.com' },
  ],
  formats: ['image/avif', 'image/webp'],
}
```

---

### 2. データベースクエリの最適化
**影響度: ⭐⭐⭐⭐⭐ | 難易度: 中 | 期待効果: 初回ロード 20-40%改善**

- [ ] `app/page.tsx`で動画数を集約して取得
- [ ] 不要なフィールドを除外（selectで必要なカラムのみ指定）
- [ ] `app/(admin)/admin/page.tsx`のカウントクエリを最適化
- [ ] `app/courses/[id]/page.tsx`で動画とコース情報を1クエリで取得
- [ ] インデックスの追加を検討（Supabase側）

```tsx
// app/page.tsx 改善例
const { data: courses } = await supabase
  .from('courses')
  .select(`
    id,
    title,
    thumbnail_url,
    difficulty,
    is_free,
    videos:videos(count)
  `)
  .order('created_at', { ascending: false });
```

---

### 3. Static Generation の活用
**影響度: ⭐⭐⭐⭐ | 難易度: 低 | 期待効果: TTFB 60-80%改善**

- [ ] `app/courses/[id]/page.tsx`に`generateStaticParams`を追加
- [ ] `app/courses/[id]/videos/[videoId]/page.tsx`に`generateStaticParams`を追加
- [ ] ISR（Incremental Static Regeneration）の設定（revalidate）
- [ ] 本番ビルド時の静的生成を確認

```tsx
// app/courses/[id]/page.tsx に追加
export async function generateStaticParams() {
  const supabase = createClient();
  const { data: courses } = await supabase.from('courses').select('id');
  return courses?.map((course) => ({ id: course.id })) || [];
}

export const revalidate = 3600; // 1時間ごとに再生成
```

---

## 中優先度（効果大）

### 4. React Server Components の活用強化
**影響度: ⭐⭐⭐⭐ | 難易度: 中 | 期待効果: バンドルサイズ 15-30%削減**

- [ ] `course-list.tsx`から`'use client'`を削除（Server Component化）
- [ ] `course-card.tsx`から`'use client'`を削除
- [ ] `video-list.tsx`をServer Componentに変更
- [ ] `course-header.tsx`をServer Componentに変更
- [ ] Client Componentが本当に必要な箇所のみに限定
- [ ] バンドルサイズを計測して効果を確認

**確認方法:**
```bash
npm run build
# "First Load JS" のサイズを確認
```

---

### 5. Supabase Connection Pooling
**影響度: ⭐⭐⭐⭐ | 難易度: 低 | 期待効果: 高負荷時 30-50%改善**

- [ ] Supabaseダッシュボードで Connection Pooling を有効化
- [ ] Connection Pooler URLを取得
- [ ] `.env.local`に`DATABASE_URL`を追加
- [ ] プールサイズの設定を確認
- [ ] 本番環境で接続数をモニタリング

---

### 6. メタデータの最適化
**影響度: ⭐⭐⭐ | 難易度: 低 | 期待効果: SEO・SNSシェア改善**

- [ ] `app/layout.tsx`にテンプレートとmetadataBaseを追加
- [ ] すべてのページで適切なtitleを設定
- [ ] OGP画像のサイズを最適化（1200x630）
- [ ] Twitter Card メタデータを追加
- [ ] sitemap.xmlを生成
- [ ] robots.txtを作成

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://tube-learn.vercel.app'),
  title: {
    default: 'TubeLearn - プログラミング講座',
    template: '%s | TubeLearn',
  },
  description: 'YouTube動画で学ぶプログラミング学習プラットフォーム',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
  },
};
```

---

## 低優先度（余裕があれば）

### 7. Dynamic Imports による Code Splitting
**影響度: ⭐⭐⭐ | 難易度: 低 | 期待効果: 初期バンドル 10-20%削減**

- [ ] 管理画面コンポーネントをdynamic importに変更
- [ ] `youtube-player.tsx`をdynamic import（ssr: false）
- [ ] Dialog系コンポーネントをdynamic import
- [ ] ローディングUIを設定

```tsx
import dynamic from 'next/dynamic';

const YouTubePlayer = dynamic(
  () => import('@/components/videos/youtube-player'),
  {
    ssr: false,
    loading: () => <div>動画を読み込み中...</div>
  }
);
```

---

### 8. Font Loading の最適化
**影響度: ⭐⭐⭐ | 難易度: 低 | 期待効果: CLS改善**

- [ ] `display: 'swap'`を追加
- [ ] `preload: true`を設定
- [ ] fallbackフォントを指定
- [ ] フォントファイルのサブセット化を検討
- [ ] CLSスコアを計測

```tsx
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});
```

---

### 9. Partial Prerendering (PPR)
**影響度: ⭐⭐⭐⭐ | 難易度: 高 | 期待効果: 初回表示 40-60%高速化**

⚠️ Next.js 16の実験的機能のため、本番環境での使用は慎重に

- [ ] `next.config.ts`で`experimental.ppr`を有効化
- [ ] 各ページで`experimental_ppr = true`を設定
- [ ] 静的部分と動的部分を`Suspense`で分離
- [ ] フォールバックUIを実装
- [ ] 本番環境でテスト

---

### 10. PWA化（Progressive Web App）
**影響度: ⭐⭐ | 難易度: 高 | 期待効果: リピート訪問 70-90%高速化**

- [ ] `next-pwa`をインストール
- [ ] `manifest.json`を作成
- [ ] アイコン画像を準備（192x192, 512x512）
- [ ] Service Workerの設定
- [ ] オフライン対応ページの実装
- [ ] インストール可能にする

---

## コード品質改善

### TypeScript の厳密化
- [ ] `strict: true`の確認
- [ ] `any`型の使用を削除
- [ ] 型定義ファイルの整理
- [ ] 未使用importの削除

### アクセシビリティ（a11y）
- [ ] すべての画像に意味のある`alt`属性
- [ ] フォーム要素に適切な`label`
- [ ] キーボードナビゲーションの確認
- [ ] ARIA属性の追加（必要箇所）
- [ ] カラーコントラストの確認

### セキュリティ
- [ ] 環境変数の再確認（.env.exampleの作成）
- [ ] CSP（Content Security Policy）ヘッダーの設定
- [ ] CORS設定の確認
- [ ] Rate Limitingの検討

### テスト
- [ ] 単体テストの追加（Vitest）
- [ ] E2Eテストの追加（Playwright）
- [ ] ビジュアルリグレッションテスト

---

## パフォーマンス計測

### Core Web Vitals の目標値
- [ ] LCP（Largest Contentful Paint）: < 2.5秒
- [ ] FID（First Input Delay）: < 100ms
- [ ] CLS（Cumulative Layout Shift）: < 0.1

### 計測ツール
- [ ] Lighthouse でスコア90以上を目指す
- [ ] WebPageTest で計測
- [ ] Chrome DevTools Performance タブで分析
- [ ] Vercel Analytics でリアルユーザーモニタリング

---

## 実装の進め方

1. **Phase 1（即時）**: タスク1-3を実装
2. **Phase 2（1週間以内）**: タスク4-6を実装
3. **Phase 3（余裕があれば）**: タスク7-10を実装
4. **継続的改善**: コード品質とパフォーマンス計測

---

## 参考資料

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Core Web Vitals](https://web.dev/vitals/)
