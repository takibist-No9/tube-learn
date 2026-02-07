# セキュリティ対応タスクリスト

## 概要
コードベースのセキュリティ監査で発見された脆弱性と推奨対策のタスクリスト。
優先度別に整理し、対応状況を管理します。

**監査実施日:** 2026-02-07
**リスクレベル:** 中〜高（クリティカル問題あり）

---

## 🔴 クリティカル（即時対応必須）

### 1. 環境変数の漏洩対策
**影響度: ⭐⭐⭐⭐⭐ | 難易度: 低 | 所要時間: 5分**

- [x] `.env.local`を`.gitignore`に追加（既に`.env*`で保護済み）
- [ ] Supabaseダッシュボードで新しいANON_KEYを生成
- [ ] 古いキーを無効化
- [ ] `.env.example`を作成（プレースホルダーのみ）
- [x] 既存のGit履歴から`.env.local`を削除（コミット履歴なし、対応不要）
- [ ] Vercelの環境変数を更新

```bash
# .gitignoreに追加
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore

# Git履歴から削除（オプション）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

**重要度:** 最優先！GitHubにプッシュ前に必ず対応

---

### 2. Server Actionsに管理者認証チェックを追加
**影響度: ⭐⭐⭐⭐⭐ | 難易度: 中 | 所要時間: 30分**

#### 講座管理（courses/actions.ts）

- [ ] `createCourse`に管理者チェックを追加
- [ ] `updateCourse`に管理者チェックを追加
- [ ] `deleteCourse`に管理者チェックを追加

```typescript
// app/(admin)/admin/courses/actions.ts
async function requireAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('認証が必要です');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('管理者権限が必要です');
  }

  return user;
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  await requireAdmin(supabase); // 追加
  // ... 既存のロジック
}
```

#### 動画管理（videos/actions.ts）

- [ ] `createVideo`に管理者チェックを追加
- [ ] `updateVideo`に管理者チェックを追加
- [ ] `deleteVideo`に管理者チェックを追加

---

### 3. テストページの認証保護
**影響度: ⭐⭐⭐⭐ | 難易度: 低 | 所要時間: 10分**

- [ ] `app/test/page.tsx`に管理者チェックを追加
- [ ] 本番環境では削除または無効化

```typescript
// app/test/page.tsx
export default async function TestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    notFound();
  }

  // 既存のテストロジック
}
```

---

## 🟠 高優先度（1週間以内）

### 4. セキュリティヘッダーの設定
**影響度: ⭐⭐⭐⭐ | 難易度: 低 | 所要時間: 15分**

- [ ] `next.config.ts`にセキュリティヘッダーを追加
- [ ] CSP（Content Security Policy）の設定
- [ ] X-Frame-Optionsの設定
- [ ] X-Content-Type-Optionsの設定
- [ ] Strict-Transport-Securityの設定
- [ ] Referrer-Policyの設定

```typescript
// next.config.ts に追加
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co",
              "frame-src 'self' https://www.youtube.com",
              "media-src 'self' https://www.youtube.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

---

### 5. URL検証の強化
**影響度: ⭐⭐⭐⭐ | 難易度: 中 | 所要時間: 20分**

#### YouTube URL検証

- [ ] YouTube URLのホワイトリスト検証を追加
- [ ] データURIの拒否
- [ ] プロトコルチェック（https://のみ）

```typescript
// app/(admin)/admin/videos/actions.ts
const youtubeUrlSchema = z.string().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      const allowedHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'];
      return parsed.protocol === 'https:' &&
             allowedHosts.some(host => parsed.hostname === host);
    } catch {
      return false;
    }
  },
  '有効なYouTube URLを入力してください（https://youtube.com または https://youtu.be）'
);

const videoSchema = z.object({
  // ...
  youtube_url: youtubeUrlSchema,
});
```

#### サムネイルURL検証

- [ ] サムネイルURLのホワイトリスト検証を追加
- [ ] 許可ドメインリストの作成

```typescript
// app/(admin)/admin/courses/actions.ts
const thumbnailUrlSchema = z.string().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      const allowedHosts = [
        'images.unsplash.com',
        'i.ytimg.com',
        'cdn.example.com', // 自社CDNがあれば追加
      ];
      return parsed.protocol === 'https:' &&
             allowedHosts.some(host => parsed.hostname === host);
    } catch {
      return false;
    }
  },
  'サムネイルは許可されたドメインからのみ使用できます'
);

const courseSchema = z.object({
  // ...
  thumbnail_url: thumbnailUrlSchema,
});
```

---

### 6. 表示順（order）の範囲制限
**影響度: ⭐⭐⭐ | 難易度: 低 | 所要時間: 5分**

