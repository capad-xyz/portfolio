"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

type Item = { id: "home" | "work" | "experience" | "stack" | "testimonials" | "contact"; label: string };

const ITEMS: Item[] = [
  { id: "home", label: "home" },
  { id: "work", label: "work" },
  { id: "experience", label: "experience" },
  { id: "stack", label: "stack" },
  { id: "testimonials", label: "words" },
  { id: "contact", label: "contact" },
];

/**
 * Right-rail liquid-glass navigation. Six dots over a goo filter so the active
 * pill, a vertical connector, and the hovered dot fuse into one mercury blob.
 * Pointer Y inside a hit area magnetically pulls the hovered dot toward the
 * cursor; clicking ripples a splash through the rail. Scroll-spy uses
 * IntersectionObserver; navigation hands off to Lenis when present.
 */
export function DotNav() {
  const lenis = useLenis();
  const railRef = useRef<HTMLElement>(null);
  const blobLayerRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLSpanElement>(null);
  const blobRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const hoverRef = useRef(-1);
  const pullRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const didMountRef = useRef(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const idx = ITEMS.findIndex((it) => it.id === hash);
    if (idx <= 0) return;
    const el = document.getElementById(hash);
    if (!el) return;
    const timer = window.setTimeout(() => {
      setActive(idx);
      if (lenis) lenis.scrollTo(el, { immediate: false });
      else el.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [lenis]);

  useEffect(() => {
    const sections = ITEMS.slice(1)
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = ITEMS.findIndex((it) => it.id === visible.target.id);
        if (idx > 0) setActive(idx);
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: "-30% 0px -30% 0px" },
    );
    sections.forEach((s) => io.observe(s));

    const onScroll = () => {
      if (window.scrollY < 240) setActive(0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onPopState = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(hash);
      if (!el) return;
      if (lenis) lenis.scrollTo(el);
      else el.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
    };
  }, [lenis]);

  const handleEnter = (i: number) => {
    hoverRef.current = i;
    pullRef.current = 0;
    blobRefs.current[i]?.classList.add("is-hover");
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

    if (id === "home") {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      setActive(0);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ behavior: "smooth" });
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
      </div>
      <div className="cap-dn-touch-layer">
        {ITEMS.map((it, i) => (
          <button
            key={it.id}
            type="button"
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
            <span className="cap-dn-label glass">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
