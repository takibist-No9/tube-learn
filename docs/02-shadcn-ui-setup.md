# 02. shadcn/uiのインストールと設定

## 概要
shadcn/uiをプロジェクトにインストールし、必要なコンポーネントをセットアップします。

## 関連技術
- shadcn/ui
- Radix UI
- Tailwind CSS v4
- TypeScript

## 実装の詳細

### 1. shadcn/uiの初期化

```bash
npx shadcn@latest init
```

初期化時の設定：
- TypeScript: Yes
- Style: New York
- Base color: Slate
- CSS variables: Yes
- Tailwind CSS v4: Yes
- Import alias: `@/components`
- React Server Components: Yes

### 2. 必要なコンポーネントのインストール

#### 共通コンポーネント
```bash
# レイアウト・ナビゲーション
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu

# フォーム
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select

# フィードバック
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add dialog
npx shadcn@latest add skeleton

# その他
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
```

### 3. components.jsonの確認

インストール後、`components.json`ファイルが作成されることを確認：

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 4. utilsファイルの確認

`lib/utils.ts`が作成され、`cn()`ヘルパー関数が含まれていることを確認：

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5. Tailwind CSS v4との統合確認

`app/globals.css`でshadcn/uiのCSS変数がTailwind CSS v4と正しく統合されていることを確認。

### 6. テーマカスタマイズ（オプション）

必要に応じて`app/globals.css`のCSS変数をカスタマイズ：

```css
@theme inline {
  /* 既存の設定 */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* shadcn/ui用のカスタマイズ */
  /* 必要に応じて追加 */
}
```

## Todo

- [x] shadcn/uiを初期化（`npx shadcn@latest init`）
- [x] 設定を確認（TypeScript、New York style、Slate color等）
- [x] Buttonコンポーネントをインストール
- [x] Cardコンポーネントをインストール
- [x] Badgeコンポーネントをインストール
- [x] Avatarコンポーネントをインストール
- [x] Dropdown Menuコンポーネントをインストール
- [x] Formコンポーネントをインストール
- [x] Inputコンポーネントをインストール
- [x] Labelコンポーネントをインストール
- [x] Textareaコンポーネントをインストール
- [x] Selectコンポーネントをインストール
- [x] Alertコンポーネントをインストール
- [x] Toastコンポーネントをインストール
- [x] Dialogコンポーネントをインストール
- [x] Skeletonコンポーネントをインストール
- [x] Separatorコンポーネントをインストール
- [x] Scroll Areaコンポーネントをインストール
- [x] `components.json`の内容を確認
- [x] `lib/utils.ts`の`cn()`関数を確認
- [x] サンプルページでコンポーネントの動作を確認
- [x] Tailwind CSS v4との統合を確認

## 参考資料
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
