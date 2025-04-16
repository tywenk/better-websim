"Mob Vibe Coding"

Recreation of websim from scratch.

Dashboard view. See friends latest plays and explore and search for existing games:
![Screenshot 2025-04-09 at 3 36 50 PM](https://github.com/user-attachments/assets/e56c3507-6977-45ea-8328-8db2c93c2e52)

Generate games with natural language:
![Screenshot 2025-04-09 at 3 37 40 PM](https://github.com/user-attachments/assets/562b5887-ffc8-4111-9a0c-0edb050050ea)

See friend's (mostly) realtime online status.
![Screenshot 2025-04-09 at 3 38 03 PM](https://github.com/user-attachments/assets/28a4c9aa-517c-4f55-b246-f64051ab0d44)


## Getting Started With Development

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Run an initial database migration:

```bash
npm run db:migrate
```

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

First, you need to create a d1 database in Cloudflare.

```sh
npx wrangler d1 create <name-of-your-database>
```

Be sure to update the `wrangler.toml` file with the correct database name and id.

You will also need to [update the `drizzle.config.ts` file](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit), and then run the production migration:

```sh
npm run db:migrate-production
```

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
