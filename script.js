/* ==========================================================================
   NOSSO CANTINHO — script.js
   --------------------------------------------------------------------------
   Tudo que você provavelmente vai querer editar está sinalizado com
   um comentário "EDITE AQUI". O resto é só o funcionamento do site.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     0. FAVICON — se assets/images/lavnia.jpg não existir, usa um
     coraçãozinho como favicon alternativo automaticamente.
     ------------------------------------------------------------------ */
  (function setupFavicon(){
    const favicon = document.getElementById('favicon');
    const test = new Image();
    test.onerror = () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text y="78" font-size="80">❤️</text></svg>`;
      favicon.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
      favicon.type = 'image/svg+xml';
    };
    test.src = favicon.href;
  })();

  /* ------------------------------------------------------------------
     1. TELA DE ABERTURA
     ------------------------------------------------------------------ */
  const opening = document.getElementById('opening');
  const enterBtn = document.getElementById('enter-btn');
  const site = document.getElementById('site');

  enterBtn.addEventListener('click', () => {
    opening.classList.add('opening--leaving');
    site.hidden = false;
    document.body.style.overflow = '';
    // pequeno atraso para o fade da tela de abertura terminar
    setTimeout(() => {
      opening.style.display = 'none';
      initScrollReveals(); // só começa a observar quando o site já está visível
    }, 250);
  }, { once: true });

  // trava o scroll enquanto a tela de abertura está em cena
  document.body.style.overflow = 'hidden';

  /* ------------------------------------------------------------------
     2. CORAÇÕES FLUTUANDO NO FUNDO (canvas leve, discreto)
     ------------------------------------------------------------------ */
  (function hearts(){
    const canvas = document.getElementById('hearts-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function makeParticle(){
      return {
        x: Math.random() * w,
        y: h + Math.random() * h,
        size: 6 + Math.random() * 10,
        speed: .25 + Math.random() * .5,
        drift: (Math.random() - .5) * .4,
        opacity: .12 + Math.random() * .18
      };
    }
    function init(){
      resize();
      const count = w < 640 ? 10 : 18; // discreto, não exagerado
      particles = Array.from({ length: count }, makeParticle);
    }
    function drawHeart(x, y, size, opacity){
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size / 20, size / 20);
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(0, 2, -6, -6, -12, -2);
      ctx.bezierCurveTo(-18, 2, -12, 12, 0, 20);
      ctx.bezierCurveTo(12, 12, 18, 2, 12, -2);
      ctx.bezierCurveTo(6, -6, 0, 2, 0, 5);
      ctx.fillStyle = `rgba(198,160,99,${opacity})`;
      ctx.fill();
      ctx.restore();
    }
    function tick(){
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -20) Object.assign(p, makeParticle(), { y: h + 20 });
        drawHeart(p.x, p.y, p.size, p.opacity);
      });
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', resize);
    init();
    if (!prefersReduced) tick();
  })();

  /* ------------------------------------------------------------------
     3. MENU (fundo ao rolar + hambúrguer no celular)
     ------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    toggleBackToTop();
  });

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------------------
     4. ANIMAÇÕES AO ROLAR A PÁGINA (hero, timeline, mensagem especial)
     ------------------------------------------------------------------ */
  function initScrollReveals(){
    const targets = document.querySelectorAll(
      '.reveal-text, .timeline__item, .especial__line'
    );
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(t => observer.observe(t));

    // dentro da mensagem especial, revela linha por linha com um pequeno atraso
    document.querySelectorAll('.especial__line').forEach((line, i) => {
      line.style.transitionDelay = (i * 0.18) + 's';
    });
  }

  /* ------------------------------------------------------------------
     5. GALERIA — abrir modal, navegar entre fotos
     ------------------------------------------------------------------ */
  (function galeria(){
    const items = Array.from(document.querySelectorAll('.galeria__item'));
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const btnClose = document.getElementById('modal-close');
    const btnPrev = document.getElementById('modal-prev');
    const btnNext = document.getElementById('modal-next');
    let currentIndex = 0;

    function openAt(index){
      // pula fotos que ainda não foram substituídas (placeholder)
      const item = items[index];
      if (!item || item.classList.contains('galeria__item--empty')) return;
      currentIndex = index;
      const img = item.querySelector('img');
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modalCaption.textContent = item.dataset.caption || '';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    }
    function closeModal(){
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    function step(dir){
      let i = currentIndex;
      for (let n = 0; n < items.length; n++) {
        i = (i + dir + items.length) % items.length;
        if (!items[i].classList.contains('galeria__item--empty')) { openAt(i); return; }
      }
    }

    items.forEach((item, i) => item.addEventListener('click', () => openAt(i)));
    btnClose.addEventListener('click', closeModal);
    btnPrev.addEventListener('click', () => step(-1));
    btnNext.addEventListener('click', () => step(1));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  })();

  /* ------------------------------------------------------------------
     6. CONTADOR DE RELACIONAMENTO
     ------------------------------------------------------------------ */
  // EDITE AQUI: coloque a data em que vocês começaram a namorar
  // formato: ano, mês (1-12), dia, hora, minuto — ajuste como preferir
  const dataInicio = new Date(2024, 5, 15, 20, 0); // <-- troque para a data real

  const elAnos = document.getElementById('c-anos');
  const elMeses = document.getElementById('c-meses');
  const elDias = document.getElementById('c-dias');
  const elHoras = document.getElementById('c-horas');
  const elMin = document.getElementById('c-min');
  const elSeg = document.getElementById('c-seg');

  function pad(n){ return String(n).padStart(2, '0'); }

  function atualizarContador(){
    const agora = new Date();
    if (agora < dataInicio) return; // data ainda não chegou

    let anos = agora.getFullYear() - dataInicio.getFullYear();
    let meses = agora.getMonth() - dataInicio.getMonth();
    let dias = agora.getDate() - dataInicio.getDate();
    let horas = agora.getHours() - dataInicio.getHours();
    let min = agora.getMinutes() - dataInicio.getMinutes();
    let seg = agora.getSeconds() - dataInicio.getSeconds();

    if (seg < 0) { seg += 60; min--; }
    if (min < 0) { min += 60; horas--; }
    if (horas < 0) { horas += 24; dias--; }
    if (dias < 0) {
      const diaAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
      dias += diaAnterior;
      meses--;
    }
    if (meses < 0) { meses += 12; anos--; }

    elAnos.textContent = anos;
    elMeses.textContent = meses;
    elDias.textContent = dias;
    elHoras.textContent = pad(horas);
    elMin.textContent = pad(min);
    elSeg.textContent = pad(seg);
  }
  atualizarContador();
  setInterval(atualizarContador, 1000);

  /* ------------------------------------------------------------------
     7. CARTA / ENVELOPE
     ------------------------------------------------------------------ */
  const envelope = document.getElementById('envelope');
  function toggleEnvelope(){
    const isOpen = envelope.classList.toggle('is-open');
    envelope.setAttribute('aria-expanded', String(isOpen));
    envelope.setAttribute('aria-label', isOpen ? 'Fechar a carta' : 'Abrir a carta');
  }
  envelope.addEventListener('click', toggleEnvelope);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEnvelope(); }
  });

  /* ------------------------------------------------------------------
     8. EASTER EGG — coraçãozinho secreto
     ------------------------------------------------------------------ */
  const secretHeart = document.getElementById('secret-heart');
  const secretMessage = document.getElementById('secret-message');
  let clicks = 0;
  let clickTimer = null;

  secretHeart.addEventListener('click', () => {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clicks = 0; }, 1500);

    if (clicks >= 5) {
      clicks = 0;
      secretMessage.classList.add('is-visible');
      setTimeout(() => secretMessage.classList.remove('is-visible'), 3200);
    }
  });

  /* ------------------------------------------------------------------
     9. MÚSICA (opcional — não toca automaticamente)
     ------------------------------------------------------------------ */
  const musicBtn = document.getElementById('music-btn');
  const audio = document.getElementById('bg-audio');

  musicBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play()
        .then(() => musicBtn.classList.add('is-playing'))
        .catch(() => {
          // arquivo de áudio ainda não foi adicionado em /assets/audio/nossa-musica.mp3
          console.info('Coloque o arquivo de música em assets/audio/nossa-musica.mp3 para ativar o botão 🎵');
        });
    } else {
      audio.pause();
      musicBtn.classList.remove('is-playing');
    }
  });

  /* ------------------------------------------------------------------
     10. BOTÃO VOLTAR AO TOPO
     ------------------------------------------------------------------ */
  const toTopBtn = document.getElementById('to-top');
  function toggleBackToTop(){
    toTopBtn.classList.toggle('is-visible', window.scrollY > 700);
  }
  toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});