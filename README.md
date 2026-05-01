# SkinCosmic AI - Skincare Chatbot

SkinCosmic AI is a skincare consultation chatbot built with Next.js. The application lets users create a personal skin profile, chat with AI, upload skin images for preliminary visual analysis, receive product suggestions, and generate morning/evening skincare routines.

## What can the chatbot do?

- Answer skincare questions in Vietnamese.
- Personalize responses based on the user's skin profile, including skin type, priority concerns, ingredients to avoid, budget, and current products.
- Analyze uploaded skin images at a visible-condition level without diagnosing diseases.
- Suggest products that match the user's skin type, concerns, and budget.
- Display product recommendations as cards with product name, brand and price.
- Generate morning/evening skincare routines when requested by the user.
- Arrange routine steps in a reasonable skincare order.
- Save generated routines so users can track them daily.
- Track routine completion progress by date with a checklist and calendar history.
- Store the skin profile, routine, and tracker state in `localStorage`.
- Support Google sign-in through NextAuth.

## Main user flow

1. The user signs in with Google if needed.
2. The user fills in a skin profile: skin type, skin concerns, allergies/ingredients to avoid, budget, and current products.
3. The user chats with the chatbot or uploads a skin image.
4. The `/api/chat` API sends the question, skin profile, and image to Gemini.
5. Gemini returns JSON containing the reply, product list, and routine if available.
6. The frontend displays the message, product cards, routine timeline, and saves the routine to the tracker.

## Tech stack

- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- JavaScript for API routes
- Tailwind CSS `4`
- Google Generative AI SDK `@google/generative-ai`
- AI model: `gemini-2.5-flash-lite`
- NextAuth `4` with Google Provider
- Lucide React for icons
- Browser `localStorage` for storing skin profile data and routine tracker state

## Main structure

```text
app/
  api/
    auth/[...nextauth]/route.js   # Google sign-in with NextAuth
    chat/route.js                 # API that calls Gemini and returns JSON to the frontend
  components/
    AuthProvider.tsx              # Wraps SessionProvider
    ChatInput.tsx                 # Chat input and image upload
    MessageItem.tsx               # Displays messages, products, and routines
    ProductCard.tsx               # Product recommendation card
    RoutineTimeLine.tsx           # AI-generated routine timeline
    RoutineTracker.tsx            # Checklist and calendar history for routine tracking
    SkinProfilePanel.tsx          # Skin profile form
  layout.tsx
  page.tsx                        # Main chatbot screen
```

## Environment variables

Create a `.env.local` file in the project root and configure:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_URL=http://localhost:3000
```

## Run the project

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Chạy production server:
Run the production server:

```bash
npm run start
```

## Note

The chatbot is intended for skincare guidance and product suggestions only. It does not replace medical diagnosis. For severe, painful, inflamed, or long-lasting skin conditions, users should consult a dermatologist.




