console.log('This is a popup!');

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('title').innerText = chrome.i18n.getMessage("popupTitle");
});