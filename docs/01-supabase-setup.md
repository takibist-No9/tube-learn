# 01. Supabaseプロジェクトのセットアップとマイグレーション

## 概要

Supabaseプロジェクトを作成し、データベーススキーマ（profiles、courses、videos）とRLSポリシーを設定します。

## 関連技術

- Supabase
- PostgreSQL
- Row Level Security (RLS)

## 実装の詳細

### 1. Supabaseプロジェクトの作成

- Supabaseダッシュボードで新規プロジェクトを作成
- プロジェクト名: `tube-learn`
- リージョン: 最寄りのリージョンを選択

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. データベーステーブルの作成

#### profiles テーブル

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### courses テーブル

```sql
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_free BOOLEAN DEFAULT false,
  instructor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### videos テーブル

```sql
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, "order")
);
```

### 4. RLSポリシーの設定

#### profiles テーブル

```sql
-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 本人のみ更新可能
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### courses テーブル

```sql
-- RLSを有効化
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

-- 管理者のみ挿入可能
CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 管理者のみ更新可能
CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 管理者のみ削除可能
CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

#### videos テーブル

```sql
-- RLSを有効化
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

-- 管理者のみ挿入可能
CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 管理者のみ更新可能
CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 管理者のみ削除可能
CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

### 5. トリガーの設定

#### updated_atの自動更新

```sql
-- トリガー関数の作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 新規ユーザー登録時のプロファイル自動作成

```sql
-- トリガー関数の作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの設定
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Todo

- [x] Supabaseプロジェクトを作成
- [x] `.env.local`ファイルを作成し、環境変数を設定
- [x] profilesテーブルを作成
- [x] coursesテーブルを作成
- [x] videosテーブルを作成
- [x] profilesテーブルのRLSポリシーを設定
  - [x] emailとユーザ名はauth.usersからアクセスしてセキュリティ強化
- [x] coursesテーブルのRLSポリシーを設定
- [x] videosテーブルのRLSポリシーを設定
- [x] updated_at自動更新トリガーを設定
- [x] 新規ユーザー登録時のプロファイル自動作成トリガーを設定
- [x] Supabase型定義を生成（`npx supabase gen types typescript`）
- [x] 動作確認（テーブル作成、RLSポリシー、トリガー）

## 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions & Triggers](https://supabase.com/docs/guides/database/functions)
