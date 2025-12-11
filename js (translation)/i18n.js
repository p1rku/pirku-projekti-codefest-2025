(function(){
  const T = window.TRANSLATIONS || {};
  const DEFAULT = 'en';

  function getSavedLang(){
    try { return localStorage.getItem('site_lang') || DEFAULT; } catch(e){ return DEFAULT; }
  }

  function saveLang(lang){
    try { localStorage.setItem('site_lang', lang); } catch(e){}
  }

  function translateKey(lang, key){
    if(!T[lang]) lang = DEFAULT;
    return (T[lang] && T[lang][key]) || (T[DEFAULT] && T[DEFAULT][key]) || null;
  }

  function applyTranslations(lang){
    // elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = translateKey(lang, key);
      if(val !== null) el.textContent = val;
    });

    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = translateKey(lang, key);
      if(val !== null) el.setAttribute('placeholder', val);
    });

    // values (for inputs/buttons)
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      const val = translateKey(lang, key);
      if(val !== null) el.value = val;
    });

    // card titles that use data-title on parent .card (category-aware)
    document.querySelectorAll('.card[data-title]').forEach(card => {
      const original = card.getAttribute('data-title');
      const category = card.getAttribute('data-category') || 'movie';
      const key = category + '.' + original;
      const val = translateKey(lang, key) || original;
      const titleEl = card.querySelector('.card-title');
      if(titleEl) titleEl.textContent = val;
    });

    // update language button display
    const langBtn = document.getElementById('langDropdownBtn');
    if(langBtn){
      const name = (T.langNames && T.langNames[lang]) || lang.toUpperCase();
      langBtn.textContent = name;
    }
  }

  function setLanguage(lang){
    saveLang(lang);
    applyTranslations(lang);
  }

  function initLangDropdown(){
    document.querySelectorAll('#langDropdownMenu [data-lang]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });
  }

  // Ensure that every card's data-title is present in the TRANSLATIONS object for all langs
  function ensureTitleKeysExist(){
    try {
      const T = window.TRANSLATIONS || {};
      const langs = Object.keys(T.langNames || {});
      const en = T['en'] || {};
      document.querySelectorAll('.card[data-title]').forEach(card => {
        const title = card.getAttribute('data-title');
        const category = card.getAttribute('data-category') || 'movie';
        const key = category + '.' + title;
        // ensure English has it
        if(!(key in en)) en[key] = title;
        // ensure other langs have it (copy from English)
        langs.forEach(l => {
          if(!T[l]) T[l] = {};
          if(!(key in T[l])) T[l][key] = en[key];
        });
      });
    } catch(e) { /* ignore */ }
  }

  // Expose API
  window.i18n = {
    init: function(){
      initLangDropdown();
        ensureTitleKeysExist();
      const lang = getSavedLang();
      applyTranslations(lang);
    },
    setLanguage: setLanguage,
    getLanguage: getSavedLang
  };

  // Auto init when DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => window.i18n.init());
  } else {
    window.i18n.init();
  }

})();
