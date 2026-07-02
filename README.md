# स्तोत्रसुधामंजिरी (StotraSudhaManjiri)

A minimalist, bloat-free collection of Shlokas and Stotras in Marathi, built with
Jekyll and served on GitHub Pages. Works offline as a PWA.

## Structure

| Path | Purpose |
|---|---|
| `_shlokas/` | One `.md` file per shloka/stotra (content collection) |
| `_devatas/` | One `.md` file per devata (index pages, tag cloud) |
| `_layouts/` | `default` (shell), `shloka` (reading page), `devata` (listing) |
| `assets/js/app.js` | All client JS: search, saved lists (localStorage), save modal, PWA install |
| `style.css` | Single stylesheet; all colors are CSS variables (dark + light mode) |
| `sw.js` | Service worker: network-first with offline cache fallback |

## Adding a shloka

Create `_shlokas/<english-name>.md` — no layout needed, it's set by `_config.yml` defaults:

```markdown
---
title: वक्रतुण्ड महाकाय
devata: श्री गणपती
english_title: vakratunda mahakaya
---
वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।
निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
```

- `devata` must exactly match the `title` of a page in `_devatas/` — that links the
  shloka to its devata page and the "More for …" navigation.
- `english_title` (and `devata`) are searchable from the homepage search box,
  so users can type in Latin script too.
- Body text keeps its line breaks (`white-space: pre-wrap`); dandas (`।`/`॥`) are
  automatically kept attached to the preceding word.

## Adding a devata

Create `_devatas/<english-name>.md`:

```markdown
---
title: श्री गणपती
english_title: Shri Ganapati
emoji: 🐘
---
```

- `emoji` is optional; it shows in the homepage tag cloud and the devata page heading.
- Any markdown body you add appears below the shloka list on the devata page.

## Local development

```sh
gem install jekyll
jekyll serve
```

Note: the service worker caches aggressively; bump `CACHE_NAME` in `sw.js`
when changing core assets.