- [ ] `order`フィールドに最大値を設定

```typescript
// app/(admin)/admin/videos/actions.ts
const videoSchema = z.object({
  // ...
  order: z.number()
    .int('整数である必要があります')
    .min(1, '表示順は1以上である必要があります')
    .max(9999, '表示順は9999以下である必要があります'),
});
```

---

### 7. YouTube iframeの権限制限
**影響度: ⭐⭐⭐ | 難易度: 低 | 所要時間: 5分**

- [ ] 不要な`allow`属性を削除
- [ ] `sandbox`属性を追加

```tsx
// components/videos/youtube-player.tsx
<iframe
  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
  title={video.title}
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  sandbox="allow-same-origin allow-scripts allow-presentation"
  allowFullScreen
  className="absolute inset-0 h-full w-full"
/>
```

削除する権限:
- [ ] `clipboard-write` を削除
- [ ] `web-share` を削除

---

### 8. 監査ログの実装
**影響度: ⭐⭐⭐⭐ | 難易度: 高 | 所要時間: 1時間**

#### データベーステーブル作成

- [ ] `audit_logs`テーブルを作成
- [ ] RLSポリシーを設定

```sql
-- Supabaseで実行
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSポリシー
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "管理者のみ閲覧可能"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "システムのみ挿入可能"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
```

#### ロギング関数の実装

- [ ] `lib/audit-log.ts`を作成
- [ ] Server Actionsに組み込み

```typescript
// lib/audit-log.ts
import { createClient } from '@/lib/supabase/server';

export async function logAudit({
  action,
  resourceType,
  resourceId,
  oldValues,
  newValues,
}: {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  resourceType: 'COURSE' | 'VIDEO';
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('audit_logs').insert({
    user_id: user?.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
  });
}
```

- [ ] `createCourse`にロギング追加
- [ ] `updateCourse`にロギング追加
- [ ] `deleteCourse`にロギング追加
- [ ] `createVideo`にロギング追加
- [ ] `updateVideo`にロギング追加
- [ ] `deleteVideo`にロギング追加

---

## 🟡 中優先度（1ヶ月以内）

### 9. レート制限の実装
**影響度: ⭐⭐⭐⭐ | 難易度: 高 | 所要時間: 2時間**

- [ ] Upstashアカウントの作成
- [ ] `@upstash/ratelimit`をインストール
- [ ] レート制限ミドルウェアの作成
- [ ] Server Actionsに適用

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    throw new Error('レート制限に達しました。しばらく待ってから再試行してください。');
  }
}
```

- [ ] 講座作成にレート制限
- [ ] 講座更新にレート制限
- [ ] 講座削除にレート制限
- [ ] 動画作成にレート制限
- [ ] 動画更新にレート制限
- [ ] 動画削除にレート制限

---

### 10. ページネーションの実装
**影響度: ⭐⭐⭐ | 難易度: 中 | 所要時間: 1時間**

- [ ] 講座一覧にページネーション追加
- [ ] 動画一覧にページネーション追加
- [ ] 管理画面の講座一覧にページネーション
- [ ] 管理画面の動画一覧にページネーション

```typescript
// app/(admin)/admin/courses/page.tsx
const PAGE_SIZE = 20;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const offset = (page - 1) * PAGE_SIZE;

  const { data: courses, count } = await supabase
    .from('courses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div>
      <CourseTable courses={courses || []} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
```

---

### 11. エラーログの改善
**影響度: ⭐⭐⭐ | 難易度: 中 | 所要時間: 30分**

- [ ] 本番環境でconsole.errorを無効化
- [ ] Sentryなどのエラートラッキングサービス導入
- [ ] エラーログのサニタイズ

```typescript
// lib/logger.ts
export function logError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    // Sentryなどに送信
    // Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error:', error, context);
  }
}
```

- [ ] すべての`console.error`を`logError`に置き換え

---

### 12. 同時編集の競合検出
**影響度: ⭐⭐ | 難易度: 中 | 所要時間: 1時間**

- [ ] `updated_at`を使った楽観的ロック
- [ ] 競合検出UI

```typescript
// app/(admin)/admin/courses/actions.ts
export async function updateCourse(
  id: string,
  formData: FormData,
  lastUpdatedAt: string // 追加
) {
  const supabase = await createClient();
  await requireAdmin(supabase);

  const validated = courseSchema.parse(data);

  const { data, error } = await supabase
    .from('courses')
    .update(validated)
    .eq('id', id)
    .eq('updated_at', lastUpdatedAt) // 競合検出
    .select()
    .single();

  if (error || !data) {
    throw new Error('別のユーザーが既に変更しています。ページを更新してください。');
  }

  revalidatePath('/admin/courses');
  return { success: true };
}
```

---

### 13. CSRFトークンの明示的検証
**影響度: ⭐⭐⭐ | 難易度: 低 | 所要時間: 15分**

- [ ] Next.js CSRF保護の確認
- [ ] 追加のトークン検証（必要に応じて）

Next.js Server ActionsはデフォルトでCSRF保護がありますが、念のため確認:

```typescript
// app/(admin)/admin/courses/actions.ts
'use server';

