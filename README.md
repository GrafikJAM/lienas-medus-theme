# Lienas Medus — Shopify theme

Custom Online Store 2.0 theme for [lienasmedus.lv](https://lienasmedus.lv).
Bold, colour-blocked, product-first — built from the Lienas Medus brand kit.

## Brand tokens

| Token | Hex | Use |
|---|---|---|
| LM Dark | `#1D202B` | text, rules, primary buttons |
| LM Light | `#FFF5E8` | calm background |
| LM Honey | `#F2A838` | hero blocks, CTAs |
| LM Propolis | `#9C3F23` | secondary blocks |
| Green | `#31856C` | secondary blocks, "Uzturs" sticker |
| Lime | `#D6E040` | accents |
| Lavender | `#8D64AA` | accents |
| Sky | `#6CBAD6` | accents (value to confirm) |

All colours are editable in **Theme settings → Brand colours**. Every section has a
**Colour block** setting so the page can alternate honey / dark / green blocks.

Fonts: **Larken** (headings) + **Josefin Sans** (body, from the Shopify font library).

### Larken webfont

Larken is a licensed font, so the files are **not** in this public repo. The theme loads
them from **Shopify admin → Content → Files** and uses the files already uploaded there:
`EllenLuff_-_Larken_Regular.otf`, `_Medium.otf`, `_Medium_Italic.otf`, `_Bold.otf`,
`_Bold_Italic.otf` and `EllenLuff_-_Larken_Variable.ttf` (ExtraBold and fallback).

### Logos

The logo, LM mark and round badge are inline vector snippets traced from the brand
source files (`snippets/logo-horizontal.liquid`, `logo-mark.liquid`, `logo-badge.liquid`).
They use `currentColor`, so they turn light on dark sections automatically. The favicon is
`assets/favicon.png` (LM icon). You can still override any of them with an uploaded
image in the theme editor.

## Structure

- `layout/theme.liquid` – shell, header/footer groups, cart drawer
- `sections/` – hero, category tiles, featured products, image with text (story),
  scrolling text, big statement ("Ēd to ar:"), features, banner (seasonal box / farm visit),
  newsletter, gift set builder, related products, plus `main-*` template sections
- `snippets/` – product card (size pills + quick add), price, stickers, cart lines, icons
- `templates/` – JSON templates incl. `product.gift-set` and `page.about` / `page.contact`
- `assets/base.css`, `assets/theme.js` – no build step, no dependencies

## Store setup after installing

1. **Header**: set the menu (the logo is built in).
2. Logos, badge and favicon are bundled. Larken is read from the font files already in Content → Files (above).
3. **Product tags** drive the stickers: `medus`, `mix`, `popular`, `bio`, `new`.
4. **Label colour per product** (optional): create a product metafield
   `custom.label_color` (type *Colour*) — cards and product pages tint with it.
5. **Gift set**: assign the template `product.gift-set` to
   *Saliec savu dāvanu komplektu!* — customers pick 3 mixes; the selection is saved
   as a line item property.
6. **Pages**: assign `page.about` to *Par Mums* and `page.contact` to *Kontakti*.

## Development

```bash
shopify theme dev --store lienas-medus.myshopify.com   # local preview
shopify theme push --unpublished                        # upload as a new, unpublished theme
shopify theme check                                     # lint
```

Never `shopify theme push` to the live theme without review.
