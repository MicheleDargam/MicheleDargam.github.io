(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- tema claro/escuro ---------- */
  $('.theme-toggle').addEventListener('click', function () {
    var root = document.documentElement;
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- menu mobile ---------- */
  var menuBtn = $('.menu-toggle'), nav = $('#navlinks');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#navlinks a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
  });

  /* ---------- header, barra de progresso, link ativo ---------- */
  var header = $('header.site'), progress = $('.scroll-progress');
  var sections = $$('main section[id]');
  var links = $$('.navlinks a');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 10);
    progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    var current = '';
    sections.forEach(function (s) { if (s.offsetTop - 120 <= y) current = s.id; });
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- relógio ---------- */
  var clock = $('#clock');
  function tick() { clock.textContent = new Date().toLocaleTimeString('pt-BR'); }
  tick(); setInterval(tick, 1000);

  /* ---------- terminal digitando ---------- */
  var termLines = [
    ['c', '// background script: apresentação'],
    ['', ''],
    ['k', 'var '], ['', 'dev = '], ['k', 'new '], ['f', 'GlideRecord'], ['', '('], ['s', "'x_portfolio_dev'"], ['', ');\n'],
    ['', 'dev.'], ['f', 'get'], ['', '('], ['s', "'michele'"], ['', ');\n\n'],
    ['', 'gs.'], ['f', 'info'], ['', '(dev.'], ['o', 'getValue'], ['', '('], ['s', "'foco'"], ['', '));\n'],
    ['c', '// *** Script: modelagem de dados + automação\n'],
    ['', 'gs.'], ['f', 'info'], ['', '(dev.'], ['o', 'getValue'], ['', '('], ['s', "'stack'"], ['', '));\n'],
    ['c', '// *** Script: BR · Client Script · Flow · ATF\n'],
    ['', 'gs.'], ['f', 'info'], ['', '(dev.'], ['o', 'getValue'], ['', '('], ['s', "'status'"], ['', '));\n'],
    ['c', '// *** Script: aberta a oportunidades ✓']
  ];
  termLines[0][1] += '\n';
  var code = $('#term-code');
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function renderUpTo(seg, ch) {
    var html = '';
    for (var i = 0; i <= seg && i < termLines.length; i++) {
      var cls = termLines[i][0], txt = termLines[i][1];
      if (i === seg) txt = txt.slice(0, ch);
      html += cls ? '<span class="' + cls + '">' + esc(txt) + '</span>' : esc(txt);
    }
    code.innerHTML = html;
  }
  if (reduceMotion) {
    renderUpTo(termLines.length - 1, Infinity);
  } else {
    var seg = 0, ch = 0;
    setTimeout(function type() {
      if (seg >= termLines.length) return;
      ch++;
      renderUpTo(seg, ch);
      var txt = termLines[seg][1];
      var delay = 22 + Math.random() * 30;
      if (ch >= txt.length) { seg++; ch = 0; if (txt.indexOf('\n') > -1) delay = 260; }
      setTimeout(type, delay);
    }, 1000);
  }

  /* ---------- reveal ao rolar + contadores ---------- */
  function fmt(n, dec) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }
  function countUp(el) {
    var target = +el.getAttribute('data-count'), dec = +(el.getAttribute('data-dec') || 0);
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var start = null, dur = 1400;
    if (reduceMotion) { el.textContent = pre + fmt(target, dec) + suf; return; }
    requestAnimationFrame(function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = pre + fmt(target * (1 - Math.pow(1 - p, 3)), dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      if ($('.dash', e.target)) animateCharts();
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- abas STAR ---------- */
  var tabs = $$('.star-tabs button'), ink = $('.tab-ink');
  function moveInk(btn) { ink.style.left = btn.offsetLeft + 'px'; ink.style.width = btn.offsetWidth + 'px'; }
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.setAttribute('aria-selected', b === btn); });
      $$('.star-panel').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === btn.getAttribute('data-tab')); });
      moveInk(btn);
    });
  });
  moveInk(tabs[0]);
  window.addEventListener('resize', function () { moveInk($('.star-tabs [aria-selected="true"]')); });

  /* ---------- simulador de incidente ---------- */
  // Mapa igual ao da Business Rule "Atribuicao Automatica por Regiao"
  var mapaRegiao = {
    sudeste: 'Logistica - Sudeste', sul: 'Logistica - Sul', norte: 'Logistica - Norte',
    nordeste: 'Logistica - Nordeste', centro_oeste: 'Logistica - Centro-Oeste'
  };
  // Confirmados pelo ATF: Avaria → Alta, Outro → Baixa. Demais: CONFIRMAR com a regra real.
  var prioridade = { avaria: '1 - Alta', atraso: '2 - Média', estoque: '2 - Média', veiculo: '2 - Média', rota: '2 - Média', outro: '3 - Baixa' };
  var catSel = $('#sim-cat'), cdSel = $('#sim-cd'), veicWrap = $('.sim-veiculo'), veicIn = $('#sim-veic');
  var log = $('#sim-log'), incCounter = 1000;

  // Client Script / UI Policy: mostra e exige Veículo quando a categoria é Falha de Veículo
  catSel.addEventListener('change', function () {
    veicWrap.hidden = catSel.value !== 'veiculo';
    veicIn.classList.remove('invalid');
  });

  var running = false;
  $('#sim-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (running) return;
    if (catSel.value === 'veiculo' && !veicIn.value.trim()) {
      veicIn.classList.remove('invalid'); void veicIn.offsetWidth; veicIn.classList.add('invalid');
      log.innerHTML = '<span class="warn">[UI Policy] Campo "Veículo" é obrigatório quando a categoria é Falha de Veículo.</span>';
      veicIn.focus();
      return;
    }
    running = true;
    incCounter++;
    var num = 'INC00' + incCounter;
    var regiao = cdSel.value, grupo = mapaRegiao[regiao], prio = prioridade[catSel.value];
    var cdNome = cdSel.options[cdSel.selectedIndex].text, catNome = catSel.options[catSel.selectedIndex].text;
    var steps = [
      ['inf', '[insert] x_incidente_logistico · ' + num],
      ['', '  centro_de_distribuicao = ' + cdNome + ' · categoria = ' + catNome],
      ['inf', '[BR] Triagem Automatica de Incidente (before)'],
      ['ok', '  prioridade ← ' + prio],
      ['inf', '[BR] Atribuicao Automatica por Regiao (before)'],
      ['', "  regiao = '" + regiao + "'"],
      ['ok', '  assignment_group ← ' + grupo],
      ['inf', '[Flow] Notificar time responsável'],
      ['ok', '  ✓ notificação enviada para ' + grupo]
    ];
    ['r-num', 'r-group', 'r-prio'].forEach(function (id) { $('#' + id).textContent = '…'; $('#' + id).parentNode.classList.remove('flash'); });
    log.innerHTML = '';
    var i = 0;
    (function next() {
      if (i >= steps.length) {
        fill('r-num', num); fill('r-group', grupo); fill('r-prio', prio);
        running = false; return;
      }
      var s = steps[i++];
      log.innerHTML += (s[0] ? '<span class="' + s[0] + '">' + esc(s[1]) + '</span>' : esc(s[1])) + '\n';
      log.scrollTop = log.scrollHeight;
      setTimeout(next, reduceMotion ? 0 : 280);
    })();
  });
  function fill(id, val) {
    var el = $('#' + id); el.textContent = val;
    var box = el.parentNode; box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash');
  }

  /* ---------- suíte ATF ---------- */
  var atfBtn = $('#atf-run'), atfItems = $$('#atf-list li'), atfFill = $('#atf-fill'), atfCount = $('#atf-count');
  atfBtn.addEventListener('click', function () {
    atfBtn.disabled = true;
    atfItems.forEach(function (li) { li.className = ''; $('.atf-st', li).textContent = 'pendente'; });
    atfFill.style.width = '0'; atfCount.textContent = '0/' + atfItems.length;
    var i = 0;
    (function run() {
      if (i >= atfItems.length) { atfBtn.disabled = false; atfBtn.textContent = '↻ Executar novamente'; return; }
      var li = atfItems[i];
      li.className = 'running'; $('.atf-st', li).textContent = 'executando…';
      setTimeout(function () {
        li.className = 'pass'; $('.atf-st', li).textContent = 'Success · ' + li.getAttribute('data-dur');
        i++;
        atfFill.style.width = (i / atfItems.length * 100) + '%';
        atfCount.textContent = i + '/' + atfItems.length;
        run();
      }, reduceMotion ? 0 : 700 + Math.random() * 500);
    })();
  });

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('.lb-cap', lb);
  $$('.shot').forEach(function (fig) {
    fig.setAttribute('tabindex', '0');
    function open() {
      var img = $('img', fig);
      lbImg.src = fig.getAttribute('data-full'); lbImg.alt = img.alt;
      lbCap.textContent = $('figcaption', fig).textContent;
      lb.hidden = false; document.body.style.overflow = 'hidden';
      $('.lb-close', lb).focus();
    }
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* =========================================================
     CASE POWER BI
     ========================================================= */

  /* ---------- console da API: 401 → 200 ---------- */
  var apiBtn = $('#api-send'), apiStatus = $('#api-status'), apiBody = $('#api-body');
  function jsonHL(obj) {
    return esc(JSON.stringify(obj, null, 2))
      .replace(/"([^"]+)":/g, '<span class="jk">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="js">"$1"</span>')
      .replace(/: (\d+|true|false)/g, ': <span class="jn">$1</span>');
  }
  apiBtn.addEventListener('click', function () {
    var user = $('#fix-user').checked, reset = $('#fix-reset').checked, role = $('#fix-role').checked;
    apiBtn.disabled = true;
    apiStatus.innerHTML = '<span class="muted">enviando…</span>';
    apiBody.innerHTML = '';
    setTimeout(function () {
      apiBtn.disabled = false;
      if (user && reset && role) {
        apiStatus.innerHTML = '<span class="code c200">200 OK</span><span class="muted">718 ms · 53 registros</span>';
        apiBody.innerHTML = jsonHL({ result: [{
          number: 'TASK0010042', categoria: 'Atraso na Entrega', centro_de_distribuicao: 'CD Belo Horizonte',
          transportadora: 'TransRio Logística', state: 'Em Triagem', priority: '2 - Média',
          opened_at: '2026-08-14 09:32:10', closed_at: '', made_sla: 'true'
        }, '… mais 52 registros'] }) + '\n\n<span class="muted">// registro ilustrativo · campos reais da tabela</span>';
      } else {
        var falta = [];
        if (!user) falta.push('usar um usuário dedicado de integração');
        if (!reset) falta.push('desmarcar "Password needs reset"');
        if (!role) falta.push('conceder a role snc_basic_auth_api_access');
        apiStatus.innerHTML = '<span class="code c401">401 Unauthorized</span>';
        apiBody.innerHTML = jsonHL({ error: { message: 'User is not authenticated', detail: 'Required to provide Auth information' }, status: 'failure' }) +
          '\n\n<span class="api-hint">→ ainda falta: ' + esc(falta.join('; ')) + '.</span>';
      }
    }, reduceMotion ? 0 : 700);
  });

  /* ---------- gráficos do dashboard ---------- */
  var tip = $('#chart-tip');
  function showTip(e, title, val) {
    tip.innerHTML = esc(title) + '<b>' + esc(val) + '</b>';
    tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px';
    tip.classList.add('show');
  }
  function hideTip() { tip.classList.remove('show'); }
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }

  // barras horizontais (HTML): data = [[rótulo, valor], ...]
  function hbars(id, data, opts) {
    var box = $('#' + id), max = Math.max.apply(null, data.map(function (d) { return d[1]; }));
    var wrap = document.createElement('div'); wrap.className = 'hbars';
    data.forEach(function (d) {
      var row = document.createElement('div'), cls = opts.cls ? opts.cls(d, max) : '';
      row.className = 'hbar ' + cls;
      row.innerHTML = '<span class="hbar-lbl" title="' + esc(d[0]) + '">' + esc(d[0]) + '</span>' +
        '<span class="hbar-track"><span class="hbar-fill" data-w="' + (d[1] / max * (opts.scale || 82)) + '"></span>' +
        '<span class="hbar-val">' + esc(opts.fmt(d[1])) + (cls === 'crit' ? ' <span class="flag">▲</span>' : '') + '</span></span>';
      row.addEventListener('pointermove', function (e) { showTip(e, d[0], opts.fmt(d[1]) + (opts.tipExtra ? opts.tipExtra(d) : '')); });
      row.addEventListener('pointerleave', hideTip);
      wrap.appendChild(row);
    });
    box.appendChild(wrap);
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', data.map(function (d) { return d[0] + ': ' + opts.fmt(d[1]); }).join('; '));
    if (opts.note) { var n = document.createElement('p'); n.className = 'ref-note'; n.innerHTML = opts.note; box.appendChild(n); }
  }

  hbars('ch-status', [['Em Triagem', 16], ['Em Andamento', 10], ['Aguard. Terceiros', 9], ['Fechado', 9], ['Resolvido', 6], ['Novo', 2], ['Reaberto', 1]], {
    fmt: function (v) { return v + ''; }, cls: function (d, m) { return d[1] === m ? 'hi' : ''; },
    tipExtra: function (d) { return ' chamados'; }, note: 'em destaque: maior concentração'
  });
  hbars('ch-cat', [['Atraso na Entrega', 20], ['Avaria de Carga', 11], ['Divergência Estoque', 11], ['Falha Veículo', 7], ['Rota', 4]], {
    fmt: function (v) { return v + ''; }, tipExtra: function (d) { return ' · ' + fmt(d[1] / 53 * 100, 0) + '% do total'; }
  });
  hbars('ch-tma', [['CD Belo Horizonte', 42.3], ['CD Salvador', 40.5], ['CD Goiânia', 37.0], ['CD Manaus', 37.0], ['CD Curitiba', 30.0]], {
    fmt: function (v) { return fmt(v, 1) + ' h'; }, cls: function (d) { return d[1] > 40 ? 'crit' : ''; },
    note: '<span style="color:var(--c-crit)">▲</span> acima do alerta de 40 h (SLA de 48 h)'
  });
  hbars('ch-imp', [['TransRio Logística', 87], ['Rota Certa', 19], ['Expresso Serra Azul', 18], ['Cargo Norte Flum.', 14], ['RotaSul', 8]], {
    fmt: function (v) { return 'R$ ' + v + ' mil'; }, scale: 88,
    note: 'total geral: R$ 164.755 · valores por transportadora aproximados'
  });

  // linha: volumetria por mês
  (function () {
    var data = [['Jul', 5], ['Ago', 29], ['Set', 19]], W = 600, H = 210, L = 34, R = 20, T = 22, B = 28, max = 30;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Volumetria por mês: julho 5, agosto 29, setembro 19 chamados' }, $('#ch-vol'));
    function x(i) { return L + i * (W - L - R) / (data.length - 1); }
    function y(v) { return T + (H - T - B) * (1 - v / max); }
    [0, 10, 20, 30].forEach(function (v) {
      svgEl('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }, svg);
      svgEl('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, svg).textContent = v;
    });
    var pts = data.map(function (d, i) { return x(i) + ',' + y(d[1]); }).join(' ');
    var defs = svgEl('defs', {}, svg), g = svgEl('linearGradient', { id: 'volg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    svgEl('stop', { offset: '0', 'stop-color': 'var(--c-teal)', 'stop-opacity': '.35' }, g);
    svgEl('stop', { offset: '1', 'stop-color': 'var(--c-teal)', 'stop-opacity': '0' }, g);
    svgEl('polygon', { points: x(0) + ',' + y(0) + ' ' + pts + ' ' + x(data.length - 1) + ',' + y(0), fill: 'url(#volg)', class: 'vol-area' }, svg);
    var line = svgEl('polyline', { points: pts, fill: 'none', stroke: 'var(--c-teal)', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', class: 'vol-line' }, svg);
    var cross = svgEl('line', { y1: T, y2: y(0), stroke: 'var(--line-2)', 'stroke-dasharray': '3 3', opacity: 0 }, svg);
    data.forEach(function (d, i) {
      svgEl('text', { x: x(i), y: H - 8, 'text-anchor': 'middle' }, svg).textContent = d[0];
      svgEl('text', { x: x(i), y: y(d[1]) - 12, 'text-anchor': 'middle', class: 't-strong' }, svg).textContent = d[1];
      var dot = svgEl('circle', { cx: x(i), cy: y(d[1]), r: 5, fill: 'var(--c-teal)', stroke: 'var(--bg-2)', 'stroke-width': 2 }, svg);
      var hit = svgEl('rect', { x: x(i) - (W - L - R) / 4, y: 0, width: (W - L - R) / 2, height: H, fill: 'transparent' }, svg);
      hit.addEventListener('pointermove', function (e) {
        cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('opacity', 1);
        dot.setAttribute('r', 7); showTip(e, d[0] + ' · chamados abertos', d[1] + '');
      });
      hit.addEventListener('pointerleave', function () { cross.setAttribute('opacity', 0); dot.setAttribute('r', 5); hideTip(); });
    });
    var len = 0; for (var i = 1; i < data.length; i++) len += Math.hypot(x(i) - x(i - 1), y(data[i][1]) - y(data[i - 1][1]));
    line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
    line.dataset.len = len;
  })();

  // medidor: SLA 53,3% x meta 90%
  (function () {
    var v = 0.533, meta = 0.9, cx = 120, cy = 112, r = 86;
    var svg = svgEl('svg', { viewBox: '0 0 240 156', role: 'img', 'aria-label': 'SLA em até 48 horas: 53,3%, 8 de 15 encerrados no prazo; meta de 90%' }, $('#ch-sla'));
    function pt(f, rr) { var a = Math.PI * (1 - f); return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; }
    var arc = 'M' + pt(0, r).join(',') + ' A' + r + ',' + r + ' 0 0 1 ' + pt(1, r).join(',');
    svgEl('path', { d: arc, fill: 'none', stroke: 'var(--c-track)', 'stroke-width': 16, 'stroke-linecap': 'round' }, svg);
    var val = svgEl('path', { d: arc, fill: 'none', stroke: 'var(--c-amber)', 'stroke-width': 16, 'stroke-linecap': 'round', class: 'sla-val' }, svg);
    var full = Math.PI * r;
    val.style.strokeDasharray = full; val.style.strokeDashoffset = full; val.dataset.target = full * (1 - v);
    var m1 = pt(meta, r - 14), m2 = pt(meta, r + 14);
    svgEl('line', { x1: m1[0], y1: m1[1], x2: m2[0], y2: m2[1], stroke: 'var(--text)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, svg);
    svgEl('text', { x: cx, y: cy + 38, 'text-anchor': 'middle', style: 'font-size:10px' }, svg).textContent = '▏marcador = meta de 90%';
    var t = svgEl('text', { x: cx, y: cy - 8, 'text-anchor': 'middle', class: 't-strong', style: 'font-size:30px' }, svg); t.textContent = '53,3%';
    svgEl('text', { x: cx, y: cy + 22, 'text-anchor': 'middle' }, svg).textContent = '8 de 15 encerrados no prazo';
    svg.addEventListener('pointermove', function (e) { showTip(e, 'SLA em até 48 h · meta 90%', '53,3% (8 de 15)'); });
    svg.addEventListener('pointerleave', hideTip);
  })();

  // rosca: situação
  (function () {
    var data = [['Em aberto', 38, 'var(--c-amber)'], ['Encerrados', 15, 'var(--c-teal)']], total = 53, cx = 80, cy = 80, r = 58, sw = 20;
    var box = $('#ch-sit');
    var svg = svgEl('svg', { viewBox: '0 0 160 160', role: 'img', 'aria-label': 'Situação: 38 em aberto (72%), 15 encerrados', style: 'max-width:190px;margin:0 auto' }, box);
    var C = 2 * Math.PI * r, gap = 3, acc = 0;
    data.forEach(function (d) {
      var len = d[1] / total * C;
      var seg = svgEl('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: d[2], 'stroke-width': sw,
        'stroke-dasharray': '0 ' + C, 'stroke-dashoffset': -acc, transform: 'rotate(-90 ' + cx + ' ' + cy + ')', class: 'donut-seg', style: 'transition:stroke-dasharray 1.2s cubic-bezier(.2,.8,.2,1), stroke-width .2s' }, svg);
      seg.dataset.dash = (len - gap) + ' ' + (C - len + gap);
      seg.addEventListener('pointermove', function (e) { seg.setAttribute('stroke-width', sw + 4); showTip(e, d[0], d[1] + ' chamados · ' + fmt(d[1] / total * 100, 0) + '%'); });
      seg.addEventListener('pointerleave', function () { seg.setAttribute('stroke-width', sw); hideTip(); });
      acc += len;
    });
    svgEl('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', class: 't-strong', style: 'font-size:24px' }, svg).textContent = '72%';
    svgEl('text', { x: cx, y: cy + 22, 'text-anchor': 'middle', style: 'font-size:10px' }, svg).textContent = 'em aberto';
    var lg = document.createElement('div'); lg.className = 'legend';
    lg.innerHTML = data.map(function (d) { return '<span><i style="background:' + d[2] + '"></i>' + d[0] + ' (' + d[1] + ')</span>'; }).join('');
    box.appendChild(lg);
  })();

  var chartsDone = false;
  function animateCharts() {
    if (chartsDone) return; chartsDone = true;
    $$('.dash .hbar-fill').forEach(function (f, i) { setTimeout(function () { f.style.width = f.getAttribute('data-w') + '%'; }, reduceMotion ? 0 : i * 40); });
    var line = $('.vol-line');
    line.style.transition = reduceMotion ? 'none' : 'stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)';
    line.style.strokeDashoffset = 0;
    var sla = $('.sla-val');
    sla.style.transition = reduceMotion ? 'none' : 'stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)';
    sla.style.strokeDashoffset = sla.dataset.target;
    $$('.donut-seg').forEach(function (s) { s.setAttribute('stroke-dasharray', s.dataset.dash); });
  }

  /* ---------- abas DAX ---------- */
  var daxData = [
    ['Chamados Encerrados =\nCALCULATE(\n    [Total Chamados],\n    fChamados[state] IN {"Resolvido", "Fechado", "Cancelado"}\n)\n\nBacklog = [Total Chamados] - [Chamados Encerrados]\n\n% Em Aberto = DIVIDE([Backlog], [Total Chamados])',
      'CALCULATE muda o contexto de filtro e conta só os encerrados. Backlog reaproveita as outras medidas, e DIVIDE evita erro de divisão por zero. Resultado: 38 em aberto (72%).'],
    ['TMA (horas) =\nAVERAGEX(\n    FILTER(fChamados, NOT ISBLANK(fChamados[closed_at])),\n    DATEDIFF(fChamados[opened_at], fChamados[closed_at], MINUTE) / 60\n)',
      'AVERAGEX calcula o tempo linha a linha e depois tira a média. Calcular em minutos e dividir por 60 dá mais precisão. Resultado: 37,6 h.'],
    ['% SLA (48h) =\nVAR Encerrados = FILTER(fChamados, NOT ISBLANK(fChamados[closed_at]))\nVAR NoPrazo =\n    COUNTROWS(\n        FILTER(Encerrados, DATEDIFF(fChamados[opened_at], fChamados[closed_at], HOUR) <= 48)\n    )\nRETURN\n    DIVIDE(NoPrazo, COUNTROWS(Encerrados))',
      'Como o made_sla da PDI vinha sempre true, o SLA foi calculado pelo tempo real de resolução. Resultado: 53,3% contra a meta de 90%.'],
    ['% Reabertura =\nDIVIDE(\n    CALCULATE([Total Chamados], fChamados[motivo_reabertura] <> ""),\n    [Total Chamados]\n)',
      'A tabela estende Task e não tem reopen_count; o campo customizado motivo_reabertura cumpre esse papel. Resultado: 1,9%.'],
    ['Cor TMA = IF([TMA (horas)] > 40, "#E5534B", "#3B8BEB")',
      'Formatação condicional: as barras de TMA por centro ficam vermelhas acima de 40 h. A regra fica numa medida só, então o limite muda em um único lugar.']
  ];
  function daxHL(src) {
    return esc(src)
      .replace(/(&quot;|")([^"\n]*)"/g, '<span class="s">"$2"</span>')
      .replace(/\b(VAR|RETURN|IN|NOT)\b/g, '<span class="k">$1</span>')
      .replace(/\b(CALCULATE|DIVIDE|AVERAGEX|FILTER|ISBLANK|DATEDIFF|COUNTROWS|IF|MINUTE|HOUR)\b/g, '<span class="f">$1</span>')
      .replace(/(\[[^\]\n]+\])/g, '<span class="m">$1</span>');
  }
  var daxTabs = $$('.dax-tabs button');
  function showDax(i) {
    daxTabs.forEach(function (b, j) { b.setAttribute('aria-selected', i === j); });
    $('#dax-code').innerHTML = daxHL(daxData[i][0]);
    $('#dax-note').textContent = daxData[i][1];
  }
  daxTabs.forEach(function (b, i) { b.addEventListener('click', function () { showDax(i); }); });
  showDax(0);

  /* ---------- vídeos do Drive tocando na própria página ---------- */
  var vm = $('#video-modal'), vmFrame = $('iframe', vm), vmCap = $('.lb-cap', vm);
  $$('.video-card').forEach(function (card) {
    var m = card.href.match(/\/file\/d\/([^/]+)/);
    if (!m) return; // sem ID do Drive: mantém o link normal
    card.addEventListener('click', function (e) {
      e.preventDefault();
      vmFrame.src = 'https://drive.google.com/file/d/' + m[1] + '/preview';
      vmCap.innerHTML = esc($('b', card).textContent) + ' · <a href="' + card.href + '" target="_blank" rel="noopener">abrir no Drive ↗</a>';
      vm.hidden = false; document.body.style.overflow = 'hidden';
      $('.lb-close', vm).focus();
    });
  });
  function closeVm() { vm.hidden = true; vmFrame.src = 'about:blank'; document.body.style.overflow = ''; }
  vm.addEventListener('click', function (e) { if (e.target === vm || e.target.classList.contains('lb-close')) closeVm(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !vm.hidden) closeVm(); });

  /* ---------- copiar e-mail ---------- */
  var copyBtn = $('#copyEmailBtn');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.getAttribute('data-email'), label = copyBtn.textContent;
    function done(msg) {
      copyBtn.textContent = msg; copyBtn.classList.add('copied');
      setTimeout(function () { copyBtn.textContent = label; copyBtn.classList.remove('copied'); }, 2000);
    }
    function fallback() {
      try {
        var t = document.createElement('textarea'); t.value = email; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
        done('E-mail copiado ✓');
      } catch (e) { done(email); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(function () { done('E-mail copiado ✓'); }, fallback);
    else fallback();
  });

  /* ---------- marquee: duplica para loop contínuo ---------- */
  var track = $('.marquee-track');
  track.innerHTML += track.innerHTML;

  /* ---------- efeitos de ponteiro (desktop) ---------- */
  if (finePointer && !reduceMotion) {
    var glow = $('.cursor-glow');
    window.addEventListener('pointermove', function (e) {
      glow.style.opacity = 1;
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { passive: true });

    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.25 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.35 + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    $$('.tilt').forEach(function (el) {
      // a animação de entrada (fill-mode forwards) sobrescreveria o transform inline
      el.addEventListener('animationend', function () { el.style.opacity = 1; el.style.animation = 'none'; });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = 'perspective(900px) rotateY(' + (x - .5) * 7 + 'deg) rotateX(' + (.5 - y) * 7 + 'deg)';
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- fundo: rede de nós (lembra fluxo/integração) ---------- */
  var canvas = $('#bg-network'), ctx = canvas.getContext('2d');
  var nodes = [], W, H, dpr, mouse = { x: -9999, y: -9999 }, netColor;
  function readColor() { netColor = getComputedStyle(document.documentElement).getPropertyValue('--net').trim(); }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr;
    var n = Math.round(Math.min(70, innerWidth * innerHeight / 22000));
    nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var maxD = 140 * dpr, mR = 180 * dpr;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      if (!reduceMotion) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        var mdx = a.x - mouse.x, mdy = a.y - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < mR) { a.x += mdx / md * .6; a.y += mdy / md * .6; }
      }
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          ctx.strokeStyle = 'rgba(' + netColor + ',' + (1 - d / maxD) * .22 + ')';
          ctx.lineWidth = dpr * .8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(' + netColor + ',.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6 * dpr, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  readColor(); resize(); draw();
  window.addEventListener('resize', function () { resize(); if (reduceMotion) draw(); });
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
  new MutationObserver(function () { readColor(); if (reduceMotion) draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