// Server Actionsは自動的にCSRF保護される
// 追加の保護が必要な場合は実装
```

---

### 14. 入力サニタイゼーション
**影響度: ⭐⭐ | 難易度: 低 | 所要時間: 30分**

- [ ] タイトル・説明文のHTML除去
- [ ] XSS対策の強化

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeText(text: string): string {
  // HTMLタグを全て除去
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

export function sanitizeHtml(html: string): string {
  // 安全なHTMLタグのみ許可
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}
```

```bash
npm install isomorphic-dompurify
```

- [ ] 講座タイトルのサニタイズ
- [ ] 講座説明のサニタイズ
- [ ] 動画タイトルのサニタイズ

---

## 🟢 低優先度（余裕があれば）

### 15. リクエスト検証の強化
**影響度: ⭐⭐ | 難易度: 低 | 所要時間: 15分**

- [ ] `/auth/callback`でコード形式を検証
- [ ] 不正なリクエストの検出

```typescript
// app/auth/callback/route.ts
const codeSchema = z.string().min(1).max(500);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const validCode = codeSchema.parse(code);
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(validCode);
    } catch (error) {
      return NextResponse.redirect(new URL('/login?error=invalid_code', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
```

---

### 16. 型安全性の向上
**影響度: ⭐⭐ | 難易度: 低 | 所要時間: 20分**

- [ ] `user_metadata`の型定義
- [ ] 適切なnullチェック

```typescript
// types/user.ts
interface UserMetadata {
  name?: string;
  avatar_url?: string;
  email?: string;
}

// components/auth/user-nav.tsx
const metadata = user.user_metadata as UserMetadata;
const userName = typeof metadata?.name === 'string'
  ? metadata.name.slice(0, 50)
  : user.email;
```

---

### 17. 依存関係のセキュリティスキャン
**影響度: ⭐⭐ | 難易度: 低 | 所要時間: 継続的**

- [ ] `npm audit`を実行
- [ ] GitHub Dependabotを有効化
- [ ] 定期的な依存関係更新

```bash
# セキュリティ監査
npm audit

# 自動修正
npm audit fix

# 手動確認が必要な場合
npm audit fix --force
```

- [ ] `.github/dependabot.yml`を作成

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

### 18. リダイレクトのホワイトリスト
**影響度: ⭐ | 難易度: 低 | 所要時間: 10分**

- [ ] リダイレクト先のホワイトリスト作成
- [ ] 不正なリダイレクトの防止

```typescript
// lib/redirect.ts
const ALLOWED_REDIRECT_PATHS = ['/', '/login', '/courses', '/admin'];

export function safeRedirect(path: string): string {
  // 内部パスのみ許可
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return '/';
  }

  // ホワイトリストチェック
  if (ALLOWED_REDIRECT_PATHS.some(allowed => path.startsWith(allowed))) {
    return path;
  }

  return '/';
}
```

---

## 📋 実装チェックリスト

### Phase 1: 緊急対応（今日中）
- [ ] 環境変数の保護
- [ ] Server Actionsに管理者チェック
- [ ] テストページの保護

### Phase 2: 基本セキュリティ（今週中）
- [ ] セキュリティヘッダー
- [ ] URL検証強化
- [ ] YouTube iframe権限制限
- [ ] 監査ログ実装

### Phase 3: 強化（今月中）
- [ ] レート制限
- [ ] ページネーション
- [ ] エラーログ改善
- [ ] 同時編集対策

### Phase 4: 継続的改善
- [ ] 依存関係スキャン
- [ ] 定期的なセキュリティ監査
- [ ] ペネトレーションテスト

---

## 検証方法

### セキュリティヘッダーの確認
```bash
curl -I https://your-domain.com
```

### OWASP ZAPでスキャン
```bash
# Docker使用
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-domain.com
```

### Lighthouse セキュリティ監査
```bash
npx lighthouse https://your-domain.com --only-categories=best-practices
```

---

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Security Academy](https://portswigger.net/web-security)

---

**作成日:** 2026-02-07
**最終更新:** 2026-02-07
**ステータス:** 🔴 対応中
