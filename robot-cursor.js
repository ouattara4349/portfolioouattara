/* ============================================================
   ROBOT CYBERSÉCURITÉ — suit le curseur sur toute la page
   Ajoute ce fichier dans ton dossier et inclus-le avant </body>
   ============================================================ */

(function () {

  /* ---- Injection du canvas ---- */
  const canvas = document.createElement('canvas');
  canvas.id = 'robot-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '9999',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  /* ---- Dimensions ---- */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- État ---- */
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let robot = { x: window.innerWidth  / 2, y: window.innerHeight / 2 };
  let blink     = 0;
  let scanAngle = 0;
  let frame     = 0;
  let lastMouse = { x: mouse.x, y: mouse.y };
  let moving    = false;
  let moveTimer = null;

  /* taille du robot */
  const S = 48;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    moving = true;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => moving = false, 300);
  });

  /* ---- Dessin du robot ---- */
  function drawRobot(x, y, angle, isMoving) {
    ctx.save();
    ctx.translate(x, y);

    const bob = Math.sin(frame * 0.05) * 2;  // légère oscillation verticale

    /* ---- Antenne ---- */
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -S * 0.85 + bob);
    ctx.lineTo(0, -S * 1.15 + bob);
    ctx.stroke();
    /* boule antenne (clignotante) */
    const antAlpha = 0.5 + 0.5 * Math.sin(frame * 0.12);
    ctx.beginPath();
    ctx.arc(0, -S * 1.18 + bob, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(249, 115, 22, ${antAlpha})`;
    ctx.fill();
    /* halo antenne */
    const grad = ctx.createRadialGradient(0, -S * 1.18 + bob, 2, 0, -S * 1.18 + bob, 10);
    grad.addColorStop(0, `rgba(249,115,22,${antAlpha * 0.4})`);
    grad.addColorStop(1, 'rgba(249,115,22,0)');
    ctx.beginPath();
    ctx.arc(0, -S * 1.18 + bob, 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    /* ---- Tête ---- */
    const headY = -S * 0.72 + bob;
    roundRect(ctx, -S * 0.5, headY, S, S * 0.55, 8);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* ---- Yeux (LEDs) ---- */
    const eyeY = headY + S * 0.18;
    const blinkH = (blink > 0) ? 1 : S * 0.1;

    /* oeil gauche */
    ctx.beginPath();
    ctx.ellipse(-S * 0.18, eyeY, S * 0.1, blinkH, 0, 0, Math.PI * 2);
    ctx.fillStyle = (blink > 0) ? '#6b7280' : '#22d3ee';
    ctx.fill();
    if (blink === 0) {
      const eg = ctx.createRadialGradient(-S*0.18, eyeY, 0, -S*0.18, eyeY, S*0.1);
      eg.addColorStop(0, 'rgba(34,211,238,0.8)');
      eg.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.beginPath();
      ctx.arc(-S * 0.18, eyeY, S * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = eg;
      ctx.fill();
    }

    /* oeil droit */
    ctx.beginPath();
    ctx.ellipse(S * 0.18, eyeY, S * 0.1, blinkH, 0, 0, Math.PI * 2);
    ctx.fillStyle = (blink > 0) ? '#6b7280' : '#22d3ee';
    ctx.fill();
    if (blink === 0) {
      const eg2 = ctx.createRadialGradient(S*0.18, eyeY, 0, S*0.18, eyeY, S*0.1);
      eg2.addColorStop(0, 'rgba(34,211,238,0.8)');
      eg2.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.beginPath();
      ctx.arc(S * 0.18, eyeY, S * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = eg2;
      ctx.fill();
    }

    /* ---- Bouche (grille scan) ---- */
    const mouthY = headY + S * 0.4;
    ctx.fillStyle = '#111827';
    roundRect(ctx, -S * 0.3, mouthY, S * 0.6, S * 0.1, 3);
    ctx.fill();
    /* barres scan animées */
    const scanX = -S * 0.28 + ((frame * 1.2) % (S * 0.56));
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(scanX, mouthY + 1);
    ctx.lineTo(scanX, mouthY + S * 0.1 - 1);
    ctx.stroke();

    /* ---- Corps ---- */
    const bodyY = -S * 0.15 + bob;
    roundRect(ctx, -S * 0.45, bodyY, S * 0.9, S * 0.7, 6);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* détail circuit corps */
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(-S * 0.2, bodyY + S * 0.15);
    ctx.lineTo(S * 0.2, bodyY + S * 0.15);
    ctx.moveTo(0, bodyY + S * 0.15);
    ctx.lineTo(0, bodyY + S * 0.45);
    ctx.moveTo(-S * 0.2, bodyY + S * 0.45);
    ctx.lineTo(S * 0.2, bodyY + S * 0.45);
    ctx.stroke();
    ctx.setLineDash([]);

    /* LED chest */
    const ledPulse = 0.6 + 0.4 * Math.sin(frame * 0.08);
    ctx.beginPath();
    ctx.arc(0, bodyY + S * 0.3, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(249,115,22,${ledPulse})`;
    ctx.fill();

    /* badge shield (icône cyber) */
    ctx.save();
    ctx.translate(-S * 0.22, bodyY + S * 0.22);
    ctx.scale(0.6, 0.6);
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, -6);
    ctx.lineTo(10, 4);
    ctx.quadraticCurveTo(0, 14, -10, 4);
    ctx.lineTo(-10, -6);
    ctx.closePath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    /* ---- Bras ---- */
    const armAngle = isMoving ? Math.sin(frame * 0.15) * 0.3 : 0;
    /* bras gauche */
    ctx.save();
    ctx.translate(-S * 0.45, bodyY + S * 0.1);
    ctx.rotate(-0.2 - armAngle);
    roundRect(ctx, -S * 0.12, 0, S * 0.12, S * 0.45, 4);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    /* main gauche */
    ctx.beginPath();
    ctx.arc(-S * 0.06, S * 0.45, S * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    /* bras droit */
    ctx.save();
    ctx.translate(S * 0.45, bodyY + S * 0.1);
    ctx.rotate(0.2 + armAngle);
    roundRect(ctx, 0, 0, S * 0.12, S * 0.45, 4);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    /* main droite */
    ctx.beginPath();
    ctx.arc(S * 0.06, S * 0.45, S * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    /* ---- Jambes ---- */
    const legSwing = isMoving ? Math.sin(frame * 0.2) * 0.2 : 0;
    const legY = bodyY + S * 0.7;
    /* jambe gauche */
    ctx.save();
    ctx.translate(-S * 0.2, legY);
    ctx.rotate(-legSwing);
    roundRect(ctx, -S * 0.11, 0, S * 0.22, S * 0.4, 4);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    /* pied gauche */
    roundRect(ctx, -S * 0.15, S * 0.38, S * 0.3, S * 0.1, 3);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    /* jambe droite */
    ctx.save();
    ctx.translate(S * 0.2, legY);
    ctx.rotate(legSwing);
    roundRect(ctx, -S * 0.11, 0, S * 0.22, S * 0.4, 4);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    /* pied droit */
    roundRect(ctx, -S * 0.15, S * 0.38, S * 0.3, S * 0.1, 3);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    /* ---- Rayon scan (vers le curseur) ---- */
    const dx = mouse.x - x;
    const dy = mouse.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 60) {
      const nx = dx / dist;
      const ny = dy / dist;
      const scanAlpha = 0.06 + 0.04 * Math.sin(frame * 0.1);
      ctx.save();
      ctx.globalAlpha = scanAlpha;
      const coneGrad = ctx.createLinearGradient(0, 0, nx * dist, ny * dist);
      coneGrad.addColorStop(0, '#22d3ee');
      coneGrad.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, headY + S * 0.2 + bob);
      ctx.lineTo(dx * 0.9, dy * 0.9);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.restore();
  }

  /* ---- Utilitaire roundRect ---- */
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  /* ---- Boucle d'animation ---- */
  function loop() {
    frame++;

    /* lerp du robot vers la souris (avec décalage) */
    const targetX = mouse.x + 28;
    const targetY = mouse.y - 20;
    const speed   = 0.08;
    robot.x += (targetX - robot.x) * speed;
    robot.y += (targetY - robot.y) * speed;

    /* clignement aléatoire */
    if (Math.random() < 0.008) blink = 6;
    if (blink > 0) blink--;

    /* scan */
    scanAngle += 0.02;

    /* effacement */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* dessin */
    drawRobot(robot.x, robot.y, 0, moving);

    requestAnimationFrame(loop);
  }

  loop();

})();
