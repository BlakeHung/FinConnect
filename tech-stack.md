# 記帳系統技術架構

## 1. 核心框架
- Framework: Next.js 14 (App Router)
- Language: TypeScript 5.x
- Runtime: Node.js 20.x

## 2. 前端技術

### 2.1 UI框架與組件
- UI Framework: shadcn/ui
- CSS Framework: Tailwind CSS 3.x
- Icons: Lucide Icons
- Components: Radix UI

### 2.2 狀態管理
- Local State: React Hooks
- Global State: Zustand
- Server State: TanStack Query v5
- Forms: React Hook Form + Zod

### 2.3 數據處理
- HTTP Client: Axios
- Date Handling: date-fns
- Data Validation: Zod
- Charts: Recharts
- Money: dinero.js

### 2.4 效能優化
- Images: Next.js Image Optimization
- Fonts: Next.js Font Optimization
- Bundle Analyzer: @next/bundle-analyzer
- Compression: next-compress

## 3. 後端技術

### 3.1 API 層
- API Routes: Next.js API Routes
- API Validation: Zod
- Middleware: Next.js Middleware
- File Upload: uploadthing

### 3.2 數據庫
- ORM: Prisma
- Database: PlanetScale (MySQL)
- Cache: Redis
- Connection Pooling: PgBouncer

### 3.3 認證授權
- Authentication: NextAuth.js
- JWT Handling: jose
- Password Hashing: bcrypt
- RBAC: Custom implementation

## 4. 開發工具

### 4.1 開發環境
- IDE: VSCode
- AI Assistant: Cursor
- Git Client: GitHub Desktop
- API Testing: Postman

### 4.2 代碼質量
- Linter: ESLint
- Formatter: Prettier
- Type Checking: TypeScript
- Testing: Vitest

### 4.3 部署工具
- CI/CD: GitHub Actions
- Hosting: Vercel
- Monitoring: Vercel Analytics
- Logging: Pino

## 5. 開發相依套件

### 5.1 生產環境依賴
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@prisma/client": "^5.10.0",
    "@radix-ui/react-icons": "^1.3.0",
    "@tanstack/react-query": "^5.22.0",
    "@uploadthing/react": "^6.2.2",
    "axios": "^1.6.7",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.3.1",
    "dinero.js": "^2.0.0-alpha.14",
    "lucide-react": "^0.331.0",
    "next": "14.1.0",
    "next-auth": "^4.24.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.50.1",
    "recharts": "^2.12.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.5.0"
  }
}
```

### 5.2 開發環境依賴
```json
{
  "devDependencies": {
    "@types/node": "^20.11.19",
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^7.0.1",
    "@typescript-eslint/parser": "^7.0.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.35",
    "prettier": "^3.2.5",
    "prisma": "^5.10.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vitest": "^1.2.2"
  }
}
```

## 6. 配置文件

### 6.1 TypeScript 配置
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 6.2 Tailwind 配置
```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... 其他顏色配置
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## 7. 環境變數設定
```env
# .env.example
DATABASE_URL="mysql://user:pass@host:3306/db"
NEXTAUTH_SECRET="your-secret-here"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
REDIS_URL="redis://localhost:6379"
```

## 8. Docker 配置

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## 9. CI/CD Pipeline
```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
```