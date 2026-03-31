import { useEffect, useRef, useCallback } from "react";

/*
 * Border-only glow via content-box / border-box mask + exclude/xor.
 * ::before = crisp colored ring + white metallic sheen (two stacked backgrounds).
 * ::after  = blurred outer halo.
 */
const GLOW_CSS = `
[data-glow] {
  --border-size: calc(var(--border, 2) * 1px);
  --spotlight-size: calc(var(--size, 200) * 1px);
  position: relative;
  isolation: isolate;
}

.card[data-glow] {
  border-color: transparent !important;
  overflow: visible !important;
  box-shadow: var(--shadow);
}
.card[data-glow]:hover {
  box-shadow: var(--shadow-up);
}

[data-glow]::before,
[data-glow]::after {
  content: "";
  position: absolute;
  inset: 0;
  padding: var(--border-size);
  border-radius: inherit;
  pointer-events: none;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 100%;

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;

  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;

  opacity: 0;
  transition: opacity 0.3s ease;
}

[data-glow][data-glow-active]::before,
[data-glow][data-glow-active]::after {
  opacity: 1;
}

[data-glow]::before {
  z-index: 2;
  background-image:
    radial-gradient(
      calc(var(--spotlight-size) * 0.45) calc(var(--spotlight-size) * 0.45)
      at calc(var(--x, -9999) * 1px) calc(var(--y, -9999) * 1px),
      hsl(0 0% 100% / 0.55) 0,
      hsl(0 0% 100% / 0.14) 22%,
      transparent 58%
    ),
    radial-gradient(
      var(--spotlight-size) var(--spotlight-size)
      at calc(var(--x, -9999) * 1px) calc(var(--y, -9999) * 1px),
      hsl(
        var(--hue)
        calc(var(--saturation, 95) * 1%)
        calc(var(--lightness, 72) * 1%)
        / 0.95
      ) 0,
      transparent 72%
    );
  filter: brightness(2);
}

[data-glow]::after {
  z-index: 1;
  background-image:
    radial-gradient(
      calc(var(--spotlight-size) * 0.9) calc(var(--spotlight-size) * 0.9)
      at calc(var(--x, -9999) * 1px) calc(var(--y, -9999) * 1px),
      hsl(
        var(--hue)
        calc(var(--saturation, 95) * 1%)
        calc(var(--lightness, 72) * 1%)
        / 0.70
      ) 0,
      transparent 78%
    );
  filter: blur(16px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

[data-glow][data-glow-active]::after {
  opacity: var(--outer, 1);
}
`;

let styleInjected = false;

function GlowCard({
  children,
  className = "",
  huePrev = null,
  hueSelf = 210,
  hueNext = null,
  customSize = false,
  style: externalStyle = {},
}) {
  const cardRef = useRef(null);
  const huesRef = useRef({ huePrev, hueSelf, hueNext });
  huesRef.current = { huePrev, hueSelf, hueNext };

  useEffect(() => {
    if (!styleInjected) {
      const el = document.createElement("style");
      el.setAttribute("data-glow-styles", "");
      el.textContent = GLOW_CSS;
      document.head.appendChild(el);
      styleInjected = true;
    }
  }, []);

  const updateGlow = useCallback((x, y, xp) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--x", x.toFixed(2));
    el.style.setProperty("--y", y.toFixed(2));

    const { huePrev, hueSelf, hueNext } = huesRef.current;

    // Shortest-arc hue lerp: ((b-a+540)%360)-180 gives signed shortest delta
    const lerpHue = (a, b, t) => {
      let d = ((b - a + 540) % 360) - 180;
      return ((a + d * t) % 360 + 360) % 360;
    };

    let hue;
    if (xp <= 0.25) {
      if (huePrev != null) {
        const t = xp / 0.25;
        hue = lerpHue(huePrev, hueSelf, t);
      } else {
        hue = hueSelf;
      }
    } else if (xp >= 0.75) {
      if (hueNext != null) {
        const t = (xp - 0.75) / 0.25;
        hue = lerpHue(hueSelf, hueNext, t);
      } else {
        hue = hueSelf;
      }
    } else {
      hue = hueSelf;
    }
    el.style.setProperty("--hue", hue.toFixed(1));
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const PROXIMITY = 150;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = e.clientX;
      const cy = e.clientY;
      const inRange =
        cx >= rect.left - PROXIMITY &&
        cx <= rect.right + PROXIMITY &&
        cy >= rect.top - PROXIMITY &&
        cy <= rect.bottom + PROXIMITY;

      if (inRange) {
        const x = cx - rect.left;
        const y = cy - rect.top;
        const xp = rect.width > 0 ? x / rect.width : 0;
        updateGlow(x, y, xp);
        el.setAttribute("data-glow-active", "");
      } else {
        el.removeAttribute("data-glow-active");
      }
    };

    const onLeave = () => el.removeAttribute("data-glow-active");

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [updateGlow]);

  const glowStyle = {
    "--hue": hueSelf,
    "--border": 2,
    "--size": 120,
    "--saturation": 95,
    "--lightness": 72,
    "--outer": 1,
    backgroundImage: `
      radial-gradient(
        calc(var(--spotlight-size, 120px) * 0.9) calc(var(--spotlight-size, 120px) * 0.9)
        at calc(var(--x, -9999) * 1px) calc(var(--y, -9999) * 1px),
        hsl(
          var(--hue, 210)
          calc(var(--saturation, 95) * 1%)
          calc(var(--lightness, 72) * 1%)
          / 0.10
        ) 0,
        transparent 70%
      )
    `,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0 0",
    backgroundSize: "100% 100%",
    touchAction: "none",
    ...externalStyle,
  };

  return (
    <div ref={cardRef} data-glow style={glowStyle} className={className}>
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>
    </div>
  );
}

export { GlowCard };
