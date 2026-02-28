/**
 * 株式会社グリーンテクノ LP - script.js
 * ========================================================
 * 1. FAQ アコーディオン
 * 2. スクロール連動（ヘッダー影 / ページトップボタン）
 * 3. Intersection Observer による Fade-in アニメーション
 * 4. スムーズスクロール（アンカーリンク）
 * 5. フォームバリデーション（HTML5 + カスタム）
 * 6. ナビ アクティブ状態（スクロール連動）
 */

'use strict';

/* ==========================================================================
   DOMContentLoaded
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
    initScrollBehavior();
    initFadeIn();
    initSmoothScroll();
    initFormValidation();
    initNavHighlight();
});

/* ==========================================================================
   1. FAQ アコーディオン
   ========================================================================== */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const button = item.querySelector('.faq-q');
        const answer = item.querySelector('.faq-a');

        if (!button || !answer) return;

        button.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // 他をすべて閉じる
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    const otherBtn = other.querySelector('.faq-q');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // 自分をトグル
            item.classList.toggle('active', !isActive);
            button.setAttribute('aria-expanded', String(!isActive));
        });

        // キーボード操作（Enter / Space）はボタンなので自動対応済み
    });
}

/* ==========================================================================
   2. スクロール連動
   ========================================================================== */
function initScrollBehavior() {
    const header = document.getElementById('header');
    const backToTop = document.getElementById('back-to-top');

    if (!header && !backToTop) return;

    const onScroll = () => {
        const scrollY = window.scrollY || window.pageYOffset;

        // ヘッダー shadow
        if (header) {
            header.classList.toggle('scrolled', scrollY > 60);
        }

        // ページトップボタン
        if (backToTop) {
            backToTop.classList.toggle('visible', scrollY > 500);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // ページトップへ戻る
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ==========================================================================
   3. Fade-in アニメーション（Intersection Observer）
   ========================================================================== */
function initFadeIn() {
    const targets = document.querySelectorAll('.fade-in');

    if (!targets.length) return;

    // prefers-reduced-motion 対応
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
        targets.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: '0px 0px -32px 0px',
        }
    );

    targets.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. スムーズスクロール（アンカーリンク）
   ========================================================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const header = document.getElementById('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;

            window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: 'smooth',
            });

            // フォーカスをターゲットに移動（アクセシビリティ）
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });
}

/* ==========================================================================
   5. フォームバリデーション
   ========================================================================== */
function initFormValidation() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (!form || !submitBtn) return;

    // バリデーションルール
    const rules = {
        company: { required: true, label: '会社名' },
        name:    { required: true, label: 'ご担当者名' },
        phone:   {
            required: true,
            label: '電話番号',
            pattern: /^[\d\-\(\)\+\s]{10,20}$/,
            patternMsg: '正しい電話番号の形式で入力してください',
        },
        email:   {
            required: true,
            label: 'メールアドレス',
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            patternMsg: '正しいメールアドレスの形式で入力してください',
        },
    };

    // リアルタイム検証（blur）
    Object.keys(rules).forEach(name => {
        const field = form.elements[name];
        if (!field) return;

        field.addEventListener('blur', () => validateField(field, rules[name]));
        field.addEventListener('input', () => clearError(field));
    });

    // 送信時
    form.addEventListener('submit', (e) => {
        let isValid = true;

        Object.keys(rules).forEach(name => {
            const field = form.elements[name];
            if (!field) return;
            if (!validateField(field, rules[name])) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            // 最初のエラーフィールドにフォーカス
            const firstError = form.querySelector('.error');
            if (firstError) firstError.focus();
            return;
        }

        // 送信中状態
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> 送信中...';
    });
}

/**
 * 単一フィールドのバリデーション
 * @param {HTMLElement} field
 * @param {Object} rule
 * @returns {boolean}
 */
function validateField(field, rule) {
    clearError(field);
    const value = field.value.trim();

    if (rule.required && !value) {
        showError(field, `${rule.label}を入力してください`);
        return false;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
        showError(field, rule.patternMsg || '入力内容を確認してください');
        return false;
    }

    return true;
}

function showError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    // 既存のエラーメッセージを除去
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();

    const errEl = document.createElement('p');
    errEl.className = 'field-error';
    errEl.setAttribute('role', 'alert');
    errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ${message}`;
    field.insertAdjacentElement('afterend', errEl);
}

function clearError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    const errEl = field.parentElement.querySelector('.field-error');
    if (errEl) errEl.remove();
}

/* ==========================================================================
   6. ナビ アクティブ状態（スクロール連動）
   ========================================================================== */
function initNavHighlight() {
    const navLinks = document.querySelectorAll('.header-nav a[href^="#"]');
    if (!navLinks.length) return;

    const sections = [];
    navLinks.forEach(link => {
        const id = link.getAttribute('href').slice(1);
        const section = document.getElementById(id);
        if (section) sections.push({ link, section });
    });

    const onScroll = () => {
        const scrollY = window.scrollY + 120;

        let current = null;
        sections.forEach(({ section }) => {
            if (section.offsetTop <= scrollY) {
                current = section.id;
            }
        });

        sections.forEach(({ link, section }) => {
            if (section.id === current) {
                link.setAttribute('aria-current', 'true');
                link.style.color = 'var(--c-secondary)';
            } else {
                link.removeAttribute('aria-current');
                link.style.color = '';
            }
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // 初期実行
}
