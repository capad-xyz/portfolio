# UX Psychology of "sticky" portfolios — research

Sourced from HCI research, NN/g, Stanford web credibility, Google. Treat primary
HCI/research numbers as solid; industry-blog stats as directional.

## The hard data
- **First impression forms in ~50ms** and largely sticks (anchoring). [Lindgaard et al.](https://www.tandfonline.com/doi/abs/10.1080/01449290500330448)
- **Design look is the #1 credibility factor — 46.1%** of users, ahead of content/accuracy. [Stanford/Fogg](https://dl.acm.org/doi/10.1145/997078.997097)
- **Aesthetic-usability effect:** a beautiful design is perceived as more usable and buys forgiveness for minor flaws. [NN/g](https://www.nngroup.com/articles/aesthetic-usability-effect/)
- **Attention is top-loaded:** ~57% of viewing time above the fold, ~74% in first two screens, ~81% in first three. [NN/g scrolling](https://www.nngroup.com/articles/scrolling-and-attention/)
- **People read ~28% of words, scan in an F-pattern.** [NN/g F-pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/), [how little users read](https://www.nngroup.com/articles/website-reading/)
- **Speed gates everything: load 1s→3s = +32% bounce; 1s→10s = +123%.** [Google](https://www.google.com/think/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/)
- **Peak-End rule:** experiences are remembered by their emotional peak + their end, not the average. [Laws of UX](https://lawsofux.com/peak-end-rule/)
- **Hick's Law / choice overload:** more choices = slower/no decisions; single dominant CTA lifts action. [Laws of UX](https://lawsofux.com/hicks-law/)
- **Zeigarnik effect / curiosity gaps:** open loops pull people down the page. [open loops](https://blog.neuromarket.co/the-power-of-open-loops-using-the-zeigarnik-effect-to-create-irresistible-content)

## Motion verdict
Purposeful motion (feedback, guidance, perceived performance, ONE delight peak)
helps engagement and memorability (~6-10% lifts on microinteractions). Decorative
/ heavy motion backfires: Awwwards-style spectacle is repeatedly critiqued for
imbalance of beauty vs usability ([Springer study](https://link.springer.com/chapter/10.1007/978-3-032-05802-7_26)); scroll-jacking/parallax/elastic
cause motion sickness (~10% of people) — always honor `prefers-reduced-motion`.
[A List Apart](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/), [web.dev](https://web.dev/articles/prefers-reduced-motion)

## Trust signals (devs/recruiters)
Real working things over tutorials/clones; 3-5 curated projects over 12; the
"why/role/decisions/outcome" not screenshot dumps; concrete metrics over
adjectives; live demos + clean repos; social proof (stars, "used by", testimonials).
[recruiter signals](https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio), [IxDF case studies](https://ixdf.org/literature/article/how-to-write-great-case-studies-for-your-ux-design-portfolio)

## Top 8 (prioritized)
1. Win the first 50ms with a clean, fast, high-craft hero that names your value in one glance.
2. Front-load your single best project + clearest proof in the first 1-2 screens.
3. Keep it under ~3s and mobile-flawless — speed gates everything.
4. Tell each project as a story with a curiosity gap: hook + outcome up top, "how" on scroll.
5. Prove competence: real working things, concrete metrics, the "why" — 3-5 curated, not 12.
6. Make it skimmable for the F-pattern (front-load headings/sentences).
7. Engineer ONE delight peak + a strong, warm ending; `prefers-reduced-motion`, no scroll-jacking.
8. End with one dominant, specific CTA + near-zero-friction contact.

## Anti-patterns
Vague hero; scroll-jacking/parallax overload; slow heavy immersive builds;
screenshot dumps / clone projects; 12+ undifferentiated projects; many competing
CTAs; long/hidden contact forms; adjectives instead of metrics.
