# rambl

### _don’t keep in your crash outs_

**are you ready to rambl?**

**rambl** is a high-empathy mental health support app built for one thing:  
helping you **let it out safely** when you’re emotionally overloaded, _then_ helping you **calm down and make a plan** when you’re ready.

rambl is built to de-escalate your crashouts. It’s designed for the “emotional overwhelm” moment: when your brain is too stressed to problem-solve, and you just need somewhere judgment-free to unload.

---

## what is rambl?

### 1) The Vent (Total Catharsis)

You open the app and **talk or type freely**.  
No interruptions. No “helpful hints.” No lectures.  
Just a space to **get it out**.

**Voice mode** makes it feel like you’re talking to a real friend who’s simply there.

### 2) The Empathy (Validation first)

When you’re done, the AI **doesn’t jump into fix-it mode**.  
It responds with **high-empathy validation** to help your intensity drop.
The goal is to help you feel heard, grounded, and less activated.

### 3) The Game Plan (Only when you click)

When you’re ready and willing, you tap a button and rambl turns your vent into a **clear, doable plan**, including:

- A quick way to calm down **right now**
- A simple “script” for tough conversations
- 1–2 small actions you can do **today**

---

## Why it exists

When emotions spike, advice can feel annoying or impossible to apply.  
rambl flips the order:

**Feel heard → calm down → think clearly → take action**

---

## Key Features

### “Crash Out → Calm Out” flow

- Vent freely (no interruptions)
- Get validated (no fixing)
- Build a plan (only when invited)

### Voice that feels human

Powered by **ElevenLabs** for a calm, friendly tone (no robotic vibes).

### Privacy-first by default

- Designed to be **judgment-free + private**
- Optional **auto-delete** so raw vents don’t live past the session

### Inner Circle

If your trusted people are asleep/busy, you can send them a **short summary** of what’s going on — without dumping 10 minutes of rant text.

### Patterns

Over time, rambl can gently surface trends like:

- “You’ve vented about your boss four times this week”
- “You feel most overwhelmed on Sunday nights”

(So you can spot what’s actually draining you.)

---

## Tech Stack

**Google Gemini** — the brain

- Understands messy context
- Extracts root problems + themes
- Generates calming steps + scripts + tiny action plans

**ElevenLabs** — the voice

- Warm, human, grounding audio responses
- Helps voice mode feel like “talking it out”

**Safety + Privacy**

- Minimal retention by design
- Optional auto-delete for vents
- Summaries are share-only if **you choose to send them**

---

## UI / Brand Direction (Playfully Soft)

rambl is inspired by the “Dumb Ways to Die” vibe:
**soft pastels, silly bloopy mascots, and rounded typography.**

---

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.avatar_photos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar_url text NOT NULL,
  user_id uuid NOT NULL UNIQUE,
  CONSTRAINT avatar_photos_pkey PRIMARY KEY (id),
  CONSTRAINT avatar_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.conversations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text,
  summary text,
  words ARRAY,
  user_id uuid,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.conversations_to_theme (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  conversation_id bigint NOT NULL,
  theme_id bigint NOT NULL,
  CONSTRAINT conversations_to_theme_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_to_theme_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT conversations_to_theme_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id)
);
CREATE TABLE public.preferences (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE,
  ai_personality text NOT NULL,
  ai_style text NOT NULL,
  ai_action text NOT NULL,
  background_colour text,
  CONSTRAINT preferences_pkey PRIMARY KEY (id),
  CONSTRAINT preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.themes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  label character varying NOT NULL,
  count integer NOT NULL DEFAULT 1,
  CONSTRAINT themes_pkey PRIMARY KEY (id),
  CONSTRAINT themes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

