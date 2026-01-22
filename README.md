# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4838acfe-b0c2-4a7e-877c-63707d04e068

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4838acfe-b0c2-4a7e-877c-63707d04e068) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4838acfe-b0c2-4a7e-877c-63707d04e068) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## EDM Promo Builder (Golf 360)

### Setup
- Ensure `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY` are set in your environment.
- Add `CONVEX_OPENROUTER_API_KEY` in Convex for bullet generation.
- Add `KIMI_API_URL`, `KIMI_API_KEY`, and `KIMI_MODEL` in Convex for campaign copy generation.
- Run `npm i` and `npm run dev`.

### Campaign copy generation
- Set `KIMI_API_URL` to your Kimi endpoint (OpenRouter-compatible URL).
- Set `KIMI_API_KEY` to your API key.
- Set `KIMI_MODEL` to the Kimi K2 model ID (for example: `moonshotai/kimi-k2`).
- Run "Generate" on a submitted promo to generate campaign copy + bullets.

### Admin workflow (Andrew)
1. Visit `/admin` to seed the Golf 360 client record.
2. Generate or rotate Scott's portal link from the dashboard.
3. Import Shopify CSVs at `/admin/import`.
4. Review promotions at `/admin/promotions/:id` and copy Canva packs.
5. Apply collection rules with the rules CSV at `/admin/import` (manual collections are skipped).

### Client workflow (Scott)
1. Open the signed portal URL supplied by Andrew.
2. Create a promotion, search products, add pricing, and submit.
3. Track submitted promotions from the portal home.
