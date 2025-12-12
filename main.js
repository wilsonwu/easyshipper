console.log('This is a popup!');

document.addEventListener('DOMContentLoaded', async function() {
  await window.i18nHelper.init();
  const getMessage = (key) => window.i18nHelper.getMessage(key);

  document.getElementById('title').innerText = getMessage("popupTitle");
  document.getElementById('template-label').innerText = getMessage("templateLabel");
  document.getElementById('order-input').placeholder = getMessage("inputPlaceholder");
  document.getElementById('add-btn').innerText = getMessage("addBtn");
  document.getElementById('export-btn').innerText = getMessage("exportBtn");
  document.getElementById('list-header').innerText = getMessage("listHeader");

  const select = document.getElementById('template-select');

  // Function to list files in the templates directory
  function getTemplates() {
    return new Promise((resolve, reject) => {
      chrome.runtime.getPackageDirectoryEntry((root) => {
        root.getDirectory('templates', { create: false }, (dirEntry) => {
          const dirReader = dirEntry.createReader();
          const entries = [];
          
          const readEntries = () => {
            dirReader.readEntries((results) => {
              if (!results.length) {
                resolve(entries.filter(e => e.isFile && e.name.endsWith('.xlsx')));
              } else {
                entries.push(...results);
                readEntries();
              }
            }, (error) => reject(error));
          };
          
          readEntries();
        }, (error) => {
          // If directory doesn't exist or other error
          console.warn("Could not access templates directory:", error);
          resolve([]); 
        });
      });
    });
  }

  // Populate dropdown
  getTemplates().then(files => {
    files.forEach(file => {
      const id = file.name.replace('.xlsx', '');
      const nameKey = 'template_' + id;
      const localizedName = chrome.i18n.getMessage(nameKey);
      
      const option = document.createElement('option');
      option.value = id; // Value is the filename without extension
      option.innerText = localizedName || id; // Fallback to ID if no translation
      select.appendChild(option);
    });
  });

  const orderInput = document.getElementById('order-input');
  const addBtn = document.getElementById('add-btn');
  const orderList = document.getElementById('order-list');
  const exportBtn = document.getElementById('export-btn');

  let orders = [];

  function renderList() {
    orderList.innerHTML = '';
    orders.forEach((order, index) => {
      const li = document.createElement('li');
      li.textContent = order;
      const removeBtn = document.createElement('button');
      removeBtn.textContent = getMessage("removeBtn");
      removeBtn.style.marginLeft = '10px';
      removeBtn.onclick = () => {
        orders.splice(index, 1);
        renderList();
      };
      li.appendChild(removeBtn);
      orderList.appendChild(li);
    });
  }

  addBtn.addEventListener('click', () => {
    const order = orderInput.value.trim();
    if (order) {
      orders.push(order);
      orderInput.value = '';
      renderList();
    }
  });

  exportBtn.addEventListener('click', async () => {
    if (orders.length === 0) {
      alert('No orders to export');
      return;
    }

    const selectedTemplate = select.value;
    const templatePath = `templates/${selectedTemplate}.xlsx`;

    try {
      // 1. Fetch the template file
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${templatePath}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // 2. Parse the Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Assume we are working with the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 3. Prepare data
      // Get the header (first row) from the template
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const header = sheetData.length > 0 ? sheetData[0] : [];

      // Start with the header
      const newData = [header];

      // Load config and settings
      const settings = await chrome.storage.sync.get(null);
      const templateConfig = settings.templateConfig || {};
      const currentTemplateFields = templateConfig[selectedTemplate] || [];

      orders.forEach((order) => {
        // Create a new row. 
        // For now, we assume the Order Number goes to the first column (Column A).
        const newRow = [];
        newRow[0] = order;

        currentTemplateFields.forEach(field => {
          if (field.col && field.value !== undefined) {
            // Convert column letter to index (A -> 0, B -> 1, etc.)
            const colIndex = XLSX.utils.decode_col(field.col);
            newRow[colIndex] = field.value;
          }
        });
        
        newData.push(newRow);
      });

      // Create a new sheet from the new data
      const newSheet = XLSX.utils.aoa_to_sheet(newData);

      // Create a new workbook to avoid corruption issues with the original template's metadata
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, firstSheetName);

      // 4. Write the file
      const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });

      // 5. Download
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

      link.setAttribute("download", `export_${selectedTemplate}_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error(error);
      alert('Error exporting file: ' + error.message);
    }
  });
});