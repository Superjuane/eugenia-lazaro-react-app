# Website Requirements Questions

Use this as the decision checklist before implementing the full website from scratch.

## 1. Public Website Scope

1. Should the first version be a single-page site, a multi-page site, or single-page now with routes prepared for later?
2. Which sections must be visible on launch: hero, gallery, prices, process, about Eugenia, contact, FAQ, testimonials, Instagram, map?
3. Should `Navidad` exist in the first launch, or stay planned for the next phase?
4. Should `Proceso` be a real section now, and if yes, what steps should it show?

## 2. Visual Direction

1. Should the design feel close to the old sky/cloud website, or completely new?
2. Do you want the site to feel more artesanal/handmade, elegant/minimal, playful/children-focused, or practical/catalog-focused?
3. Do you have preferred colors, fonts, logo usage, or examples of websites you like?
4. Should the hero use a real work photo, the current illustrated/cloud background, or a new generated/created visual?

## 3. Gallery

1. What gallery categories should launch with the new site?
2. Should the home page show all images, only featured images, or a preview that links to a full gallery page?
3. Should every image open in a lightbox?
4. Do you want image titles/descriptions visible on cards, only on hover, or only inside the lightbox?
5. Should gallery ordering be manual, newest-first, category-first, or featured-first?
6. For launch, should we reuse current legacy images or start with a curated smaller set?

## 4. Contact And Conversion

1. What should be the primary contact action: WhatsApp, email, contact form, or all three?
2. Which email should receive messages?
3. Should the form send directly from the site, open the user's mail app, or use a service/backend?
4. Which fields are required: name, email, phone, product type, message, image reference?
5. Should there be a visible call-to-action for custom orders throughout the page?

## 5. Content

1. What exact public name should be used: `Eugenia Lazaro`, `Eugenia Lazaro Pintura Decorativa`, or another brand name?
2. Should the site language be Spanish only, Catalan, English, or multilingual later?
3. What short text should explain the work and custom-order process?
4. Are prices fixed, approximate, hidden, or shown as "from" prices?

## 6. Technical And Deployment

1. Should the first launch remain fully static on Vercel?
2. Do you want routes like `/galeria`, `/contacto`, and `/proceso` immediately?
3. Should we keep dependencies minimal, or is it okay to add libraries for routing, icons, animation, and forms?
4. Do you want preview deployments tested before merging/pushing to `master`?

## 7. Later Admin Phase

1. Who will log in to the admin console?
2. Should uploaded images be public immediately or saved as drafts first?
3. Should admin support editing title, category, description, order, featured flag, and published flag?
4. Should deleting an image remove it permanently or archive it?
5. Which backend/storage are you open to using: Supabase, Firebase, Vercel Blob, another provider, or undecided?

