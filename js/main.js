(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PHONE = '919487530243';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mobile nav */
  var toggle = $('.nav-toggle'), nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* track filter */
  var chips = $$('.chip');
  var tracks = $$('#track-list .track');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      tracks.forEach(function (t) {
        t.hidden = !(f === 'all' || t.getAttribute('data-group') === f);
      });
    });
  });

  /* remember which track a link asked about */
  function setProgram(name) {
    var sel = $('#f-program');
    if (!sel || !name) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text === name || sel.options[i].value === name) { sel.selectedIndex = i; return; }
    }
  }
  $$('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { setProgram(a.getAttribute('data-track')); });
  });

  /* track finder */
  var quizBox = $('#quiz-box');
  var questions = [
    { q: 'What sounds most fun to do for a whole afternoon?', a: [
      ['Build something that works on screen', { fs: 2, ai: 1 }],
      ['Make things look and feel great', { ds: 2, md: 1 }],
      ['Dig into numbers and find patterns', { da: 2, ai: 1 }],
      ['Tell stories and grow an audience', { mk: 2, md: 1 }]
    ]},
    { q: 'Which describes you best right now?', a: [
      ['I like logic puzzles and fixing things', { fs: 2, da: 1 }],
      ['I notice small details in design', { ds: 2 }],
      ['I like talking to people and ideas', { mk: 2 }],
      ['I want to work with AI tools', { ai: 2, da: 1 }]
    ]},
    { q: 'What do you want to show in your portfolio?', a: [
      ['A live app people can use', { fs: 2 }],
      ['A tool that runs on an AI model', { ai: 2 }],
      ['A design or video I made', { ds: 1, md: 2 }],
      ['A campaign or a data dashboard', { mk: 1, da: 2 }]
    ]}
  ];
  var results = {
    fs: ['Fullstack', 'Fullstack', 'You like building things that work end to end. Start with MERN Fullstack, React + Java or React + Python.'],
    ai: ['Gen AI', 'Gen AI', 'You want to work with AI itself. Generative AI Foundations is the most joined program at Karka, with 900+ enrollments.'],
    da: ['Data and ML', 'Data & ML', 'Patterns in data are your thing. Look at AI & Data Science or Data Analytics with AI.'],
    ds: ['Design', 'Design', 'You care how things look and feel. UI/UX Design, Web Designing and Graphic Designing are your tracks.'],
    md: ['Digital media', 'Digital Media', 'You think in visuals and motion. Video Editing and Multimedia & Animation fit you.'],
    mk: ['Content and marketing', 'Content & Marketing', 'You like ideas and audiences. Digital Marketing, SEO Analyst and Content Writing are a match.']
  };
  var step = 0, score = {};

  function reset() { step = 0; score = {}; render(); }

  function render() {
    if (!quizBox) return;
    quizBox.innerHTML = '';
    if (step < questions.length) {
      var q = questions[step];
      var p = document.createElement('p'); p.className = 'quiz-step'; p.textContent = 'Question ' + (step + 1) + ' of ' + questions.length;
      var h = document.createElement('h3'); h.textContent = q.q;
      var ul = document.createElement('div'); ul.className = 'quiz-opts';
      q.a.forEach(function (opt) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'quiz-opt'; b.textContent = opt[0];
        b.addEventListener('click', function () {
          Object.keys(opt[1]).forEach(function (k) { score[k] = (score[k] || 0) + opt[1][k]; });
          step++; render();
          var first = $('.quiz-opt, .quiz-result h3', quizBox);
          if (first) first.focus && first.focus();
        });
        ul.appendChild(b);
      });
      quizBox.appendChild(p); quizBox.appendChild(h); quizBox.appendChild(ul);
    } else {
      var best = 'fs', max = -1;
      Object.keys(results).forEach(function (k) { if ((score[k] || 0) > max) { max = score[k] || 0; best = k; } });
      var r = results[best];
      var wrap = document.createElement('div'); wrap.className = 'quiz-result';
      var s = document.createElement('p'); s.className = 'quiz-step'; s.textContent = 'Your suggested track';
      var h2 = document.createElement('h3'); h2.textContent = r[0]; h2.tabIndex = -1;
      var d = document.createElement('p'); d.textContent = r[2];
      var act = document.createElement('div'); act.className = 'actions';
      var a = document.createElement('a'); a.className = 'btn btn-primary'; a.href = '#apply'; a.textContent = 'Ask a mentor about ' + r[0];
      a.addEventListener('click', function () { setProgram(r[1]); });
      var again = document.createElement('button'); again.type = 'button'; again.className = 'quiz-reset'; again.textContent = 'Start over';
      again.addEventListener('click', reset);
      act.appendChild(a); act.appendChild(again);
      wrap.appendChild(s); wrap.appendChild(h2); wrap.appendChild(d); wrap.appendChild(act);
      quizBox.appendChild(wrap);
    }
  }
  render();

  /* count-up + bars when scrolled into view */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || isNaN(end)) return;
    var t0 = null, dur = 1100;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target.id === 'ledger') $$('[data-count]', e.target).forEach(countUp);
        if (e.target.id === 'bars') e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    var l = $('#ledger'), b = $('#bars');
    if (l) io.observe(l);
    if (b) io.observe(b);
  } else {
    var bb = $('#bars'); if (bb) bb.classList.add('in');
  }

  /* apply form -> WhatsApp (nothing is stored) */
  var form = $('#apply-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var who = form.elements.who.value;
      var prog = form.elements.program.value;
      var msg = 'Hi Karka, my name is ' + name + '. I am a ' + who.toLowerCase() + ' and I am curious about: ' + prog + '. I would like a free career call.';
      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  /* mobile action bar: show after the hero, hide at the form */
  var bar = $('#m-bar'), hero = $('#hero'), apply = $('#apply');
  if (bar && hero && 'IntersectionObserver' in window) {
    var pastHero = false, atForm = false;
    function upd() { bar.classList.toggle('show', pastHero && !atForm); }
    new IntersectionObserver(function (en) { pastHero = !en[0].isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(function (en) { atForm = en[0].isIntersecting; upd(); }).observe(apply);
  }
})();
