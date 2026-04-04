/**
 * Global Language Switcher
 * Uses server-rendered EJS translations and reloads the current page
 */
(function(){
  function getCookie(name){
    const m=document.cookie.match(new RegExp('(?:^|; )'+name.replace(/([.$?*|{}()\[\]\\/+^])/g,'\\$1')+'=([^;]*)'));
    return m?decodeURIComponent(m[1]):null;
  }

  window.currentLangCode = getCookie('lang') || localStorage.getItem('nirvaah_lang') || 'en';

  function setActiveLangButtons(lang){
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.langSwitch===lang);
      btn.setAttribute('aria-pressed', btn.dataset.langSwitch===lang ? 'true' : 'false');
    });
  }

  window.switchLanguage = async function(targetLang){
    if(!targetLang || targetLang===window.currentLangCode) return;
    try {
      const res = await fetch('/lang/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: targetLang })
      });
      if(!res.ok) throw new Error('Failed to save language');
      localStorage.setItem('nirvaah_lang', targetLang);
      window.currentLangCode = targetLang;
      setActiveLangButtons(targetLang);
      window.location.reload();
    } catch (error) {
      console.error('Language switch failed:', error);
    }
  };

  document.addEventListener('DOMContentLoaded', () => setActiveLangButtons(window.currentLangCode));
})();
