# snapgrade

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_B6JTVeSGEcrUFye1Mm6ejdwgNiE5)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Deploy to Vercel

1. Push this repository to GitHub, then import it in [Vercel](https://vercel.com/new).
2. Leave the framework preset as **Next.js** and use the default build command (`npm run build`).
3. In **Project Settings → Environment Variables**, add these values for Production, Preview, and Development:

   ```text
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   GEMINI_API_KEY
   OPENROUTER_API_KEY
   ```

   `GEMINI_API_KEY` and `OPENROUTER_API_KEY` are server-only secrets. Do not prefix either with `NEXT_PUBLIC_`.
4. In Supabase Auth, add your Vercel URL (and later any custom domain) to the allowed redirect URLs/site URL. Keep the existing localhost URL for local development.

The worksheet endpoint uses the Node.js runtime and `sharp` is a direct production dependency, so Vercel installs the native image binary required to generate PDFs. Grading and worksheet functions allow up to 60 seconds to complete.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
