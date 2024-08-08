# Spock 🖖

My first thought was to call this project Spock. Upon further reflection, I think Kirk would be a better name.
This reflects the reality that we (as much as I don't like speaking for all of civilization) always thought AI, when it came, would solve the logical problems that people were bad at.
Instead, the emergence of GenAI/LLMs has disrupted mostly creative - emotional - fields where we never thought it would play.
Kirk.
Not Spock.
QED LLAP 🖖

## Setup
(Assumes you have pnpm installed. If not: [install pnpm](https://pnpm.io/installation))
1. `pnpm db:push` to initialize the database.

## Running the App
1. `pnpm dev` to start the dev server.
2. go to [http://localhost:3000/](http://localhost:3000/)

## OK, WTH is This Thing?
It's basically ChatGPT with some tools integrated.
Specifically, it integrates Wolfram Alpha for calculations, a QR Code generator and a silly joke generator.
In all honesty, I'm not sure if you'd call this full on ReAct reasoning.
Vercel's AI SDK is clearly letting ChatGPT do some chaining behind the seens, because it can answer prompts
like "Make me a QR code that encodes the capital of New York." which implies that it first had to figure out
that the capital of New York is Albany before then using the QR code tool. It can't, however, use more than
one tool to answer a prompt. i.e.: "Make a QR code with the result of 42*42 as it's message." trips it up
and it'll just do the calc with Wolfram Alpha and stop there. (Although you can then ask it to 
"Encode that result in a QR code" and it'll know what result you mean from the conversation history.)

## Tech
This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.
It makes use of:

- [Next.js](https://nextjs.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

I used [v0](https://v0.dev/) for the initial UI design.


## TODO
- [x] Make it deploy (vercel)
- [x] Scaffold basic UI with mock data (v0)
- [x] break up the UI into React components
- [x] send button
- [x] implement basic ChatGPT convo with Vercel AI
- [x] Rename Spock to ConvoNav
- [x] Reconcile my Balloon component and BalloonProps with action.tsx ClientMessage interface 
- [x] add WolframAlpha for calculator tool
- [x] Bug: Send button doesn't clear out the message in the textarea.
- [x] add QR code generator as a tool
- [x] setup db (sqlite)
- [x] load convo messages from db when selected in convo nav
- [x] load actual list of conversations from DB into left nav
- [x] new convo button
- [x] Bug: Active conversation is not selected in the left nav.
- [x] Save convo to DB: figure out why only assistant messages are added
- [x] Save convo to DB: implement proper dehydration/hydration of react messages
- [x] Save convo to DB: upsert instead of reinserting all messages each time (switch to nanoid as db id)
- [x] MAJOR BUG: The agent loses the convo history even though it's visible in the UI. InitialAIState?
- [x] Bug: Sometimes assistant message (plain text) appears as JSON string in UI. (Hilariously this was ChatGPT thinking it was being helpful.)
- [x] Bug: Contents of left nav and chat window are visible through UI titles when scrolled behind.
- [x] Reimplement continueConversation to do more full-fledged ReAct prompting.
- [x] Add instructions to setup and run the app here in README
- [x] Autoformatted code for consistency
- [ ] Bug: Figure out why it doesn't seem to always refresh display of the most recent message when switching convos and switching back.
- [ ] Bug: UI left nav and chat window scroll together.
- [ ] figure out how to add unit tests
- [ ] handling of errors and edge cases
- [ ] error management (w/ Sentry)

## Captain's Log
- Learn a bunch about v0, Create T3 App (This is my first React app and first TypeScript app.)
- Learn about ReAct prompting (I basically knew the idea and CoT as well, just didn't know the name "ReAct")
- Explored lots of free public APIs to potentially use as tools.
- (Install VSCode)
- (Install pnpm)
- pnpm create t3-app@latest
- pnpm db:push
- git commit -m "initial commit"
- pnpm dev
- (brew install gh)
- (gh auth login)
- gh repo create
- Use v0 to kick start a UI
- pnpm dlx shadcn-ui@latest init
- npx v0 add TxkI58twHZ9
- Put generated v0 component in top level of page.tsx
- Break up generated UI into nicer components: Balloon, Convo...
- Added a simple ai.ts script to play with Vercel AI SDK via command line.
- Got an example using Vercel's ai/rsc and worked it into my Convo component.
- Added the QR code generator at api.qrserver.com as a second tool.
- Reworked the UI code to more correctly use Next.js page/layout conventions.
- Selecting an item from the left nav changes the url to specify a new conversation.
- Oof. Finally figured out the (simple in retrospect) use of multiple AI providers so a sketch of loading from DB is working now.
- Load conversation list from DB to left nav and implement new conversation button.
- Active convo now selected in left nav list.
- Moar DB message saving/rehydrating work.
