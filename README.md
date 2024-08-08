# Spock 🖖

My first thought was to call this project Spock. Upon further reflection, 
I think Kirk would be a better name.
This reflects the reality that we (as much as I don't like speaking for all 
of civilization) always thought AI, when it came, would solve the logical problems 
that people were bad at.
Instead, the emergence of GenAI/LLMs has disrupted mostly creative - emotional - 
fields where we never thought it would play.
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
The "tools" are:
1. Wolfram Alpha for calculations
2. a QR Code generator
3. a silly joke generator

Try out any prompt from simple things like "What's your name?" to 
prompts using a single tool like "tell me a joke" or "calculate pi^pi" to
prompts that require more complex reasoning and one or more tools like
"Make me a QR code that encodes the capital of New York." or
"Make a QR code with the result of 42*42 as it's message."

Yay science! 🖖

## How Does it Work?
### The AI/LLM/ReAct Magic
Vercel's AI SDK seems to implement ReAct prompting at least with it's
`generateText` call. I say "seems to" because, if it walks like a duck
and talks like a duck... I haven't seen anywhere in their docs where
they explicitly call out ReAct prompting, but it's clearly able to
chain together multiple calls to the underlying LLM, including use of
tools outside the LLM in order to handle a single prompt.

`generateText` (but not yet their purportedly fancier APIs like `streamUI`)
accepts a `maxToolRoundtrips` parameter which defaults to 0 but which
you can use to allow the agent to go back and forth multiple times
to handle things like "Make a QR code with the result of 42+42 as it's message."
It returns it's "thought process" as a sequence akin to:
1. Use the calculator tool to compute "42+42".
2. Calculator tool returned result 84.
3. Use the QR code tool to generate a QR code containing data 84.
4. QR Code tool returned URL blah blah...
5. "I generated a QR code containing 84."

I then use that sequence of steps in reverse to construct the response
to show to the human user in the chat.
Specifically: The last item (ie: 5) is always there and contains the friendly text
to display. If one or more tools was used then he prior two items in the
sequence (ie: 3 and 4) contain the final tool result, which tool was used
and what it's input was. All of which may or may not be used to construct
a rich (React component) portion of the result to display to the user.

### The DB/data store
It's not very fancy. While a conversation is ongoing, each convo
is wrapped with an AIProvider. That provider plus some "oh so clever code"
manage two parallel arrays, one that's the rich UI version of the convo
another that's the under-the-hood AI version. As the UI is updated,
the AI one is too and the AI one (more "machine readable") is persisted
to the DB.

There's only two tables: the top level `conversations` and the
detail level `messages` which have a foreign key to their convo.

## Weak Areas
Let's face it: Software is never done so this has weak areas.
1. Error handling/logging/monitoring and unit testing. This is for sure the
weakest area. I'd never ship a real product with unit testing, but in this case
it was just one too many new things to learn in short order. (I'm new to
TypeScript, React, Next, Tailwind and the Vercel AI SDK so...) I would lean hard on this
in a real gig, learning fast on my own but also from lots of questions and
code reviews.
2. Just like you mentioned: CSS. Though I'm loving Tailwind, it took me way
too long to fix a couple silly UI bugs and at least a couple I didn't figure out (yet).
3. The full-on ReAct prompting was a late-breaking change. I'd implemented everything
with `streamUI` thinking it was capable of more so the reworked full-ReAct
`continueConversation` is a bit sloppy. It needs more consistent handling
of tool results and some robustness around interpreting the `responseMessages`
from the AI.

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
