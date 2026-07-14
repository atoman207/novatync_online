"use client";

import { useEffect, useRef, useState } from "react";

/*
 * SiteShot — resilient website-thumbnail loader.
 *
 * The thumbnails are live screenshots produced on demand by WordPress mShots
 * (s0.wp.com/mshots). For any URL it hasn't captured yet, mShots first returns
 * a grey "still generating" placeholder and renders the real screenshot in the
 * background. A single one-shot <img> therefore shows a blank card whenever the
 * screenshot isn't already warm.
 *
 * This component makes the load resilient:
 *   1. It re-requests mShots a few times over ~15s so the background capture can
 *      finish (including one official `requeue` to force a fresh render).
 *   2. Every request runs through an off-DOM Image(), and only a successfully
 *      loaded frame is ever shown — so the visible thumbnail never flickers or
 *      goes blank while newer frames are being fetched (double-buffering).
 *   3. On a hard failure it falls back to a second provider (thum.io), then to a
 *      branded favicon tile — a card is never left empty.
 *   4. Loading is deferred until the card nears the viewport, preserving the
 *      lazy-loading behaviour of the original markup.
 */

type SiteShotProps = {
  url: string;
  name: string;
  domain: string;
  accent: string;
  accent2: string;
  children?: React.ReactNode;
};

const mshots = (url: string, requeue = false) =>
  `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=800&h=500` +
  (requeue ? "&requeue=true" : "");

const thumio = (url: string) =>
  `https://image.thum.io/get/width/800/crop/500/noanimate/${url}`;

export default function SiteShot({
  url,
  name,
  domain,
  accent,
  accent2,
  children,
}: SiteShotProps) {
  const [shown, setShown] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let started = false;

    // Load one candidate off-DOM; resolve true only when it decodes.
    const load = (src: string) =>
      new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (cancelled) return resolve(false);
          setShown(src); // last successful frame wins
          setFailed(false); // a later success overrides an earlier fallback
          resolve(true);
        };
        img.onerror = () => resolve(false);
        img.src = src;
      });

    const run = () => {
      if (started) return;
      started = true;

      // Re-request mShots on a schedule so a not-yet-captured screenshot has
      // time to render. Same base URL is idempotent (no duplicate jobs); one
      // `requeue` forces a fresh capture for genuinely stale entries.
      const schedule: { src: string; delay: number }[] = [
        { src: mshots(url), delay: 0 },
        { src: mshots(url), delay: 4000 },
        { src: mshots(url, true), delay: 8000 },
        { src: mshots(url), delay: 13000 },
      ];

      let loadedAny = false;

      schedule.forEach(({ src, delay }) => {
        timers.push(
          setTimeout(async () => {
            if (cancelled) return;
            const ok = await load(src);
            if (ok) loadedAny = true;
            // If the very first request hard-fails, jump straight to fallback.
            else if (!loadedAny && delay === 0) {
              const fb = await load(thumio(url));
              if (!fb && !cancelled) setFailed(true);
            }
          }, delay)
        );
      });

      // Safety net: nothing ever loaded → try the fallback provider, then tile.
      timers.push(
        setTimeout(async () => {
          if (cancelled || loadedAny) return;
          const fb = await load(thumio(url));
          if (!fb && !cancelled) setFailed(true);
        }, 15000)
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(node);

    return () => {
      cancelled = true;
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [url]);

  return (
    <div className="shot-media" ref={wrapRef}>
      {shown && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shown} alt={`Screenshot of ${name}`} />
      ) : failed ? (
        <div
          className="shot-fallback"
          style={{
            background: `linear-gradient(135deg, ${accent}26, ${accent2}26)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
            alt=""
            width={38}
            height={38}
          />
          <span>{name}</span>
        </div>
      ) : (
        <div className="shot-skeleton" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
