/* =====================================================================
   Luna Arts Academy of Wilmington — Shared site JS
   ===================================================================== */

(function () {
  /* —— Scroll reveals via IntersectionObserver —— */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* —— Mobile nav drawer —— */
  const burger = document.querySelector('.nav-burger');
  const drawer = document.querySelector('.nav-drawer');
  const drawerClose = document.querySelector('.nav-drawer .close');
  if (burger && drawer) {
    burger.addEventListener('click', () => drawer.classList.add('open'));
    if (drawerClose) drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
    drawer.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => drawer.classList.remove('open'))
    );
  }

  /* —— Generic modal open/close —— */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) {
      e.preventDefault();
      const id = opener.getAttribute('data-modal-open');
      const m = document.getElementById(id);
      if (m) {
        m.classList.add('open');
        // Stash event details onto modal if available
        const evTitle = opener.getAttribute('data-event-title');
        const evMeta = opener.getAttribute('data-event-meta');
        if (evTitle && m.querySelector('[data-modal-title]')) m.querySelector('[data-modal-title]').textContent = evTitle;
        if (evMeta && m.querySelector('[data-modal-meta]')) m.querySelector('[data-modal-meta]').textContent = evMeta;
      }
    }
    const closer = e.target.closest('[data-modal-close]');
    if (closer) {
      const m = closer.closest('.modal-backdrop');
      if (m) {
        m.classList.remove('open');
        // Reset any success states inside
        const f = m.querySelector('form');
        const s = m.querySelector('.success-state');
        if (f && s) { f.style.display = ''; s.style.display = 'none'; }
      }
    }
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('open');
    }
  });

  /* —— Form mock submit: validates required, shows success state —— */
  const FORM_ENDPOINT = 'https://luna-forms.mark-sanders3.workers.dev';

  function collectForm(form) {
    const data = {};
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) {
      if (k in data) {
        if (!Array.isArray(data[k])) data[k] = [data[k]];
        data[k].push(v);
      } else {
        data[k] = v;
      }
    }
    return data;
  }

  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.matches('[data-mock-submit]')) return;
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((input) => {
      const f = input.closest('.field');
      if (f) f.classList.remove('err');
      if (!input.value || (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value))) {
        if (f) f.classList.add('err');
        ok = false;
      }
    });
    if (!ok) return;

    const payload = collectForm(form);
    payload.formType = form.getAttribute('data-form-type') || 'contact';
    const modal = form.closest('.modal');
    if (modal) {
      const t = modal.querySelector('[data-modal-title]');
      const m = modal.querySelector('[data-modal-meta]');
      if (t) payload.event = t.textContent.trim();
      if (m) payload.when = m.textContent.trim();
    }

    const btn = form.querySelector('[type="submit"]');
    const btnText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    const success = form.parentElement.querySelector('.success-state');
    const showSuccess = () => {
      if (success) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        form.innerHTML = '<div class="success-state"><div class="moon">◑</div><h3>Thank you.</h3><p>We’ll be in touch from Wilmington soon.</p></div>';
      }
    };
    const showError = (msg) => {
      if (btn) { btn.disabled = false; btn.textContent = btnText; }
      let note = form.querySelector('.form-error');
      if (!note) {
        note = document.createElement('div');
        note.className = 'form-error';
        note.style.cssText = 'margin-top:12px;color:var(--rose,#D6336C);font-size:0.9rem';
        form.appendChild(note);
      }
      note.textContent = msg || 'Something went wrong — please email info@lunaartsacademy.org.';
    };

    if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('REPLACE-WITH-SUBDOMAIN') !== -1) {
      showError('Form delivery isn’t configured yet. Please email info@lunaartsacademy.org.');
      return;
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('bad status ' + res.status);
      showSuccess();
    } catch (err) {
      showError();
    }
  });

  /* —— Hero parallax (moon + stars) —— */
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const moon = hero.querySelector('[data-hero-moon]');
    const stars = hero.querySelectorAll('[data-hero-star]');
    const swirls = hero.querySelectorAll('[data-hero-swirl]');
    let raf;
    const onScroll = () => {
      const y = window.scrollY;
      if (moon) moon.style.transform = `translateY(${y * 0.15}px) rotate(${y * 0.02}deg)`;
      stars.forEach((s, i) => {
        s.style.transform = `translateY(${y * (0.05 + i * 0.01)}px)`;
      });
      swirls.forEach((s, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        s.style.transform = `translateX(${y * 0.08 * dir}px) rotate(${y * 0.04 * dir}deg)`;
      });
    };
    window.addEventListener('scroll', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    });
  }

  /* —— Donation flow logic (donate page + footer/CTA) —— */
  const donate = document.querySelector('[data-donate-flow]');
  if (donate) {
    const state = {
      tier: null,
      amount: 50,
      cadence: 'monthly',
      step: 1
    };

    const tierCards = donate.querySelectorAll('[data-tier]');
    const amountInput = donate.querySelector('[data-amount]');
    const cadenceBtns = donate.querySelectorAll('[data-cadence]');
    const presetBtns = donate.querySelectorAll('[data-preset]');
    const steps = donate.querySelectorAll('[data-step]');
    const nextBtns = donate.querySelectorAll('[data-step-next]');
    const prevBtns = donate.querySelectorAll('[data-step-prev]');
    const summaryEls = donate.querySelectorAll('[data-summary]');

    const tiers = {
      moonbeam: { amount: 25, cadence: 'monthly', label: 'Moonbeam' },
      crescent: { amount: 50, cadence: 'monthly', label: 'Crescent' },
      fullmoon: { amount: 100, cadence: 'monthly', label: 'Full Moon' },
      luminary: { amount: 1000, cadence: 'annual', label: 'Luminary' },
      founding: { amount: 5000, cadence: 'annual', label: 'Founding Luminary' }
    };

    const render = () => {
      // tier highlight
      tierCards.forEach((c) => {
        c.classList.toggle('selected', c.getAttribute('data-tier') === state.tier);
      });
      // amount
      if (amountInput) amountInput.value = state.amount;
      // cadence
      cadenceBtns.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-cadence') === state.cadence);
      });
      // preset highlight
      presetBtns.forEach((b) => {
        b.classList.toggle('active', Number(b.getAttribute('data-preset')) === state.amount);
      });
      // summary
      summaryEls.forEach((s) => {
        const key = s.getAttribute('data-summary');
        if (key === 'amount') s.textContent = '$' + Number(state.amount).toLocaleString();
        if (key === 'cadence') s.textContent = state.cadence;
        if (key === 'tier') s.textContent = state.tier ? tiers[state.tier].label : 'Custom gift';
        if (key === 'annual') {
          const annual = state.cadence === 'monthly' ? state.amount * 12 : state.amount;
          s.textContent = '$' + Number(annual).toLocaleString();
        }
      });
      // step visibility
      steps.forEach((st) => {
        st.style.display = Number(st.getAttribute('data-step')) === state.step ? '' : 'none';
      });
    };

    tierCards.forEach((c) => {
      c.addEventListener('click', () => {
        const t = c.getAttribute('data-tier');
        state.tier = t;
        const tier = tiers[t];
        if (tier) {
          state.amount = tier.amount;
          state.cadence = tier.cadence;
        }
        render();
      });
    });
    cadenceBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.cadence = b.getAttribute('data-cadence');
        state.tier = null;
        render();
      });
    });
    presetBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.amount = Number(b.getAttribute('data-preset'));
        state.tier = null;
        render();
      });
    });
    if (amountInput) {
      amountInput.addEventListener('input', () => {
        state.amount = Number(amountInput.value) || 0;
        state.tier = null;
        // don't re-render amount input (cursor jump)
        presetBtns.forEach((b) => {
          b.classList.toggle('active', Number(b.getAttribute('data-preset')) === state.amount);
        });
        tierCards.forEach((c) => c.classList.remove('selected'));
        summaryEls.forEach((s) => {
          const key = s.getAttribute('data-summary');
          if (key === 'amount') s.textContent = '$' + Number(state.amount).toLocaleString();
          if (key === 'annual') {
            const annual = state.cadence === 'monthly' ? state.amount * 12 : state.amount;
            s.textContent = '$' + Number(annual).toLocaleString();
          }
        });
      });
    }
    nextBtns.forEach((b) => {
      b.addEventListener('click', () => {
        if (state.amount < 1) return;
        state.step = Math.min(3, state.step + 1);
        render();
        donate.scrollIntoView ? null : null; // intentionally avoid scrollIntoView per guidelines
        window.scrollTo({ top: donate.offsetTop - 80, behavior: 'smooth' });
      });
    });
    prevBtns.forEach((b) => {
      b.addEventListener('click', () => {
        state.step = Math.max(1, state.step - 1);
        render();
        window.scrollTo({ top: donate.offsetTop - 80, behavior: 'smooth' });
      });
    });

    // Mock card formatting
    const cardNum = donate.querySelector('[data-card-num]');
    if (cardNum) {
      cardNum.addEventListener('input', () => {
        let v = cardNum.value.replace(/\D/g, '').slice(0, 16);
        cardNum.value = v.match(/.{1,4}/g)?.join(' ') ?? v;
      });
    }
    const cardExp = donate.querySelector('[data-card-exp]');
    if (cardExp) {
      cardExp.addEventListener('input', () => {
        let v = cardExp.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
        cardExp.value = v;
      });
    }

    // Final submit -> step 3 success
    const finalForm = donate.querySelector('[data-donate-form]');
    if (finalForm) {
      finalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;
        finalForm.querySelectorAll('[required]').forEach((input) => {
          const f = input.closest('.field');
          if (f) f.classList.remove('err');
          if (!input.value || (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value))) {
            if (f) f.classList.add('err');
            ok = false;
          }
        });
        if (!ok) return;
        state.step = 3;
        render();
        window.scrollTo({ top: donate.offsetTop - 80, behavior: 'smooth' });
      });
    }

    render();
  }

  /* —— Stat counters —— */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = Number(el.getAttribute('data-counter'));
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const dur = 1500;
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const value = Math.round(target * eased);
            el.textContent = prefix + value.toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterIO.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach((c) => counterIO.observe(c));
  }

  /* —— Event filter tabs —— */
  const tabs = document.querySelectorAll('[data-tabs]');
  tabs.forEach((tabset) => {
    const buttons = tabset.querySelectorAll('[data-tab]');
    const target = document.querySelector(tabset.getAttribute('data-tabs-target') || '');
    if (!target) return;
    const cards = target.querySelectorAll('[data-cat]');
    buttons.forEach((b) => {
      b.addEventListener('click', () => {
        buttons.forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        const cat = b.getAttribute('data-tab');
        cards.forEach((c) => {
          if (cat === 'all' || c.getAttribute('data-cat') === cat) {
            c.style.display = '';
          } else {
            c.style.display = 'none';
          }
        });
      });
    });
  });

})();
