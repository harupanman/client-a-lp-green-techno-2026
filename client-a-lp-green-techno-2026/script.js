/**
 * 株式会社グリーンテクノ LP（BtoC版）— script.js
 * ──────────────────────────────────────────
 * 1. FAQ アコーディオン
 * 2. スクロール連動（ヘッダー影 / ページトップボタン）
 * 3. Fade-in（Intersection Observer）
 * 4. スムーズスクロール
 * 5. フォームバリデーション
 * 6. ナビ アクティブ連動
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
    initScroll();
    initFadeIn();
    initSmoothScroll();
    initFormValidation();
    initNavHighlight();
});

/* ============================================================
   1. FAQ
   ============================================================ */
function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const btn = item.querySelector('.faq-q');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            // 他を閉じる
            items.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* ============================================================
   2. スクロール連動
   ============================================================ */
function initScroll() {
    const header  = document.getElementById('header');
    const backTop = document.getElementById('back-top');

    const onScroll = () => {
        const y = window.scrollY;
        header?.classList.toggle('scrolled', y > 60);
        backTop?.classList.toggle('visible', y > 500);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================================
   3. Fade-in
   ============================================================ */
function initFadeIn() {
    const targets = document.querySelectorAll('.fade-in');
    if (!targets.length) return;

    // アクセシビリティ: アニメーション無効化設定
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        targets.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    targets.forEach(el => observer.observe(el));
}

/* ============================================================
   4. スムーズスクロール
   ============================================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const headerH = document.getElementById('header')?.offsetHeight ?? 0;
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            // フォーカス移動（a11y）
            target.tabIndex = -1;
            target.focus({ preventScroll: true });
        });
    });
}

/* ============================================================
   5. フォームバリデーション
   ============================================================ */
function initFormValidation() {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    if (!form || !submitBtn) return;

    const rules = {
        name:  { required: true, label: 'お名前 / 法人・物件名' },
        phone: {
            required: true, label: '電話番号',
            pattern: /^[\d\-\(\)\+\s]{10,20}$/,
            patternMsg: '正しい電話番号の形式で入力してください',
        },
        email: {
            required: true, label: 'メールアドレス',
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            patternMsg: '正しいメールアドレスの形式で入力してください',
        },
    };

    // blur 時リアルタイム検証
    Object.keys(rules).forEach(name => {
        const field = form.elements[name];
        if (!field) return;
        field.addEventListener('blur',  () => validateField(field, rules[name]));
        field.addEventListener('input', () => clearError(field));
    });

    // 送信時
    form.addEventListener('submit', e => {
        let valid = true;
        Object.keys(rules).forEach(name => {
            const field = form.elements[name];
            if (field && !validateField(field, rules[name])) valid = false;
        });
        if (!valid) {
            e.preventDefault();
            form.querySelector('.error')?.focus();
            return;
        }
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> 送信中...';
    });
}

function validateField(field, rule) {
    clearError(field);
    const val = field.value.trim();
    if (rule.required && !val) {
        showError(field, `${rule.label}を入力してください`);
        return false;
    }
    if (val && rule.pattern && !rule.pattern.test(val)) {
        showError(field, rule.patternMsg ?? '入力内容を確認してください');
        return false;
    }
    return true;
}

function showError(field, msg) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    const prev = field.parentElement.querySelector('.field-error');
    if (prev) prev.remove();
    const p = document.createElement('p');
    p.className = 'field-error';
    p.setAttribute('role', 'alert');
    p.innerHTML = `<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ${msg}`;
    field.insertAdjacentElement('afterend', p);
}

function clearError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    field.parentElement.querySelector('.field-error')?.remove();
}

/* ============================================================
   6. ナビ アクティブ連動
   ============================================================ */
function initNavHighlight() {
    const links    = document.querySelectorAll('.header-nav a[href^="#"]');
    const sections = [];
    links.forEach(link => {
        const id  = link.getAttribute('href').slice(1);
        const sec = document.getElementById(id);
        if (sec) sections.push({ link, sec });
    });
    if (!sections.length) return;

    const onScroll = () => {
        const y = window.scrollY + 120;
        let current = null;
        sections.forEach(({ sec }) => { if (sec.offsetTop <= y) current = sec.id; });
        sections.forEach(({ link, sec }) => {
            const active = sec.id === current;
            link.setAttribute('aria-current', active ? 'page' : 'false');
            link.style.color = active ? 'var(--clr-forest)' : '';
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}
