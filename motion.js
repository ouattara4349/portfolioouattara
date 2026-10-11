/* ==========================================================
   motion.js — animations motion design du portfolio
   Chaque bloc est isolé : si l'un échoue, les autres continuent.
   ========================================================== */
(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const safe = (name, fn) => { try { fn(); } catch (e) { console.warn("[motion] " + name, e); } };
  const hasIO = "IntersectionObserver" in window;

  // Observe des éléments et appelle cb une seule fois quand ils entrent à l'écran
  const once = (els, cb, opts) => {
    if (!hasIO) { els.forEach(cb); return; }
    // Deux frames d'attente avant de brancher l'observateur : la toute première
    // notification d'un IntersectionObserver peut se baser sur une mise en page
    // pas encore stabilisée (polices/CSS en cours de chargement) et déclencher
    // l'animation à tort dès le chargement. On laisse le temps à la mise en page
    // de se stabiliser avant de commencer à observer.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } });
      }, opts || { threshold: 0.15 });
      els.forEach((el) => io.observe(el));
    }));
  };

  /* ---------- 1. Loader ---------- */
  const loader = $("#page-loader");
  let hidden = false;
  const hideLoader = () => {
    if (hidden) return;
    hidden = true;
    if (loader) {
      loader.classList.add("hide");
      setTimeout(() => loader.remove(), 800);
    }
    document.body.classList.add("is-ready");
    safe("after-ready", afterReady);
  };
  const t0 = performance.now();
  const MIN = loader ? 1400 : 50;   // durée minimale d'affichage
  const MAX = 2600;                 // on n'attend pas les grosses images au-delà
  const done = () => setTimeout(hideLoader, Math.max(0, MIN - (performance.now() - t0)));
  if (document.readyState === "complete") done(); else addEventListener("load", done, { once: true });
  setTimeout(hideLoader, MAX);

  /* ---------- 2. Barre de progression + header + lien actif + timeline ---------- */
  safe("progress", () => {
    const bar = document.createElement("div");
    bar.id = "m-progress";
    document.body.appendChild(bar);
    const header = $("header.fixed");
    const timeline = $(".timeline");
    if (timeline) timeline.classList.add("m-tl");
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, scrollY / max) : 0) + ")";
      if (header) header.classList.toggle("m-scrolled", scrollY > 20);
      if (timeline) {
        const r = timeline.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height));
        timeline.style.setProperty("--tl", p.toFixed(3));
      }
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();

    // Lien du menu actif selon la section visible
    if (hasIO) {
      const links = $$("header nav a[href^='#']");
      const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove("m-active"));
            const a = map.get(e.target.id);
            if (a) a.classList.add("m-active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  });

  /* ---------- 3. Préparation du hero (éléments cachés jusqu'à la fin du loader) ---------- */
  const staggered = [];
  safe("hero-prep", () => {
    if (reduce) return;
    const kids = $$(".hero-text > *");
    kids.forEach((el, i) => {
      if (el.classList.contains("flex")) {
        // la rangée de badges de certifications : pop un par un
        el.querySelectorAll(".cert-badge").forEach((b, j) => {
          b.classList.add("m-pop");
          b.style.setProperty("--d", 700 + j * 70 + "ms");
          staggered.push(b);
        });
        return;
      }
      el.classList.add("m-stagger");
      el.style.setProperty("--d", 80 + i * 110 + "ms");
      staggered.push(el);
    });
  });

  // Ligne "terminal" qui s'écrit
  let startTyping = () => {};
  safe("typed", () => {
    const anchor = $(".hero-text p.text-orange-500");
    if (!anchor) return;
    const words = ["SOC & SIEM (Wazuh)", "Pentest & hacking éthique", "Audit & GRC", "Réseaux & infrastructure", "Formation en cybersécurité"];
    const p = document.createElement("p");
    p.className = "m-typed";
    p.innerHTML = '<span class="m-prompt">$</span><span class="m-word"></span><span class="m-caret"></span>';
    anchor.after(p);
    const out = p.querySelector(".m-word");
    if (reduce) { out.textContent = words.join(" · "); return; }
    p.classList.add("m-stagger");
    p.style.setProperty("--d", "420ms");
    staggered.push(p);
    let w = 0, c = 0, del = false;
    const tick = () => {
      const word = words[w];
      c += del ? -1 : 1;
      out.textContent = word.slice(0, c);
      let wait = del ? 28 : 65;
      if (!del && c === word.length) { del = true; wait = 1600; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
      setTimeout(tick, wait);
    };
    startTyping = () => setTimeout(tick, 900);
  });

  // Anneaux tournants + léger parallaxe sur la photo
  safe("ring", () => {
    const photo = $(".hero-image > div");
    if (!photo) return;
    const wrap = document.createElement("div");
    wrap.className = "m-ring-wrap";
    if (photo.classList.contains("floating")) { photo.classList.remove("floating"); wrap.classList.add("floating"); }
    photo.parentNode.insertBefore(wrap, photo);
    wrap.append(photo);
    const r1 = document.createElement("div"); r1.className = "m-ring";
    const r2 = document.createElement("div"); r2.className = "m-ring m-ring-2";
    wrap.append(r1, r2);
    if (!fine || reduce) return;
    const hero = $("#home");
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      wrap.style.translate = cx.toFixed(2) + "px " + cy.toFixed(2) + "px";
      raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -26;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -26;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  });

  // Réseau de points reliés (thème cybersécurité) derrière le hero
  safe("network", () => {
    if (reduce) return;
    const hero = $("#home");
    if (!hero) return;
    hero.classList.add("m-hero");
    const cv = document.createElement("canvas");
    cv.id = "m-net";
    hero.prepend(cv);
    const ctx = cv.getContext("2d");
    let w = 0, h = 0, nodes = [], running = false;
    const mouse = { x: -9999, y: -9999 };
    const resize = () => {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, Math.max(22, (w * h) / 22000)));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 1.5 + 0.7,
      }));
    };
    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const a of nodes) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        const dxm = mouse.x - a.x, dym = mouse.y - a.y, dm = Math.hypot(dxm, dym);
        if (dm < 160) { a.x += dxm * 0.004; a.y += dym * 0.004; }
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, 6.2832);
        ctx.fillStyle = "rgba(249,115,22,.75)";
        ctx.fill();
        if (dm < 170) {
          ctx.strokeStyle = "rgba(249,115,22," + (0.55 * (1 - dm / 170)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < 130) {
            ctx.strokeStyle = "rgba(249,115,22," + (0.28 * (1 - d / 130)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    };
    const setRunning = (v) => { if (v && !running) { running = true; requestAnimationFrame(frame); } else if (!v) running = false; };
    resize();
    addEventListener("resize", resize);
    hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    if (hasIO) new IntersectionObserver((es) => setRunning(es[0].isIntersecting), { threshold: 0 }).observe(hero);
    else setRunning(true);
    document.addEventListener("visibilitychange", () => setRunning(!document.hidden));
  });

  function afterReady() {
    startTyping();
    // On retire les classes d'entrée une fois jouées (évite les délais parasites au survol)
    setTimeout(() => staggered.forEach((el) => { el.classList.remove("m-stagger", "m-pop"); el.style.removeProperty("--d"); }), 3200);
  }

  /* ---------- 4. Titres : effet "décodage" + trait animé ---------- */
  safe("titles", () => {
    const titles = $$("h2.section-title, #Certificats h2");
    titles.forEach((h) => { if (!h.querySelector(".border-b-4")) h.classList.add("m-line"); });
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@<>/";
    const scramble = (el) => {
      const finalText = el.textContent;
      el.setAttribute("aria-label", finalText);
      const width = el.getBoundingClientRect().width;
      el.style.display = "inline-block";
      el.style.minWidth = width + "px";
      const len = finalText.length, dur = 900, start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const reveal = Math.floor(p * len);
        let s = "";
        for (let i = 0; i < len; i++) {
          const ch = finalText[i];
          s += i < reveal || ch === " " ? ch : chars[(Math.random() * chars.length) | 0];
        }
        el.textContent = s;
        if (p < 1) requestAnimationFrame(tick);
        else { el.textContent = finalText; el.style.minWidth = ""; el.style.display = ""; }
      };
      requestAnimationFrame(tick);
    };
    once(titles, (h) => {
      h.classList.add("m-in");
      if (!reduce) scramble(h.querySelector("span") || h);
    }, { threshold: 0.6 });
  });

  /* ---------- 5. Apparition au scroll des éléments non gérés par ScrollReveal ---------- */
  safe("reveal", () => {
    if (reduce) return;
    const targets = $$([
      "#Certificats h2 + p", ".about-text .flex-wrap > span",
      "footer .footer-section", ".programming-skills", ".contact-info .flex",
    ].join(","));
    const seen = new Map();
    targets.forEach((el) => {
      const parent = el.parentElement;
      const i = seen.get(parent) || 0;
      seen.set(parent, i + 1);
      el.classList.add("m-reveal");
      el.style.setProperty("--d", (i % 4) * 90 + "ms");
    });
    once(targets, (el) => {
      el.classList.add("m-in");
      const d = parseInt(el.style.getPropertyValue("--d")) || 0;
      setTimeout(() => { el.classList.remove("m-reveal", "m-in"); el.style.removeProperty("--d"); }, 1500 + d);
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    // Certificats : l'animation CSS existante se jouait au chargement, hors écran → on la lance au scroll
    const certs = $$(".fade-in-up");
    certs.forEach((el) => el.classList.add("m-wait"));
    once(certs, (el) => el.classList.remove("m-wait"), { threshold: 0.15 });
  });

  /* ---------- 6. Barres de compétences : se remplissent quand on les voit ---------- */
  safe("bars", () => {
    const bars = $$(".skill-bar-transition");
    if (!hasIO) return;
    bars.forEach((b, i) => {
      b.style.setProperty("--w", b.style.width || "0%");
      b.classList.add("m-bar");
      b.style.setProperty("--d", (i % 6) * 90 + "ms");
    });
    once(bars, (b) => b.classList.add("m-in"), { threshold: 0.5 });
  });

  /* ---------- 7. Effets souris (ordinateur uniquement) ---------- */
  safe("pointer-fx", () => {
    if (!fine || reduce) return;

    // Halo qui suit le curseur
    const glow = document.createElement("div");
    glow.id = "m-cursor";
    document.body.appendChild(glow);
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, graf = 0;
    const gloop = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = "translate(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px)";
      graf = Math.hypot(tx - gx, ty - gy) > 0.5 ? requestAnimationFrame(gloop) : 0;
    };
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY; glow.classList.add("m-on");
      if (!graf) graf = requestAnimationFrame(gloop);
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => glow.classList.remove("m-on"));

    // Spot lumineux sur les cartes
    const CARD = ".stat-card, .skill-card, .project-card, .other-skill-card, .company-card-enhanced, .timeline-item > div";
    $$(CARD).forEach((card) => {
      if (getComputedStyle(card).position === "static") card.style.position = "relative";
      card.classList.add("m-has-spot");
      const s = document.createElement("span");
      s.className = "m-spot";
      card.appendChild(s);
    });
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".m-has-spot");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    }, { passive: true });

    // Boutons "magnétiques"
    $$("a.inline-block.bg-gradient-to-r, #submit-btn, .footer-social-icon").forEach((el) => {
      el.style.transition = "translate .3s cubic-bezier(.2,.8,.2,1), transform .3s ease, box-shadow .3s ease";
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = dx * 0.22 + "px " + dy * 0.32 + "px";
      });
      el.addEventListener("pointerleave", () => { el.style.translate = "0 0"; });
    });
  });

  /* ---------- 8. Galerie d'affiches : rideau, tilt 3D, parallaxe ---------- */
  safe("gallery", () => {
    const cards = $$("#design-gallery .design-card");
    if (!cards.length) return;
    const cols = () => (innerWidth >= 1024 ? 3 : innerWidth >= 768 ? 2 : 1);

    if (!reduce && hasIO) {
      cards.forEach((c, i) => {
        c.classList.add("g-hide");
        c.style.setProperty("--clip", i % 2 ? "inset(0 0 0 100% round 1rem)" : "inset(0 100% 0 0 round 1rem)");
        c.style.setProperty("--d", (i % cols()) * 130 + "ms");
      });
      once(cards, (c) => {
        c.classList.add("g-in");
        const d = parseInt(c.style.getPropertyValue("--d")) || 0;
        setTimeout(() => {
          c.classList.remove("g-hide", "g-in");
          c.style.removeProperty("--clip");
          c.style.removeProperty("--d");
        }, 2000 + d);
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    }

    if (fine && !reduce) {
      cards.forEach((c) => {
        c.addEventListener("pointermove", (e) => {
          const r = c.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          c.style.setProperty("--ry", ((px - 0.5) * 14).toFixed(2) + "deg");
          c.style.setProperty("--rx", ((0.5 - py) * 14).toFixed(2) + "deg");
          c.style.setProperty("--ix", ((0.5 - px) * 18).toFixed(1) + "px");
          c.style.setProperty("--iy", ((0.5 - py) * 18).toFixed(1) + "px");
        });
        c.addEventListener("pointerleave", () => {
          ["--rx", "--ry", "--ix", "--iy"].forEach((v) => c.style.removeProperty(v));
        });
      });
    }
  });

  /* ---------- 9. Entreprises collaboratives : dépliage au scroll ---------- */
  safe("companies-fold", () => {
    if (reduce) return;
    const cards = $$("#companies .company-card-enhanced");
    if (!cards.length) return;
    cards.forEach((c, i) => {
      c.classList.add("c-fold");
      c.style.setProperty("--d", i * 120 + "ms");
    });
    const start = () => once(cards, (c) => {
      c.classList.add("c-in");
      const d = parseInt(c.style.getPropertyValue("--d")) || 0;
      setTimeout(() => {
        c.classList.remove("c-fold", "c-in");
        c.style.removeProperty("--d");
      }, 1400 + d);
    }, { threshold: 0.25, rootMargin: "0px 0px -30px 0px" });
    // On attend que tout soit chargé (images comprises) pour éviter qu'un décalage
    // de mise en page pendant le chargement ne déclenche l'animation trop tôt.
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
  });

  /* ---------- 10. Curseur personnalisé : petite goutte d'eau ---------- */
  safe("cursor-dot", () => {
    if (!fine || reduce) return;
    const dot = document.createElement("div");
    dot.id = "m-dot";
    document.body.appendChild(dot);
    document.body.classList.add("m-cursor-ready");

    let shown = false;
    addEventListener("pointermove", (e) => {
      dot.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px) rotate(-45deg)";
      if (!shown) { dot.classList.add("m-on"); shown = true; }
      const link = e.target.closest && e.target.closest("a, button, input, textarea, [role='button']");
      dot.classList.toggle("m-link", !!link);
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => { dot.classList.remove("m-on"); shown = false; });
    addEventListener("pointerdown", () => dot.classList.add("m-down"), { passive: true });
    addEventListener("pointerup", () => dot.classList.remove("m-down"), { passive: true });
  });
})();