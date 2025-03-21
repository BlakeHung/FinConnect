# FinConnect

A modern financial management system built with Next.js 15, Prisma, and TypeScript.

## Features

- 🔐 Secure authentication with NextAuth.js
- 💰 Track expenses and income
- 📊 Analytics dashboard
- 📱 Responsive design
- 🎯 Activity management
- 📧 EDM system

## Tech Stack

- Next.js 15
- TypeScript
- Prisma
- PostgreSQL
- TailwindCSS
- NextAuth.js

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/personal-finance.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run the development server
```bash
npm run dev
```

## License

MIT © Blake Hung - Powered by [Blake Labs](https://wchung.tw/)

```
amis-management
├─ .eslintrc.json
├─ .next
│  ├─ app-build-manifest.json
│  ├─ build-manifest.json
│  ├─ cache
│  │  ├─ .rscinfo
│  │  ├─ images
│  │  │  └─ FEnM9THc2Sct5D8ZT3sIztwmreQEi-nkRbmk3u_w7KE
│  │  │     └─ 31536000.1773896975142.fKjhde8JZwIJulKL-tujXGzEYXGgrnxrLc0k4NqQQDk.YrvseokOaBIuSgv7EUuXodtAlbYo5fl3iEHTqlJGat0.webp
│  │  ├─ swc
│  │  │  └─ plugins
│  │  │     └─ v7_macos_aarch64_4.0.0
│  │  └─ webpack
│  │     ├─ client-development
│  │     │  ├─ 0.pack.gz
│  │     │  ├─ 1.pack.gz
│  │     │  ├─ 10.pack.gz
│  │     │  ├─ 11.pack.gz
│  │     │  ├─ 12.pack.gz
│  │     │  ├─ 13.pack.gz
│  │     │  ├─ 14.pack.gz
│  │     │  ├─ 15.pack.gz
│  │     │  ├─ 16.pack.gz
│  │     │  ├─ 17.pack.gz
│  │     │  ├─ 18.pack.gz
│  │     │  ├─ 19.pack.gz
│  │     │  ├─ 2.pack.gz
│  │     │  ├─ 20.pack.gz
│  │     │  ├─ 21.pack.gz
│  │     │  ├─ 22.pack.gz
│  │     │  ├─ 23.pack.gz
│  │     │  ├─ 24.pack.gz
│  │     │  ├─ 25.pack.gz
│  │     │  ├─ 26.pack.gz
│  │     │  ├─ 27.pack.gz
│  │     │  ├─ 28.pack.gz
│  │     │  ├─ 29.pack.gz
│  │     │  ├─ 3.pack.gz
│  │     │  ├─ 4.pack.gz
│  │     │  ├─ 5.pack.gz
│  │     │  ├─ 6.pack.gz
│  │     │  ├─ 7.pack.gz
│  │     │  ├─ 8.pack.gz
│  │     │  ├─ 9.pack.gz
│  │     │  ├─ index.pack.gz
│  │     │  └─ index.pack.gz.old
│  │     ├─ client-development-fallback
│  │     │  ├─ 0.pack.gz
│  │     │  ├─ 1.pack.gz
│  │     │  ├─ 2.pack.gz
│  │     │  ├─ index.pack.gz
│  │     │  └─ index.pack.gz.old
│  │     ├─ edge-server-development
│  │     │  ├─ 0.pack.gz
│  │     │  ├─ 1.pack.gz
│  │     │  ├─ 2.pack.gz
│  │     │  ├─ 3.pack.gz
│  │     │  ├─ 4.pack.gz
│  │     │  ├─ 5.pack.gz
│  │     │  ├─ 6.pack.gz
│  │     │  ├─ index.pack.gz
│  │     │  └─ index.pack.gz.old
│  │     └─ server-development
│  │        ├─ 0.pack.gz
│  │        ├─ 1.pack.gz
│  │        ├─ 10.pack.gz
│  │        ├─ 11.pack.gz
│  │        ├─ 12.pack.gz
│  │        ├─ 13.pack.gz
│  │        ├─ 14.pack.gz
│  │        ├─ 15.pack.gz
│  │        ├─ 16.pack.gz
│  │        ├─ 17.pack.gz
│  │        ├─ 18.pack.gz
│  │        ├─ 19.pack.gz
│  │        ├─ 2.pack.gz
│  │        ├─ 20.pack.gz
│  │        ├─ 21.pack.gz
│  │        ├─ 22.pack.gz
│  │        ├─ 23.pack.gz
│  │        ├─ 24.pack.gz
│  │        ├─ 25.pack.gz
│  │        ├─ 26.pack.gz
│  │        ├─ 3.pack.gz
│  │        ├─ 4.pack.gz
│  │        ├─ 5.pack.gz
│  │        ├─ 6.pack.gz
│  │        ├─ 7.pack.gz
│  │        ├─ 8.pack.gz
│  │        ├─ 9.pack.gz
│  │        ├─ index.pack.gz
│  │        └─ index.pack.gz.old
│  ├─ package.json
│  ├─ react-loadable-manifest.json
│  ├─ server
│  │  ├─ _rsc_src_lib_i18n_utils_ts.js
│  │  ├─ _ssr_src_lib_i18n_request_ts.js
│  │  ├─ app
│  │  │  ├─ [locale]
│  │  │  │  ├─ (dashboard)
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  ├─ page.js
│  │  │  │  │  │  └─ page_client-reference-manifest.js
│  │  │  │  │  └─ transactions
│  │  │  │  │     ├─ page.js
│  │  │  │  │     └─ page_client-reference-manifest.js
│  │  │  │  ├─ page.js
│  │  │  │  └─ page_client-reference-manifest.js
│  │  │  └─ api
│  │  │     └─ auth
│  │  │        └─ [...nextauth]
│  │  │           ├─ route.js
│  │  │           └─ route_client-reference-manifest.js
│  │  ├─ app-paths-manifest.json
│  │  ├─ edge-runtime-webpack.js
│  │  ├─ interception-route-rewrite-manifest.js
│  │  ├─ middleware-build-manifest.js
│  │  ├─ middleware-manifest.json
│  │  ├─ middleware-react-loadable-manifest.js
│  │  ├─ next-font-manifest.js
│  │  ├─ next-font-manifest.json
│  │  ├─ pages-manifest.json
│  │  ├─ server-reference-manifest.js
│  │  ├─ server-reference-manifest.json
│  │  ├─ src
│  │  │  └─ middleware.js
│  │  ├─ static
│  │  │  └─ webpack
│  │  │     └─ 633457081244afec._.hot-update.json
│  │  ├─ vendor-chunks
│  │  │  ├─ @babel.js
│  │  │  ├─ @floating-ui.js
│  │  │  ├─ @formatjs.js
│  │  │  ├─ @panva.js
│  │  │  ├─ @radix-ui.js
│  │  │  ├─ @swc.js
│  │  │  ├─ @vercel.js
│  │  │  ├─ aria-hidden.js
│  │  │  ├─ class-variance-authority.js
│  │  │  ├─ clsx.js
│  │  │  ├─ cookie.js
│  │  │  ├─ date-fns.js
│  │  │  ├─ get-nonce.js
│  │  │  ├─ intl-messageformat.js
│  │  │  ├─ lru-cache.js
│  │  │  ├─ lucide-react.js
│  │  │  ├─ next-auth.js
│  │  │  ├─ next-intl.js
│  │  │  ├─ next.js
│  │  │  ├─ oauth.js
│  │  │  ├─ object-hash.js
│  │  │  ├─ oidc-token-hash.js
│  │  │  ├─ openid-client.js
│  │  │  ├─ preact-render-to-string.js
│  │  │  ├─ preact.js
│  │  │  ├─ react-remove-scroll-bar.js
│  │  │  ├─ react-remove-scroll.js
│  │  │  ├─ react-style-singleton.js
│  │  │  ├─ sonner.js
│  │  │  ├─ tailwind-merge.js
│  │  │  ├─ tslib.js
│  │  │  ├─ use-callback-ref.js
│  │  │  ├─ use-intl.js
│  │  │  ├─ use-sidecar.js
│  │  │  ├─ uuid.js
│  │  │  ├─ yallist.js
│  │  │  └─ zustand.js
│  │  └─ webpack-runtime.js
│  ├─ static
│  │  ├─ chunks
│  │  │  ├─ _app-pages-browser_src_lib_i18n_request_ts.js
│  │  │  ├─ app
│  │  │  │  ├─ [locale]
│  │  │  │  │  ├─ (dashboard)
│  │  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  │  └─ page.js
│  │  │  │  │  │  ├─ layout.js
│  │  │  │  │  │  └─ transactions
│  │  │  │  │  │     └─ page.js
│  │  │  │  │  ├─ layout.js
│  │  │  │  │  ├─ loading.js
│  │  │  │  │  └─ page.js
│  │  │  │  └─ api
│  │  │  │     └─ auth
│  │  │  │        └─ [...nextauth]
│  │  │  │           └─ route.js
│  │  │  ├─ app-pages-internals.js
│  │  │  ├─ main-app.js
│  │  │  ├─ polyfills.js
│  │  │  └─ webpack.js
│  │  ├─ css
│  │  │  └─ app
│  │  │     └─ [locale]
│  │  │        └─ layout.css
│  │  ├─ development
│  │  │  ├─ _buildManifest.js
│  │  │  └─ _ssgManifest.js
│  │  ├─ media
│  │  │  ├─ 26a46d62cd723877-s.woff2
│  │  │  ├─ 55c55f0601d81cf3-s.woff2
│  │  │  ├─ 569ce4b8f30dc480-s.p.woff2
│  │  │  ├─ 581909926a08bbc8-s.woff2
│  │  │  ├─ 6d93bde91c0c2823-s.woff2
│  │  │  ├─ 747892c23ea88013-s.woff2
│  │  │  ├─ 93f479601ee12b01-s.p.woff2
│  │  │  ├─ 97e0cb1ae144a2a9-s.woff2
│  │  │  ├─ a34f9d1faa5f3315-s.p.woff2
│  │  │  ├─ ba015fad6dcf6784-s.woff2
│  │  │  └─ df0a9ae256c0569c-s.woff2
│  │  └─ webpack
│  │     ├─ 28bee2b8aca3266e.webpack.hot-update.json
│  │     ├─ 3e52b3cb6ee28248.webpack.hot-update.json
│  │     ├─ 633457081244afec._.hot-update.json
│  │     ├─ 6409b473aed27b9c.webpack.hot-update.json
│  │     ├─ app
│  │     │  └─ [locale]
│  │     │     └─ layout.6409b473aed27b9c.hot-update.js
│  │     ├─ ff4ee7608647284d.webpack.hot-update.json
│  │     ├─ webpack.28bee2b8aca3266e.hot-update.js
│  │     ├─ webpack.3e52b3cb6ee28248.hot-update.js
│  │     ├─ webpack.6409b473aed27b9c.hot-update.js
│  │     └─ webpack.ff4ee7608647284d.hot-update.js
│  ├─ trace
│  └─ types
│     ├─ app
│     │  ├─ [locale]
│     │  │  ├─ (dashboard)
│     │  │  │  ├─ dashboard
│     │  │  │  │  └─ page.ts
│     │  │  │  ├─ layout.ts
│     │  │  │  └─ transactions
│     │  │  │     └─ page.ts
│     │  │  ├─ layout.ts
│     │  │  └─ page.ts
│     │  └─ api
│     │     └─ auth
│     │        └─ [...nextauth]
│     │           └─ route.ts
│     ├─ cache-life.d.ts
│     └─ package.json
├─ LICENSE
├─ README.md
├─ dump
│  └─ amis_management
│     ├─ Activity.bson
│     ├─ Activity.metadata.json
│     ├─ ActivityParticipant.bson
│     ├─ ActivityParticipant.metadata.json
│     ├─ Category.bson
│     ├─ Category.metadata.json
│     ├─ EDM.bson
│     ├─ EDM.metadata.json
│     ├─ Expense.bson
│     ├─ Expense.metadata.json
│     ├─ Payment.bson
│     ├─ Payment.metadata.json
│     ├─ User.bson
│     └─ User.metadata.json
├─ eslint.config.mjs
├─ finance-prd.md
├─ i18n.config.ts
├─ messages
├─ mongod.conf
├─ next-intl.config.js
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  └─ schema.prisma
├─ public
│  ├─ apple-touch.png
│  ├─ apple-touch.svg
│  ├─ favicon-16.png
│  ├─ favicon-16.svg
│  ├─ favicon-32.png
│  ├─ favicon-32.svg
│  ├─ file.png
│  ├─ file.svg
│  ├─ globe.png
│  ├─ globe.svg
│  ├─ next.png
│  ├─ next.svg
│  ├─ og-image-1200x630.png
│  ├─ og-image-1200x630.svg
│  ├─ og-image-600x600.png
│  ├─ og-image-600x600.svg
│  ├─ og-image-800x800.png
│  ├─ og-image-800x800.svg
│  ├─ og-image.jpg
│  ├─ public-og-image.png
│  ├─ site.webmanifest
│  ├─ vercel.svg
│  └─ window.svg
├─ scripts
│  ├─ check-database.ts
│  ├─ delete-expenses.ts
│  ├─ migrate-expenses-to-transactions.ts
│  ├─ seed-db.ts
│  └─ test-db.ts
├─ src
│  ├─ app
│  │  ├─ [locale]
│  │  │  ├─ (auth)
│  │  │  │  └─ login
│  │  │  │     └─ page.tsx
│  │  │  ├─ (dashboard)
│  │  │  │  ├─ activities
│  │  │  │  │  ├─ [id]
│  │  │  │  │  │  ├─ edit
│  │  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  │  ├─ edm
│  │  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  ├─ new
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ analytics
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ categories
│  │  │  │  │  ├─ client.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ dashboard
│  │  │  │  │  ├─ DashboardContent.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ groups
│  │  │  │  │  ├─ [id]
│  │  │  │  │  │  ├─ page.tsx
│  │  │  │  │  │  └─ settlements
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ settings
│  │  │  │  │  ├─ SettingsContent.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ transactions
│  │  │  │  │  ├─ [id]
│  │  │  │  │  │  ├─ edit
│  │  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  ├─ new
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ users
│  │  │  │     ├─ UsersContent.tsx
│  │  │  │     ├─ [id]
│  │  │  │     │  └─ page.tsx
│  │  │  │     ├─ columns.tsx
│  │  │  │     ├─ new
│  │  │  │     │  └─ page.tsx
│  │  │  │     └─ page.tsx
│  │  │  ├─ edm
│  │  │  │  └─ activities
│  │  │  │     └─ [id]
│  │  │  │        ├─ EdmContent.tsx
│  │  │  │        └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ share
│  │  │     └─ transactions
│  │  │        └─ [id]
│  │  │           └─ page.tsx
│  │  ├─ api
│  │  │  ├─ activities
│  │  │  │  ├─ [id]
│  │  │  │  │  ├─ edm
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ toggle
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ active
│  │  │  │  ├─ latest
│  │  │  │  └─ route.ts
│  │  │  ├─ auth
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  ├─ categories
│  │  │  │  ├─ [id]
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ groups
│  │  │  │  ├─ [id]
│  │  │  │  │  └─ members
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ transactions
│  │  │  │  ├─ [id]
│  │  │  │  │  ├─ payment
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ splits
│  │  │  │  └─ route.ts
│  │  │  ├─ upload
│  │  │  │  └─ route.ts
│  │  │  └─ users
│  │  │     ├─ [id]
│  │  │     │  └─ route.ts
│  │  │     └─ route.ts
│  │  ├─ favicon.ico
│  │  └─ globals.css
│  ├─ components
│  │  ├─ ActivityForm.tsx
│  │  ├─ AddMemberDialog.tsx
│  │  ├─ CategoryForm.tsx
│  │  ├─ ConfirmModal.tsx
│  │  ├─ CreateGroupDialog.tsx
│  │  ├─ EdmForm.tsx
│  │  ├─ ExpenseForm.tsx
│  │  ├─ GroupCard.tsx
│  │  ├─ GroupDetail.tsx
│  │  ├─ GroupList.tsx
│  │  ├─ ImageUpload.tsx
│  │  ├─ LanguageSwitcher.tsx
│  │  ├─ ShareButton.tsx
│  │  ├─ SortFilter.tsx
│  │  ├─ TransactionForm.tsx
│  │  ├─ TransactionTable.tsx
│  │  ├─ UserFilter.tsx
│  │  ├─ UserForm.tsx
│  │  ├─ activities
│  │  │  └─ ToggleSwitch.tsx
│  │  ├─ analytics
│  │  │  ├─ ActivityStats.tsx
│  │  │  ├─ CategoryChart.tsx
│  │  │  ├─ MonthlyComparison.tsx
│  │  │  └─ TransactionChart.tsx
│  │  ├─ language-switcher-basic.tsx
│  │  ├─ language-switcher.tsx
│  │  ├─ layout
│  │  │  ├─ navbar.tsx
│  │  │  └─ sidebar.tsx
│  │  ├─ providers
│  │  │  ├─ auth-provider.tsx
│  │  │  └─ loading-provider.tsx
│  │  ├─ share-button.tsx
│  │  └─ ui
│  │     ├─ alert-dialog.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ data-table.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ image-upload.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ loading-button.tsx
│  │     ├─ select.tsx
│  │     ├─ sheet.tsx
│  │     ├─ spinner.tsx
│  │     ├─ switch.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     └─ tooltip.tsx
│  ├─ hooks
│  │  └─ useLanguage.ts
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ i18n
│  │  │  ├─ en.ts
│  │  │  ├─ index.ts
│  │  │  ├─ request.ts
│  │  │  ├─ utils.ts
│  │  │  └─ zh.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  ├─ middleware
│  │  └─ upload-middleware.ts
│  ├─ middleware.ts
│  ├─ store
│  │  └─ use-sidebar.ts
│  └─ types
│     └─ next-auth.d.ts
├─ tailwind.config.ts
├─ tech-stack.md
└─ tsconfig.json

```
```
amis-management
├─ .eslintrc.json
├─ .next
│  ├─ app-build-manifest.json
│  ├─ build-manifest.json
│  ├─ cache
│  │  ├─ .rscinfo
│  │  ├─ images
│  │  │  └─ FEnM9THc2Sct5D8ZT3sIztwmreQEi-nkRbmk3u_w7KE
│  │  │     └─ 31536000.1773896975142.fKjhde8JZwIJulKL-tujXGzEYXGgrnxrLc0k4NqQQDk.YrvseokOaBIuSgv7EUuXodtAlbYo5fl3iEHTqlJGat0.webp
│  │  ├─ swc
│  │  │  └─ plugins
│  │  │     └─ v7_macos_aarch64_4.0.0
│  │  └─ webpack
│  │     ├─ client-development
│  │     │  ├─ 0.pack.gz
│  │     │  ├─ 1.pack.gz
│  │     │  ├─ 10.pack.gz
│  │     │  ├─ 11.pack.gz
│  │     │  ├─ 12.pack.gz
│  │     │  ├─ 13.pack.gz
│  │     │  ├─ 14.pack.gz
│  │     │  ├─ 15.pack.gz
│  │     │  ├─ 16.pack.gz
│  │     │  ├─ 17.pack.gz
│  │     │  ├─ 18.pack.gz
│  │     │  ├─ 19.pack.gz
│  │     │  ├─ 2.pack.gz
│  │     │  ├─ 20.pack.gz
│  │     │  ├─ 21.pack.gz
│  │     │  ├─ 22.pack.gz
│  │     │  ├─ 23.pack.gz
│  │     │  ├─ 24.pack.gz
│  │     │  ├─ 25.pack.gz
│  │     │  ├─ 26.pack.gz
│  │     │  ├─ 27.pack.gz
│  │     │  ├─ 28.pack.gz
│  │     │  ├─ 29.pack.gz
│  │     │  ├─ 3.pack.gz
│  │     │  ├─ 4.pack.gz
│  │     │  ├─ 5.pack.gz
│  │     │  ├─ 6.pack.gz
│  │     │  ├─ 7.pack.gz
│  │     │  ├─ 8.pack.gz
│  │     │  ├─ 9.pack.gz
│  │     │  ├─ index.pack.gz
│  │     │  └─ index.pack.gz.old
│  │     ├─ client-development-fallback
│  │     │  ├─ 0.pack.gz
│  │     │  ├─ 1.pack.gz
│  │     │  ├─ 2.pack.gz
│  │     │  ├─ index.pack.gz
│  │     │  └─ index.pack.gz.old
│  │     ├─ edge-server-development
│  │     │  ├─ 0.pack.gz
│  │     │  ├─ 1.pack.gz
│  │     │  ├─ 2.pack.gz
│  │     │  ├─ 3.pack.gz
│  │     │  ├─ 4.pack.gz
│  │     │  ├─ 5.pack.gz
│  │     │  ├─ 6.pack.gz
│  │     │  ├─ 7.pack.gz
│  │     │  ├─ index.pack.gz
│  │     │  └─ index.pack.gz.old
│  │     └─ server-development
│  │        ├─ 0.pack.gz
│  │        ├─ 1.pack.gz
│  │        ├─ 10.pack.gz
│  │        ├─ 11.pack.gz
│  │        ├─ 12.pack.gz
│  │        ├─ 13.pack.gz
│  │        ├─ 14.pack.gz
│  │        ├─ 15.pack.gz
│  │        ├─ 16.pack.gz
│  │        ├─ 17.pack.gz
│  │        ├─ 18.pack.gz
│  │        ├─ 19.pack.gz
│  │        ├─ 2.pack.gz
│  │        ├─ 20.pack.gz
│  │        ├─ 21.pack.gz
│  │        ├─ 22.pack.gz
│  │        ├─ 23.pack.gz
│  │        ├─ 24.pack.gz
│  │        ├─ 25.pack.gz
│  │        ├─ 26.pack.gz
│  │        ├─ 27.pack.gz
│  │        ├─ 28.pack.gz
│  │        ├─ 29.pack.gz
│  │        ├─ 3.pack.gz
│  │        ├─ 4.pack.gz
│  │        ├─ 5.pack.gz
│  │        ├─ 6.pack.gz
│  │        ├─ 7.pack.gz
│  │        ├─ 8.pack.gz
│  │        ├─ 9.pack.gz
│  │        ├─ index.pack.gz
│  │        └─ index.pack.gz.old
│  ├─ package.json
│  ├─ react-loadable-manifest.json
│  ├─ server
│  │  ├─ _rsc_src_lib_i18n_utils_ts.js
│  │  ├─ _ssr_src_lib_i18n_request_ts.js
│  │  ├─ app
│  │  │  ├─ [locale]
│  │  │  │  ├─ (dashboard)
│  │  │  │  │  ├─ activities
│  │  │  │  │  │  ├─ [id]
│  │  │  │  │  │  │  ├─ page.js
│  │  │  │  │  │  │  └─ page_client-reference-manifest.js
│  │  │  │  │  │  ├─ page.js
│  │  │  │  │  │  └─ page_client-reference-manifest.js
│  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  ├─ page.js
│  │  │  │  │  │  └─ page_client-reference-manifest.js
│  │  │  │  │  └─ groups
│  │  │  │  │     ├─ [id]
│  │  │  │  │     │  ├─ page.js
│  │  │  │  │     │  └─ page_client-reference-manifest.js
│  │  │  │  │     ├─ page.js
│  │  │  │  │     └─ page_client-reference-manifest.js
│  │  │  │  ├─ page.js
│  │  │  │  └─ page_client-reference-manifest.js
│  │  │  ├─ _not-found
│  │  │  │  ├─ page.js
│  │  │  │  └─ page_client-reference-manifest.js
│  │  │  └─ api
│  │  │     ├─ auth
│  │  │     │  └─ [...nextauth]
│  │  │     │     ├─ route.js
│  │  │     │     └─ route_client-reference-manifest.js
│  │  │     └─ groups
│  │  │        ├─ [id]
│  │  │        │  └─ members
│  │  │        │     ├─ route.js
│  │  │        │     └─ route_client-reference-manifest.js
│  │  │        ├─ route.js
│  │  │        └─ route_client-reference-manifest.js
│  │  ├─ app-paths-manifest.json
│  │  ├─ edge-runtime-webpack.js
│  │  ├─ interception-route-rewrite-manifest.js
│  │  ├─ middleware-build-manifest.js
│  │  ├─ middleware-manifest.json
│  │  ├─ middleware-react-loadable-manifest.js
│  │  ├─ next-font-manifest.js
│  │  ├─ next-font-manifest.json
│  │  ├─ pages-manifest.json
│  │  ├─ server-reference-manifest.js
│  │  ├─ server-reference-manifest.json
│  │  ├─ src
│  │  │  └─ middleware.js
│  │  ├─ static
│  │  │  └─ webpack
│  │  │     ├─ 1e55922cab748e69.edge-runtime-webpack.hot-update.json
│  │  │     ├─ 3167bc9a9098bff1.edge-runtime-webpack.hot-update.json
│  │  │     ├─ 471d04f535f26d32.edge-runtime-webpack.hot-update.json
│  │  │     ├─ 4b68c85c7d3a411e.edge-runtime-webpack.hot-update.json
│  │  │     ├─ 633457081244afec._.hot-update.json
│  │  │     ├─ 9b48708af9c6fedd.edge-runtime-webpack.hot-update.json
│  │  │     ├─ a5a026584d1b0503.edge-runtime-webpack.hot-update.json
│  │  │     ├─ ce570597d05dcb88.edge-runtime-webpack.hot-update.json
│  │  │     ├─ edge-runtime-webpack.1e55922cab748e69.hot-update.js
│  │  │     ├─ edge-runtime-webpack.3167bc9a9098bff1.hot-update.js
│  │  │     ├─ edge-runtime-webpack.471d04f535f26d32.hot-update.js
│  │  │     ├─ edge-runtime-webpack.4b68c85c7d3a411e.hot-update.js
│  │  │     ├─ edge-runtime-webpack.9b48708af9c6fedd.hot-update.js
│  │  │     ├─ edge-runtime-webpack.a5a026584d1b0503.hot-update.js
│  │  │     ├─ edge-runtime-webpack.ce570597d05dcb88.hot-update.js
│  │  │     ├─ edge-runtime-webpack.ef8fa04c6b9295c3.hot-update.js
│  │  │     ├─ edge-runtime-webpack.f653ed26ffac38d6.hot-update.js
│  │  │     ├─ ef8fa04c6b9295c3.edge-runtime-webpack.hot-update.json
│  │  │     ├─ f653ed26ffac38d6.edge-runtime-webpack.hot-update.json
│  │  │     └─ src
│  │  │        ├─ middleware.1e55922cab748e69.hot-update.js
│  │  │        ├─ middleware.3167bc9a9098bff1.hot-update.js
│  │  │        ├─ middleware.471d04f535f26d32.hot-update.js
│  │  │        ├─ middleware.4b68c85c7d3a411e.hot-update.js
│  │  │        ├─ middleware.9b48708af9c6fedd.hot-update.js
│  │  │        ├─ middleware.a5a026584d1b0503.hot-update.js
│  │  │        ├─ middleware.ce570597d05dcb88.hot-update.js
│  │  │        ├─ middleware.ef8fa04c6b9295c3.hot-update.js
│  │  │        └─ middleware.f653ed26ffac38d6.hot-update.js
│  │  ├─ vendor-chunks
│  │  │  ├─ @babel.js
│  │  │  ├─ @floating-ui.js
│  │  │  ├─ @formatjs.js
│  │  │  ├─ @panva.js
│  │  │  ├─ @radix-ui.js
│  │  │  ├─ @swc.js
│  │  │  ├─ @vercel.js
│  │  │  ├─ aria-hidden.js
│  │  │  ├─ class-variance-authority.js
│  │  │  ├─ clsx.js
│  │  │  ├─ cookie.js
│  │  │  ├─ date-fns.js
│  │  │  ├─ get-nonce.js
│  │  │  ├─ intl-messageformat.js
│  │  │  ├─ lru-cache.js
│  │  │  ├─ lucide-react.js
│  │  │  ├─ next-auth.js
│  │  │  ├─ next-intl.js
│  │  │  ├─ next.js
│  │  │  ├─ oauth.js
│  │  │  ├─ object-hash.js
│  │  │  ├─ oidc-token-hash.js
│  │  │  ├─ openid-client.js
│  │  │  ├─ preact-render-to-string.js
│  │  │  ├─ preact.js
│  │  │  ├─ react-remove-scroll-bar.js
│  │  │  ├─ react-remove-scroll.js
│  │  │  ├─ react-style-singleton.js
│  │  │  ├─ sonner.js
│  │  │  ├─ tailwind-merge.js
│  │  │  ├─ tslib.js
│  │  │  ├─ use-callback-ref.js
│  │  │  ├─ use-intl.js
│  │  │  ├─ use-sidecar.js
│  │  │  ├─ uuid.js
│  │  │  ├─ yallist.js
│  │  │  └─ zustand.js
│  │  └─ webpack-runtime.js
│  ├─ static
│  │  ├─ chunks
│  │  │  ├─ _app-pages-browser_src_lib_i18n_request_ts.js
│  │  │  ├─ app
│  │  │  │  ├─ [locale]
│  │  │  │  │  ├─ (dashboard)
│  │  │  │  │  │  ├─ activities
│  │  │  │  │  │  │  ├─ [id]
│  │  │  │  │  │  │  │  └─ page.js
│  │  │  │  │  │  │  └─ page.js
│  │  │  │  │  │  ├─ dashboard
│  │  │  │  │  │  │  └─ page.js
│  │  │  │  │  │  ├─ groups
│  │  │  │  │  │  │  ├─ [id]
│  │  │  │  │  │  │  │  └─ page.js
│  │  │  │  │  │  │  └─ page.js
│  │  │  │  │  │  └─ layout.js
│  │  │  │  │  ├─ layout.js
│  │  │  │  │  ├─ loading.js
│  │  │  │  │  └─ page.js
│  │  │  │  ├─ _not-found
│  │  │  │  │  └─ page.js
│  │  │  │  └─ api
│  │  │  │     ├─ auth
│  │  │  │     │  └─ [...nextauth]
│  │  │  │     │     └─ route.js
│  │  │  │     └─ groups
│  │  │  │        ├─ [id]
│  │  │  │        │  └─ members
│  │  │  │        │     └─ route.js
│  │  │  │        └─ route.js
│  │  │  ├─ app-pages-internals.js
│  │  │  ├─ main-app.js
│  │  │  ├─ polyfills.js
│  │  │  └─ webpack.js
│  │  ├─ css
│  │  │  └─ app
│  │  │     └─ [locale]
│  │  │        └─ layout.css
│  │  ├─ development
│  │  │  ├─ _buildManifest.js
│  │  │  └─ _ssgManifest.js
│  │  ├─ media
│  │  │  ├─ 26a46d62cd723877-s.woff2
│  │  │  ├─ 55c55f0601d81cf3-s.woff2
│  │  │  ├─ 569ce4b8f30dc480-s.p.woff2
│  │  │  ├─ 581909926a08bbc8-s.woff2
│  │  │  ├─ 6d93bde91c0c2823-s.woff2
│  │  │  ├─ 747892c23ea88013-s.woff2
│  │  │  ├─ 93f479601ee12b01-s.p.woff2
│  │  │  ├─ 97e0cb1ae144a2a9-s.woff2
│  │  │  ├─ a34f9d1faa5f3315-s.p.woff2
│  │  │  ├─ ba015fad6dcf6784-s.woff2
│  │  │  └─ df0a9ae256c0569c-s.woff2
│  │  └─ webpack
│  │     ├─ 030803aa94104f32.webpack.hot-update.json
│  │     ├─ 0551eefc80022cfe.webpack.hot-update.json
│  │     ├─ 06935179fac023a4.webpack.hot-update.json
│  │     ├─ 0823ab2977f313ea.webpack.hot-update.json
│  │     ├─ 0a15e41adcbaeed0.webpack.hot-update.json
│  │     ├─ 0c96ab9c3f46d718.webpack.hot-update.json
│  │     ├─ 0e4ca431912aa4f2.webpack.hot-update.json
│  │     ├─ 1311e2847d8b246d.webpack.hot-update.json
│  │     ├─ 22b3a6f1e925408d.webpack.hot-update.json
│  │     ├─ 2319ad7515fc8aaf.webpack.hot-update.json
│  │     ├─ 2ee6c33bfcf51e37.webpack.hot-update.json
│  │     ├─ 32302dcfb300f5ec.webpack.hot-update.json
│  │     ├─ 3db9c39b80dfe6d0.webpack.hot-update.json
│  │     ├─ 4407c01a8f3feabc.webpack.hot-update.json
│  │     ├─ 51e66f746f2081ce.webpack.hot-update.json
│  │     ├─ 58a4824b10b820b8.webpack.hot-update.json
│  │     ├─ 633457081244afec._.hot-update.json
│  │     ├─ 6eceb76a032a8782.webpack.hot-update.json
│  │     ├─ 7100fb3bba9882a8.webpack.hot-update.json
│  │     ├─ 750439bc56a237c4.webpack.hot-update.json
│  │     ├─ 7bfb08de91c19499.webpack.hot-update.json
│  │     ├─ 83a831405c0ca135.webpack.hot-update.json
│  │     ├─ 88f24e823cdd2b1e.webpack.hot-update.json
│  │     ├─ 8a2e2059d8db0cb9.webpack.hot-update.json
│  │     ├─ 992ad8bdda373d1b.webpack.hot-update.json
│  │     ├─ a32fccaa054d6d89.webpack.hot-update.json
│  │     ├─ ae526eab6c08877e.webpack.hot-update.json
│  │     ├─ app
│  │     │  └─ [locale]
│  │     │     ├─ (dashboard)
│  │     │     │  ├─ dashboard
│  │     │     │  │  ├─ page.0c96ab9c3f46d718.hot-update.js
│  │     │     │  │  ├─ page.3db9c39b80dfe6d0.hot-update.js
│  │     │     │  │  ├─ page.4407c01a8f3feabc.hot-update.js
│  │     │     │  │  ├─ page.58a4824b10b820b8.hot-update.js
│  │     │     │  │  ├─ page.7100fb3bba9882a8.hot-update.js
│  │     │     │  │  ├─ page.750439bc56a237c4.hot-update.js
│  │     │     │  │  ├─ page.8a2e2059d8db0cb9.hot-update.js
│  │     │     │  │  ├─ page.992ad8bdda373d1b.hot-update.js
│  │     │     │  │  └─ page.d9f7072c0af10223.hot-update.js
│  │     │     │  ├─ groups
│  │     │     │  │  ├─ [id]
│  │     │     │  │  │  ├─ page.0c96ab9c3f46d718.hot-update.js
│  │     │     │  │  │  ├─ page.4407c01a8f3feabc.hot-update.js
│  │     │     │  │  │  ├─ page.58a4824b10b820b8.hot-update.js
│  │     │     │  │  │  ├─ page.750439bc56a237c4.hot-update.js
│  │     │     │  │  │  ├─ page.83a831405c0ca135.hot-update.js
│  │     │     │  │  │  └─ page.c4596d7d1d80db57.hot-update.js
│  │     │     │  │  ├─ page.0c96ab9c3f46d718.hot-update.js
│  │     │     │  │  ├─ page.2ee6c33bfcf51e37.hot-update.js
│  │     │     │  │  ├─ page.3db9c39b80dfe6d0.hot-update.js
│  │     │     │  │  ├─ page.4407c01a8f3feabc.hot-update.js
│  │     │     │  │  ├─ page.58a4824b10b820b8.hot-update.js
│  │     │     │  │  ├─ page.7100fb3bba9882a8.hot-update.js
│  │     │     │  │  ├─ page.750439bc56a237c4.hot-update.js
│  │     │     │  │  ├─ page.8a2e2059d8db0cb9.hot-update.js
│  │     │     │  │  ├─ page.992ad8bdda373d1b.hot-update.js
│  │     │     │  │  ├─ page.b283d9a3d5334570.hot-update.js
│  │     │     │  │  ├─ page.d7d623037da4fadd.hot-update.js
│  │     │     │  │  ├─ page.d9f7072c0af10223.hot-update.js
│  │     │     │  │  ├─ page.e1c8ed68e0f4e66c.hot-update.js
│  │     │     │  │  └─ page.eeacd7d1b33405b0.hot-update.js
│  │     │     │  ├─ layout.0c96ab9c3f46d718.hot-update.js
│  │     │     │  ├─ layout.3db9c39b80dfe6d0.hot-update.js
│  │     │     │  ├─ layout.4407c01a8f3feabc.hot-update.js
│  │     │     │  ├─ layout.58a4824b10b820b8.hot-update.js
│  │     │     │  ├─ layout.7100fb3bba9882a8.hot-update.js
│  │     │     │  ├─ layout.750439bc56a237c4.hot-update.js
│  │     │     │  ├─ layout.8a2e2059d8db0cb9.hot-update.js
│  │     │     │  ├─ layout.992ad8bdda373d1b.hot-update.js
│  │     │     │  └─ layout.d9f7072c0af10223.hot-update.js
│  │     │     ├─ layout.06935179fac023a4.hot-update.js
│  │     │     ├─ layout.0823ab2977f313ea.hot-update.js
│  │     │     ├─ layout.0c96ab9c3f46d718.hot-update.js
│  │     │     ├─ layout.0e4ca431912aa4f2.hot-update.js
│  │     │     ├─ layout.1311e2847d8b246d.hot-update.js
│  │     │     ├─ layout.2319ad7515fc8aaf.hot-update.js
│  │     │     ├─ layout.2ee6c33bfcf51e37.hot-update.js
│  │     │     ├─ layout.32302dcfb300f5ec.hot-update.js
│  │     │     ├─ layout.3db9c39b80dfe6d0.hot-update.js
│  │     │     ├─ layout.4407c01a8f3feabc.hot-update.js
│  │     │     ├─ layout.58a4824b10b820b8.hot-update.js
│  │     │     ├─ layout.7100fb3bba9882a8.hot-update.js
│  │     │     ├─ layout.750439bc56a237c4.hot-update.js
│  │     │     ├─ layout.83a831405c0ca135.hot-update.js
│  │     │     ├─ layout.88f24e823cdd2b1e.hot-update.js
│  │     │     ├─ layout.8a2e2059d8db0cb9.hot-update.js
│  │     │     ├─ layout.992ad8bdda373d1b.hot-update.js
│  │     │     ├─ layout.b283d9a3d5334570.hot-update.js
│  │     │     ├─ layout.bfd20010eef38632.hot-update.js
│  │     │     ├─ layout.c4596d7d1d80db57.hot-update.js
│  │     │     ├─ layout.d7d623037da4fadd.hot-update.js
│  │     │     ├─ layout.d9f7072c0af10223.hot-update.js
│  │     │     ├─ layout.e1c8ed68e0f4e66c.hot-update.js
│  │     │     ├─ layout.e70978244e9ede39.hot-update.js
│  │     │     ├─ layout.eeacd7d1b33405b0.hot-update.js
│  │     │     └─ layout.f43bafd9739e78ef.hot-update.js
│  │     ├─ b283d9a3d5334570.webpack.hot-update.json
│  │     ├─ b90c42995339f436.webpack.hot-update.json
│  │     ├─ ba4954e5997f5cd8.webpack.hot-update.json
│  │     ├─ baff7b24993fc011.webpack.hot-update.json
│  │     ├─ bfd20010eef38632.webpack.hot-update.json
│  │     ├─ c4596d7d1d80db57.webpack.hot-update.json
│  │     ├─ ca19fe8faf118903.webpack.hot-update.json
│  │     ├─ d7d623037da4fadd.webpack.hot-update.json
│  │     ├─ d9f7072c0af10223.webpack.hot-update.json
│  │     ├─ e1c8ed68e0f4e66c.webpack.hot-update.json
│  │     ├─ e70978244e9ede39.webpack.hot-update.json
│  │     ├─ eeacd7d1b33405b0.webpack.hot-update.json
│  │     ├─ f0d81ae61496cec0.webpack.hot-update.json
│  │     ├─ f43bafd9739e78ef.webpack.hot-update.json
│  │     ├─ f6180e5f37a3fd62.webpack.hot-update.json
│  │     ├─ webpack.030803aa94104f32.hot-update.js
│  │     ├─ webpack.0551eefc80022cfe.hot-update.js
│  │     ├─ webpack.06935179fac023a4.hot-update.js
│  │     ├─ webpack.0823ab2977f313ea.hot-update.js
│  │     ├─ webpack.0a15e41adcbaeed0.hot-update.js
│  │     ├─ webpack.0c96ab9c3f46d718.hot-update.js
│  │     ├─ webpack.0e4ca431912aa4f2.hot-update.js
│  │     ├─ webpack.1311e2847d8b246d.hot-update.js
│  │     ├─ webpack.22b3a6f1e925408d.hot-update.js
│  │     ├─ webpack.2319ad7515fc8aaf.hot-update.js
│  │     ├─ webpack.2ee6c33bfcf51e37.hot-update.js
│  │     ├─ webpack.32302dcfb300f5ec.hot-update.js
│  │     ├─ webpack.3db9c39b80dfe6d0.hot-update.js
│  │     ├─ webpack.4407c01a8f3feabc.hot-update.js
│  │     ├─ webpack.51e66f746f2081ce.hot-update.js
│  │     ├─ webpack.58a4824b10b820b8.hot-update.js
│  │     ├─ webpack.6eceb76a032a8782.hot-update.js
│  │     ├─ webpack.7100fb3bba9882a8.hot-update.js
│  │     ├─ webpack.750439bc56a237c4.hot-update.js
│  │     ├─ webpack.7bfb08de91c19499.hot-update.js
│  │     ├─ webpack.83a831405c0ca135.hot-update.js
│  │     ├─ webpack.88f24e823cdd2b1e.hot-update.js
│  │     ├─ webpack.8a2e2059d8db0cb9.hot-update.js
│  │     ├─ webpack.992ad8bdda373d1b.hot-update.js
│  │     ├─ webpack.a32fccaa054d6d89.hot-update.js
│  │     ├─ webpack.ae526eab6c08877e.hot-update.js
│  │     ├─ webpack.b283d9a3d5334570.hot-update.js
│  │     ├─ webpack.b90c42995339f436.hot-update.js
│  │     ├─ webpack.ba4954e5997f5cd8.hot-update.js
│  │     ├─ webpack.baff7b24993fc011.hot-update.js
│  │     ├─ webpack.bfd20010eef38632.hot-update.js
│  │     ├─ webpack.c4596d7d1d80db57.hot-update.js
│  │     ├─ webpack.ca19fe8faf118903.hot-update.js
│  │     ├─ webpack.d7d623037da4fadd.hot-update.js
│  │     ├─ webpack.d9f7072c0af10223.hot-update.js
│  │     ├─ webpack.e1c8ed68e0f4e66c.hot-update.js
│  │     ├─ webpack.e70978244e9ede39.hot-update.js
│  │     ├─ webpack.eeacd7d1b33405b0.hot-update.js
│  │     ├─ webpack.f0d81ae61496cec0.hot-update.js
│  │     ├─ webpack.f43bafd9739e78ef.hot-update.js
│  │     └─ webpack.f6180e5f37a3fd62.hot-update.js
│  ├─ trace
│  └─ types
│     ├─ app
│     │  ├─ [locale]
│     │  │  ├─ (dashboard)
│     │  │  │  ├─ activities
│     │  │  │  │  ├─ [id]
│     │  │  │  │  │  └─ page.ts
│     │  │  │  │  └─ page.ts
│     │  │  │  ├─ dashboard
│     │  │  │  │  └─ page.ts
│     │  │  │  ├─ groups
│     │  │  │  │  ├─ [id]
│     │  │  │  │  │  └─ page.ts
│     │  │  │  │  └─ page.ts
│     │  │  │  └─ layout.ts
│     │  │  ├─ layout.ts
│     │  │  └─ page.ts
│     │  └─ api
│     │     ├─ auth
│     │     │  └─ [...nextauth]
│     │     │     └─ route.ts
│     │     └─ groups
│     │        ├─ [id]
│     │        │  └─ members
│     │        │     └─ route.ts
│     │        └─ route.ts
│     ├─ cache-life.d.ts
│     └─ package.json
├─ LICENSE
├─ README.md
├─ dump
│  └─ amis_management
│     ├─ Activity.bson
│     ├─ Activity.metadata.json
│     ├─ ActivityParticipant.bson
│     ├─ ActivityParticipant.metadata.json
│     ├─ Category.bson
│     ├─ Category.metadata.json
│     ├─ EDM.bson
│     ├─ EDM.metadata.json
│     ├─ Expense.bson
│     ├─ Expense.metadata.json
│     ├─ Payment.bson
│     ├─ Payment.metadata.json
│     ├─ User.bson
│     └─ User.metadata.json
├─ eslint.config.mjs
├─ finance-prd.md
├─ i18n.config.ts
├─ messages
├─ mongod.conf
├─ next-intl.config.js
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  └─ schema.prisma
├─ public
│  ├─ apple-touch.png
│  ├─ apple-touch.svg
│  ├─ favicon-16.png
│  ├─ favicon-16.svg
│  ├─ favicon-32.png
│  ├─ favicon-32.svg
│  ├─ file.png
│  ├─ file.svg
│  ├─ globe.png
│  ├─ globe.svg
│  ├─ next.png
│  ├─ next.svg
│  ├─ og-image-1200x630.png
│  ├─ og-image-1200x630.svg
│  ├─ og-image-600x600.png
│  ├─ og-image-600x600.svg
│  ├─ og-image-800x800.png
│  ├─ og-image-800x800.svg
│  ├─ og-image.jpg
│  ├─ public-og-image.png
│  ├─ site.webmanifest
│  ├─ vercel.svg
│  └─ window.svg
├─ scripts
│  ├─ check-database.ts
│  ├─ delete-expenses.ts
│  ├─ migrate-expenses-to-transactions.ts
│  ├─ seed-db.ts
│  └─ test-db.ts
├─ src
│  ├─ app
│  │  ├─ [locale]
│  │  │  ├─ (auth)
│  │  │  │  └─ login
│  │  │  │     └─ page.tsx
│  │  │  ├─ (dashboard)
│  │  │  │  ├─ activities
│  │  │  │  │  ├─ [id]
│  │  │  │  │  │  ├─ edit
│  │  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  │  ├─ edm
│  │  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  ├─ new
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ analytics
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ categories
│  │  │  │  │  ├─ client.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ dashboard
│  │  │  │  │  ├─ DashboardContent.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ groups
│  │  │  │  │  ├─ [id]
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ settings
│  │  │  │  │  ├─ SettingsContent.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ transactions
│  │  │  │  │  ├─ [id]
│  │  │  │  │  │  ├─ edit
│  │  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  ├─ new
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ users
│  │  │  │     ├─ UsersContent.tsx
│  │  │  │     ├─ [id]
│  │  │  │     │  └─ page.tsx
│  │  │  │     ├─ columns.tsx
│  │  │  │     ├─ new
│  │  │  │     │  └─ page.tsx
│  │  │  │     └─ page.tsx
│  │  │  ├─ edm
│  │  │  │  └─ activities
│  │  │  │     └─ [id]
│  │  │  │        ├─ EdmContent.tsx
│  │  │  │        └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ share
│  │  │     └─ transactions
│  │  │        └─ [id]
│  │  │           └─ page.tsx
│  │  ├─ api
│  │  │  ├─ activities
│  │  │  │  ├─ [id]
│  │  │  │  │  ├─ edm
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ toggle
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ active
│  │  │  │  ├─ latest
│  │  │  │  └─ route.ts
│  │  │  ├─ auth
│  │  │  │  └─ [...nextauth]
│  │  │  │     └─ route.ts
│  │  │  ├─ categories
│  │  │  │  ├─ [id]
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ groups
│  │  │  │  ├─ [id]
│  │  │  │  │  ├─ members
│  │  │  │  │  │  ├─ [memberId]
│  │  │  │  │  │  │  └─ route.ts
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ transactions
│  │  │  │  ├─ [id]
│  │  │  │  │  ├─ payment
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ splits
│  │  │  │  └─ route.ts
│  │  │  ├─ upload
│  │  │  │  └─ route.ts
│  │  │  └─ users
│  │  │     ├─ [id]
│  │  │     │  └─ route.ts
│  │  │     └─ route.ts
│  │  ├─ favicon.ico
│  │  └─ globals.css
│  ├─ components
│  │  ├─ ActivityForm.tsx
│  │  ├─ AddMemberDialog.tsx
│  │  ├─ CategoryForm.tsx
│  │  ├─ ConfirmModal.tsx
│  │  ├─ CreateGroupButton.tsx
│  │  ├─ CreateGroupDialog.tsx
│  │  ├─ EdmForm.tsx
│  │  ├─ ExpenseForm.tsx
│  │  ├─ GroupCard.tsx
│  │  ├─ GroupDetail.tsx
│  │  ├─ GroupList.tsx
│  │  ├─ ImageUpload.tsx
│  │  ├─ LanguageSwitcher.tsx
│  │  ├─ ShareButton.tsx
│  │  ├─ SortFilter.tsx
│  │  ├─ TransactionForm.tsx
│  │  ├─ TransactionTable.tsx
│  │  ├─ UserFilter.tsx
│  │  ├─ UserForm.tsx
│  │  ├─ activities
│  │  │  └─ ToggleSwitch.tsx
│  │  ├─ analytics
│  │  │  ├─ ActivityStats.tsx
│  │  │  ├─ CategoryChart.tsx
│  │  │  ├─ MonthlyComparison.tsx
│  │  │  └─ TransactionChart.tsx
│  │  ├─ language-switcher-basic.tsx
│  │  ├─ language-switcher.tsx
│  │  ├─ layout
│  │  │  ├─ navbar.tsx
│  │  │  └─ sidebar.tsx
│  │  ├─ providers
│  │  │  ├─ auth-provider.tsx
│  │  │  └─ loading-provider.tsx
│  │  ├─ share-button.tsx
│  │  └─ ui
│  │     ├─ alert-dialog.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ checkbox.tsx
│  │     ├─ data-table.tsx
│  │     ├─ dialog.tsx
│  │     ├─ dropdown-menu.tsx
│  │     ├─ image-upload.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ loading-button.tsx
│  │     ├─ select.tsx
│  │     ├─ sheet.tsx
│  │     ├─ spinner.tsx
│  │     ├─ switch.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea.tsx
│  │     └─ tooltip.tsx
│  ├─ hooks
│  │  └─ useLanguage.ts
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ i18n
│  │  │  ├─ en.ts
│  │  │  ├─ index.ts
│  │  │  ├─ request.ts
│  │  │  ├─ utils.ts
│  │  │  └─ zh.ts
│  │  ├─ prisma.ts
│  │  └─ utils.ts
│  ├─ middleware
│  │  └─ upload-middleware.ts
│  ├─ middleware.ts
│  ├─ store
│  │  └─ use-sidebar.ts
│  └─ types
│     └─ next-auth.d.ts
├─ tailwind.config.ts
├─ tech-stack.md
└─ tsconfig.json

```