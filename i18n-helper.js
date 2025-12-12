class I18nHelper {
  constructor() {
    this.locale = 'default';
    this.messages = null;
  }

  async init() {
    const items = await chrome.storage.sync.get('appLanguage');
    this.locale = items.appLanguage || 'default';

    if (this.locale !== 'default') {
      try {
        const url = chrome.runtime.getURL(`_locales/${this.locale}/messages.json`);
        const response = await fetch(url);
        this.messages = await response.json();
      } catch (e) {
        console.error('Failed to load locale messages:', e);
        this.messages = null;
      }
    }
  }

  getMessage(key) {
    if (this.messages && this.messages[key]) {
      return this.messages[key].message;
    }
    return chrome.i18n.getMessage(key);
  }
}

window.i18nHelper = new I18nHelper();
