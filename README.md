# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.


## TODO
- [x] Make it deploy (vercel)
- [x] Scaffold basic UI with mock data (v0)
- [x] break up the UI into React components
- [x] send button
- [x] implement basic ChatGPT convo with Vercel AI
- [x] Rename Spock to ConvoNav
- [ ] Reconcile my Balloon component and BalloonProps with action.tsx ClientMessage interface 
- [ ] add tools
- [ ] figure out how to add unit tests
- [ ] setup db (sqlite)
- [ ] save convo to DB as messages are added
- [ ] new convo button
- [ ] load convo from db when selected in convo nav
- [ ] handling of errors and edge cases
- [ ] error management (w/ Sentry)
- [ ] Add instructions to setup and run the app here in README
- [ ] Use uploadthing.com for images if I need any


## Stuff I did
Learn a bunch about v0, Create T3 App (This is my first React app and first TypeScript app.)
Learn about ReAct prompting (I basically knew the idea and CoT as well, just didn't know the name "ReAct")
Explored lots of free public APIs to potentially use as tools.
(Install VSCode)
(Install pnpm)
pnpm create t3-app@latest
pnpm db:push
git commit -m "initial commit"
pnpm dev
(brew install gh)
(gh auth login)
gh repo create
Created Vercel project from GitHub repo
Added DB environment var to Vercel project to it can deploy to prod (automatically on push to main)
Use v0 to kick start a UI
pnpm dlx shadcn-ui@latest init
npx v0 add TxkI58twHZ9
Put generated v0 component in top level of page.tsx
Break up generated UI into nicer components: Balloon, Convo...
Added a simple ai.ts script to play with Vercel AI SDK via command line.
Got an example using Vercel's ai/rsc and worked it into my Convo component.
