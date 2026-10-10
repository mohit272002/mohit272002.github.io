# Mohit Khairnar — Portfolio

A single-page portfolio site built from `Mohit_Khairnar_Resume_AI_Engineer_Mastercard.docx`.

Static HTML, CSS and vanilla JavaScript — **no build step, no dependencies.**
Open `index.html` or drop the folder on any static host.

---

## Run it locally

```bash
# any static server works
python -m http.server 4173
# → http://127.0.0.1:4173
```

Opening `index.html` directly from disk also works.

---

## Structure

```
.
├── index.html                        # all content, semantic + SEO-ready
├── assets/
│   ├── css/styles.css                # design tokens + all styling
│   ├── js/main.js                    # progressive enhancement
│   ├── favicon.svg
│   ├── Mohit_Khairnar_Resume.pdf     # generated from your .docx
│   └── img/
│       ├── mohit-khairnar.jpg            # original (1.3 MB, keep as master)
│       ├── mohit-khairnar-portrait.jpg   # 900×1200 — hero
│       └── mohit-khairnar-square.jpg     # 720×720  — og:image
└── tools/validate.js                 # run `node tools/validate.js` to self-check
```

---

## ✅ Nothing left to fill in

LinkedIn and GitHub are wired up in the Contact section and open in a new tab:

- `https://www.linkedin.com/in/mohit-khairnar08`
- `https://github.com/mohit272002`

**Keeping the résumé PDF current.** `assets/Mohit_Khairnar_Resume.pdf` was
exported from your .docx with Word. Re-export it any time:

```powershell
$word = New-Object -ComObject Word.Application
$doc = $word.Documents.Open("C:\path\to\resume.docx", $false, $true)
$doc.SaveAs([ref]"D:\Projects\Portfolio Web\assets\Mohit_Khairnar_Resume.pdf", [ref]17)
$doc.Close([ref]0); $word.Quit()
```

---

## Design

Matched to the reference screenshots you supplied, sampled directly from the
image pixels:

| Token | Value | Where it came from |
|---|---|---|
| Canvas | `#08080a` → `#0c0c0e` | measured page background |
| Accent | `#8ab4ff` | measured light-blue highlight |
| Violet / Teal blooms | `#a78bfa` / `#5eead4` | measured magenta & teal tints |
| Body text | `#9696a1` | measured paragraph grey |
| Primary button | `#ffffff → #e6e6ea` | measured `#eaeaea` pill |
| Display type | `clamp(46px, 7.4vw, 104px)` | measured ~118px cap height, 122px leading |

The reference is a near-black canvas with soft coloured radial blooms, oversized
display type, a light pill button paired with a ghost button, pill-shaped skill
tags, and a top nav — all reproduced here.

Everything is driven by custom properties at the top of `styles.css`, so a
full re-colour means editing ~20 lines.

---

## Features

- **Responsive** — single column under 1080px, slide-down nav under 860px
- **Accessible** — semantic landmarks, skip link, `aria-expanded` on the menu,
  `aria-label` on icon links, visible focus rings, one `<h1>`
- **Print stylesheet** — prints as a clean one-page CV on white (footer link
  "Print this page")
- **Motion-safe** — full `prefers-reduced-motion` support
- **JS-free fallback** — reveal animations only activate once JS confirms it
  (`html.js` is set in `<head>`), so content is never hidden if a script fails
- **Self-checking** — `node tools/validate.js` verifies tag nesting, anchors,
  asset paths, alt text, CSS variables, and that every JS selector matches a
  styled class

## Interactions

Scroll progress bar · sticky header · scroll-spy nav · count-up statistics ·
cursor-tracking spotlight on project cards · back-to-top · marquee.

---

## Deploying

| Host | Steps |
|---|---|
| **GitHub Pages** | push to a repo → Settings → Pages → deploy from `main` / root |
| **Netlify** | drag the folder onto app.netlify.com/drop |
| **Vercel** | `npx vercel --prod` |
| **Cloudflare Pages** | connect repo, build command *(none)*, output `/` |

No build command is required for any of them.