-- サンプル講座データの追加

-- 講座を追加
INSERT INTO courses (id, title, description, thumbnail_url, difficulty, is_free, instructor_id)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'React入門講座',
    'Reactの基礎から学べる初心者向け講座です。コンポーネント、State、Props、Hooksなどの基本概念を丁寧に解説します。',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    'beginner',
    true,
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Next.js実践開発',
    'Next.jsを使った実践的なWebアプリケーション開発を学びます。App Router、Server Components、API Routesなどの最新機能を習得できます。',
    'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=450&fit=crop',
    'intermediate',
    false,
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'TypeScript完全ガイド',
    'TypeScriptの型システムを基礎から応用まで徹底解説。実務で使える型定義のテクニックを身につけます。',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
    'intermediate',
    true,
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'フルスタック開発マスター',
    'フロントエンドからバックエンド、データベース、デプロイまで、モダンなWebアプリケーション開発の全工程を学びます。',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop',
    'advanced',
    false,
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Node.js基礎講座',
    'Node.jsの基本から学ぶサーバーサイド開発入門。Express、REST API、データベース連携まで幅広くカバーします。',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
    'beginner',
    true,
    (SELECT id FROM profiles LIMIT 1)
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Web デザイン基礎',
    'HTMLとCSSの基本から、レスポンシブデザイン、Flexbox、Gridレイアウトまで、Webデザインの基礎を学びます。',
    'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=450&fit=crop',
    'beginner',
    true,
    (SELECT id FROM profiles LIMIT 1)
  );

-- 動画を追加
INSERT INTO videos (id, course_id, title, youtube_url, "order")
VALUES
  -- React入門講座の動画
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Reactとは？環境構築',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1
  ),
  (
    'a1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'コンポーネントの基礎',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    2
  ),
  (
    'a1111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    'StateとPropsの使い方',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    3
  ),
  (
    'a1111111-1111-1111-1111-111111111114',
    '11111111-1111-1111-1111-111111111111',
    'React Hooksの基礎（useState）',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    4
  ),
  (
    'a1111111-1111-1111-1111-111111111115',
    '11111111-1111-1111-1111-111111111111',
    'useEffectでの副作用処理',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    5
  ),

  -- Next.js実践開発の動画
  (
    'a2222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    'Next.js入門 - プロジェクト作成',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'App Routerの基礎',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    2
  ),
  (
    'a2222222-2222-2222-2222-222222222223',
    '22222222-2222-2222-2222-222222222222',
    'Server ComponentsとClient Components',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    3
  ),
  (
    'a2222222-2222-2222-2222-222222222224',
    '22222222-2222-2222-2222-222222222222',
    'データフェッチングとキャッシング',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    4
  ),

  -- TypeScript完全ガイドの動画
  (
    'a3333333-3333-3333-3333-333333333331',
    '33333333-3333-3333-3333-333333333333',
    'TypeScript環境構築',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1
  ),
  (
    'a3333333-3333-3333-3333-333333333332',
    '33333333-3333-3333-3333-333333333333',
    '基本的な型定義',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    2
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'インターフェースと型エイリアス',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    3
  ),
  (
    'a3333333-3333-3333-3333-333333333334',
    '33333333-3333-3333-3333-333333333333',
    'ジェネリクスの活用',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    4
  ),
  (
    'a3333333-3333-3333-3333-333333333335',
    '33333333-3333-3333-3333-333333333333',
    'ユーティリティ型の使い方',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    5
  ),

  -- フルスタック開発マスターの動画
  (
    'a4444444-4444-4444-4444-444444444441',
    '44444444-4444-4444-4444-444444444444',
    'フルスタック開発の全体像',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1
  ),
  (
    'a4444444-4444-4444-4444-444444444442',
    '44444444-4444-4444-4444-444444444444',
    'フロントエンド設計',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    2
  ),
  (
    'a4444444-4444-4444-4444-444444444443',
    '44444444-4444-4444-4444-444444444444',
    'API設計とバックエンド実装',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    3
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'データベース設計と実装',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    4
  ),
  (
    'a4444444-4444-4444-4444-444444444445',
    '44444444-4444-4444-4444-444444444444',
    '認証機能の実装',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    5
  ),
  (
    'a4444444-4444-4444-4444-444444444446',
    '44444444-4444-4444-4444-444444444444',
    'デプロイとCI/CD',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    6
  ),

  -- Node.js基礎講座の動画
  (
    'a5555555-5555-5555-5555-555555555551',
    '55555555-5555-5555-5555-555555555555',
    'Node.js入門',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1
  ),
  (
    'a5555555-5555-5555-5555-555555555552',
    '55555555-5555-5555-5555-555555555555',
    'Expressでサーバー構築',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    2
  ),
  (
    'a5555555-5555-5555-5555-555555555553',
    '55555555-5555-5555-5555-555555555555',
    'REST API の作成',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    3
  ),

  -- Webデザイン基礎の動画
  (
    'a6666666-6666-6666-6666-666666666661',
    '66666666-6666-6666-6666-666666666666',
    'HTMLの基礎',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1
  ),
  (
    'a6666666-6666-6666-6666-666666666662',
    '66666666-6666-6666-6666-666666666666',
    'CSSの基礎とスタイリング',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    2
  ),
  (
    'a6666666-6666-6666-6666-666666666663',
    '66666666-6666-6666-6666-666666666666',
    'Flexboxレイアウト',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    3
  ),
  (
    'a6666666-6666-6666-6666-666666666664',
    '66666666-6666-6666-6666-666666666666',
    'CSS Gridレイアウト',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    4
  ),
  (
    'a6666666-6666-6666-6666-666666666665',
    '66666666-6666-6666-6666-666666666666',
    'レスポンシブデザイン',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    5
  );
