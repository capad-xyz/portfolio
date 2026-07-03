"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

type Item = { id: "home" | "work" | "about" | "experience" | "stack" | "testimonials" | "contact"; label: string };

const ITEMS: Item[] = [
  { id: "home", label: "home" },
  { id: "work", label: "work" },
  { id: "about", label: "about" },
  { id: "experience", label: "experience" },
  { id: "stack", label: "stack" },
  { id: "testimonials", label: "words" },
  { id: "contact", label: "contact" },
];

/**
 * Right-rail liquid-glass navigation. Dots over a goo filter; hovering fuses an
 * ink label pill into the dot (one mercury chip), a connector bridges hover and
 * active dots, and clicking ripples a splash. Scroll-spy is positional — the
 * active section is recomputed from live geometry on every scroll frame — and
 * locks while a programmatic scroll is in flight so intermediate sections
 * don't flicker through the rail.
 */
export function DotNav() {
  const lenis = useLenis();
  const railRef = useRef<HTMLElement>(null);
  const blobLayerRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLSpanElement>(null);
  const blobRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const touchRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const hoverRef = useRef(-1);
  const pullRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const didMountRef = useRef(false);
  const lockRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const positionConnector = () => {
    const c = connectorRef.current;
    const rail = railRef.current;
    if (!c || !rail) return;
    const hi = hoverRef.current;
    const ai = activeRef.current;
    if (hi < 0 || hi === ai) {
      c.style.opacity = "0";
      return;
    }
    const lo = Math.min(hi, ai);
    const high = Math.max(hi, ai);
    const a = blobRefs.current[lo]?.getBoundingClientRect();
    const b = blobRefs.current[high]?.getBoundingClientRect();
    if (!a || !b) return;
    const railRect = rail.getBoundingClientRect();
    let top = a.top + a.height / 2 - railRect.top;
    let bottom = b.top + b.height / 2 - railRect.top;
    if (hi === lo) top += pullRef.current;
    else bottom += pullRef.current;
    c.style.top = `${top}px`;
    c.style.height = `${Math.max(0, bottom - top)}px`;
    c.style.opacity = "1";
  };

  useEffect(() => {
    activeRef.current = active;
    positionConnector();
    if (typeof window === "undefined") return;
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const id = ITEMS[active].id;
    const desired = id === "home" ? window.location.pathname + window.location.search : `${window.location.pathname}${window.location.search}#${id}`;
    if (window.location.pathname + window.location.search + window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [active]);

  // Lock the spy while a programmatic scroll is in flight; released by the
  // scroll's completion callback, with a timer as a safety net.
  const lockSpy = (ms: number) => {
    lockRef.current = true;
    if (lockTimerRef.current !== null) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false;
      lockTimerRef.current = null;
    }, ms);
  };
  const releaseSpy = () => {
    if (lockTimerRef.current !== null) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = null;
    lockRef.current = false;
  };

  const scrollToIndex = (idx: number) => {
    setActive(idx);
    lockSpy(1600);
    const l = lenisRef.current;
    if (idx === 0) {
      if (l) l.scrollTo(0, { onComplete: releaseSpy });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(ITEMS[idx].id);
    if (!el) {
      releaseSpy();
      return;
    }
    if (l) l.scrollTo(el, { onComplete: releaseSpy });
    else el.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToIndexRef = useRef(scrollToIndex);
  scrollToIndexRef.current = scrollToIndex;

  // On load with a hash, sync the rail immediately and glide to the section.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    const idx = ITEMS.findIndex((it) => it.id === hash);
    if (idx <= 0) return;
    setActive(idx);
    const timer = window.setTimeout(() => scrollToIndexRef.current(idx), 80);
    return () => window.clearTimeout(timer);
  }, []);

  // Positional scroll-spy: the active section is the last one whose top has
  // crossed the probe line (42% down the viewport). Deterministic on reload,
  // resize, and slow scrolls — no observer thresholds to miss.
  useEffect(() => {
    let raf: number | null = null;
    const compute = () => {
      raf = null;
      if (lockRef.current) return;
      const probe = window.innerHeight * 0.42;
      let idx = 0;
      for (let i = 1; i < ITEMS.length; i++) {
        const el = document.getElementById(ITEMS[i].id);
        if (el && el.getBoundingClientRect().top <= probe) idx = i;
      }
      // Bottom of page: force the last section (short tails can never cross the probe).
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        idx = ITEMS.length - 1;
      }
      setActive(idx);
    };
    const schedule = () => {
      if (raf === null) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const onPopState = () => {
      const hash = window.location.hash.slice(1);
      const idx = ITEMS.findIndex((it) => it.id === hash);
      scrollToIndexRef.current(idx > 0 ? idx : 0);
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const handleEnter = (i: number) => {
    hoverRef.current = i;
    pullRef.current = 0;
    blobRefs.current[i]?.classList.add("is-hover");
    pillRefs.current[i]?.classList.add("is-hover");
    positionConnector();
  };

  const handleLeave = (i: number) => {
    hoverRef.current = -1;
    pullRef.current = 0;
    const dot = blobRefs.current[i];
    if (dot) {
      dot.classList.remove("is-hover");
      dot.style.setProperty("--pull", "0px");
    }
    const pill = pillRefs.current[i];
    if (pill) {
      pill.classList.remove("is-hover");
      pill.style.setProperty("--pull", "0px");
    }
    touchRefs.current[i]?.style.setProperty("--pull", "0px");
    positionConnector();
  };

  const handleMove = (i: number, e: React.PointerEvent<HTMLButtonElement>) => {
    if (rafRef.current !== null) return;
    const clientY = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    rafRef.current = requestAnimationFrame(() => {
      const center = rect.top + rect.height / 2;
      const raw = (clientY - center) * 0.55;
      pullRef.current = Math.max(-11, Math.min(11, raw));
      blobRefs.current[i]?.style.setProperty("--pull", `${pullRef.current}px`);
      pillRefs.current[i]?.style.setProperty("--pull", `${pullRef.current}px`);
      touchRefs.current[i]?.style.setProperty("--pull", `${pullRef.current}px`);
      positionConnector();
      rafRef.current = null;
    });
  };

  const handleClick = (i: number) => {
    const layer = blobLayerRef.current;
    const dot = blobRefs.current[i];
    if (layer && dot) {
      const splash = document.createElement("span");
      splash.className = "cap-dn-splash";
      splash.style.top = `${dot.offsetTop}px`;
      layer.appendChild(splash);
      window.setTimeout(() => splash.remove(), 800);
    }

    const id = ITEMS[i].id;
    const pathTarget = id === "home"
      ? window.location.pathname + window.location.search
      : `${window.location.pathname}${window.location.search}#${id}`;
    if (window.location.pathname + window.location.search + window.location.hash !== pathTarget) {
      window.history.pushState(null, "", pathTarget);
    }

    scrollToIndex(i);
  };

  return (
    <nav
      ref={railRef}
      aria-label="Section navigation"
      className="cap-dn-rail"
    >
      <span className="cap-dn-track" aria-hidden />
      <div className="cap-dn-blob-layer" ref={blobLayerRef}>
        <span className="cap-dn-connector" ref={connectorRef} />
        {ITEMS.map((it, i) => (
          <span
            key={it.id}
            ref={(el) => {
              blobRefs.current[i] = el;
            }}
            className={`cap-dn-blob-dot${i === active ? " is-active" : ""}`}
            style={{ top: `${(i / (ITEMS.length - 1)) * 100}%` }}
          />
        ))}
        {ITEMS.map((it, i) => (
          <span
            key={`pill-${it.id}`}
            ref={(el) => {
              pillRefs.current[i] = el;
            }}
            className="cap-dn-pill"
            style={{ top: `${(i / (ITEMS.length - 1)) * 100}%` }}
            aria-hidden
          >
            {it.label}
          </span>
        ))}
      </div>
      <div className="cap-dn-touch-layer">
        {ITEMS.map((it, i) => (
          <button
            key={it.id}
            type="button"
            ref={(el) => {
              touchRefs.current[i] = el;
            }}
            className="cap-dn-touch"
            style={{ top: `${(i / (ITEMS.length - 1)) * 100}%` }}
            aria-label={it.label}
            onMouseEnter={() => handleEnter(i)}
            onMouseLeave={() => handleLeave(i)}
            onPointerMove={(e) => handleMove(i, e)}
            onFocus={() => handleEnter(i)}
            onBlur={() => handleLeave(i)}
            onClick={() => handleClick(i)}
          >
            <span className="cap-dn-label">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
