document.addEventListener('DOMContentLoaded', async () => {
  await window.i18nHelper.init();
  const getMessage = (key) => window.i18nHelper.getMessage(key);

  // Localize static elements
  document.getElementById('options-title').innerText = getMessage("optionsTitle");
  document.getElementById('general-settings-title').innerText = getMessage("generalSettings");
  document.getElementById('language-label').innerText = getMessage("languageLabel");
  document.getElementById('azure-settings-title').innerText = getMessage("azureOpenAISettings");
  document.getElementById('azure-endpoint-label').innerText = getMessage("azureEndpoint");
  document.getElementById('azure-apikey-label').innerText = getMessage("azureApiKey");
  document.getElementById('azure-deployment-label').innerText = getMessage("azureDeploymentName");
  document.getElementById('template-settings-title').innerText = getMessage("templateSettings");
  document.getElementById('save-btn').innerText = getMessage("saveBtn");

  const container = document.getElementById('template-settings-container');

  // Function to list files in the templates directory
  function getTemplateFiles() {
    return new Promise((resolve, reject) => {
      chrome.runtime.getPackageDirectoryEntry((root) => {
        root.getDirectory('templates', { create: false }, (dirEntry) => {
          const dirReader = dirEntry.createReader();
          const entries = [];
          
          const readEntries = () => {
            dirReader.readEntries((results) => {
              if (!results.length) {
                resolve(entries.filter(e => e.isFile && e.name.endsWith('.xlsx')).map(e => e.name.replace('.xlsx', '')));
              } else {
                entries.push(...results);
                readEntries();
              }
            }, (error) => reject(error));
          };
          
          readEntries();
        }, (error) => {
          console.warn("Could not access templates directory:", error);
          resolve([]); 
        });
      });
    });
  }

  // Helper to create a field row
  function createFieldRow(templateId, fieldConfig = {}) {
    const row = document.createElement('div');
    row.className = 'field-row';
    row.dataset.templateId = templateId;

    const colInput = document.createElement('input');
    colInput.type = 'text';
    colInput.placeholder = 'Col';
    colInput.className = 'col-input field-col';
    colInput.value = fieldConfig.col || '';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'Fixed Value';
    valueInput.className = 'field-value';
    valueInput.value = fieldConfig.value || '';

    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'X';
    removeBtn.className = 'remove-field-btn';
    removeBtn.onclick = () => row.remove();

    row.appendChild(colInput);
    row.appendChild(valueInput);
    row.appendChild(removeBtn);

    return row;
  }

  // Load settings
  const items = await chrome.storage.sync.get(null);
  
  // Static settings
  document.getElementById('app-language').value = items.appLanguage || 'default';
  document.getElementById('azure-endpoint').value = items.azureEndpoint || '';
  document.getElementById('azure-apikey').value = items.azureApiKey || '';
  document.getElementById('azure-deployment').value = items.azureDeployment || '';

  const templateConfig = items.templateConfig || {};
  const availableTemplates = await getTemplateFiles();

  // Generate UI for templates
  availableTemplates.forEach(templateId => {
    const subsection = document.createElement('div');
    subsection.className = 'template-block';
    subsection.dataset.templateId = templateId;
    
    const title = document.createElement('h3');
    title.innerText = templateId;
    subsection.appendChild(title);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'fields-container';
    subsection.appendChild(fieldsContainer);

    // Load existing fields for this template
    const existingFields = templateConfig[templateId] || [];
    existingFields.forEach(field => {
      fieldsContainer.appendChild(createFieldRow(templateId, field));
    });

    const addBtn = document.createElement('button');
    addBtn.innerText = 'Add Field';
    addBtn.className = 'add-field-btn';
    addBtn.onclick = () => {
      fieldsContainer.appendChild(createFieldRow(templateId));
    };
    subsection.appendChild(addBtn);

    container.appendChild(subsection);
  });

  // Save settings
  document.getElementById('save-btn').addEventListener('click', () => {
    const appLanguage = document.getElementById('app-language').value;
    const azureEndpoint = document.getElementById('azure-endpoint').value;
    const azureApiKey = document.getElementById('azure-apikey').value;
    const azureDeployment = document.getElementById('azure-deployment').value;

    const newTemplateConfig = {};

    // Collect dynamic settings
    const subsections = container.querySelectorAll('.template-block');
    subsections.forEach(sub => {
      const templateId = sub.dataset.templateId;
      const rows = sub.querySelectorAll('.field-row');
      const fields = [];
      
      rows.forEach(row => {
        const col = row.querySelector('.field-col').value.trim().toUpperCase();
        const value = row.querySelector('.field-value').value;

        if (col) {
          fields.push({ col, value });
        }
      });

      if (fields.length > 0) {
        newTemplateConfig[templateId] = fields;
      }
    });

    const settings = {
      appLanguage,
      azureEndpoint,
      azureApiKey,
      azureDeployment,
      templateConfig: newTemplateConfig
    };

    chrome.storage.sync.set(settings, () => {
      const status = document.getElementById('status');
      status.textContent = getMessage("saveSuccess");
      setTimeout(() => {
        status.textContent = '';
        // Reload to apply language change
        window.location.reload();
      }, 1000);
    });
  });
});