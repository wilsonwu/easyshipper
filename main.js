document.addEventListener('DOMContentLoaded', async function() {
  await window.i18nHelper.init();
  const getMessage = (key) => window.i18nHelper.getMessage(key);

  document.getElementById('title').innerText = getMessage("popupTitle");
  document.getElementById('template-label').innerText = getMessage("templateLabel");
  document.getElementById('order-input').placeholder = getMessage("inputPlaceholder");
  document.getElementById('phone-input').placeholder = getMessage("phonePlaceholder");
  document.getElementById('ioss-input').placeholder = getMessage("iossPlaceholder");
  document.getElementById('address-input').placeholder = getMessage("addressPlaceholder");
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
      
      const option = document.createElement('option');
      option.value = id; // Value is the filename without extension
      option.innerText = id; // Use filename directly
      select.appendChild(option);
    });
  });

  const orderInput = document.getElementById('order-input');
  const phoneInput = document.getElementById('phone-input');
  const iossInput = document.getElementById('ioss-input');
  const addressInput = document.getElementById('address-input');
  const addBtn = document.getElementById('add-btn');
  const orderList = document.getElementById('order-list');
  const exportBtn = document.getElementById('export-btn');

  let orders = [];

  function renderList() {
    orderList.innerHTML = '';
    orders.forEach((order, index) => {
      const li = document.createElement('li');
      
      const detailsDiv = document.createElement('div');
      detailsDiv.style.flex = '1';
      
      const orderNumDiv = document.createElement('div');
      orderNumDiv.innerHTML = `<strong>${order.orderNumber}</strong>`;
      detailsDiv.appendChild(orderNumDiv);

      if (order.phoneNumber) {
          const phoneDiv = document.createElement('div');
          phoneDiv.textContent = `📞 ${order.phoneNumber}`;
          detailsDiv.appendChild(phoneDiv);
      }
      
      if (order.addressData && order.addressData.recipientName) {
          const nameDiv = document.createElement('div');
          nameDiv.textContent = `👤 ${order.addressData.recipientName}, ${order.addressData.recipientCountry || ''}`;
          detailsDiv.appendChild(nameDiv);
      }

      li.appendChild(detailsDiv);

      const removeBtn = document.createElement('button');
      removeBtn.textContent = getMessage("removeBtn");
      removeBtn.style.backgroundColor = '#dc3545'; // Danger color
      removeBtn.style.marginTop = '5px';
      removeBtn.style.padding = '5px 10px';
      removeBtn.style.fontSize = '12px';
      removeBtn.style.width = 'auto';
      removeBtn.style.alignSelf = 'flex-end';
      
      removeBtn.onclick = () => {
        orders.splice(index, 1);
        renderList();
      };
      li.appendChild(removeBtn);
      orderList.appendChild(li);
    });
  }

  async function parseAddress(address) {
    const items = await chrome.storage.sync.get(['azureEndpoint', 'azureApiKey', 'azureDeployment']);
    if (!items.azureEndpoint || !items.azureApiKey || !items.azureDeployment) {
      throw new Error("Azure settings are missing. Please go to Extension Options to configure them.");
    }

    const prompt = `Parse the following address into a JSON object with keys: recipientName, recipientCountry, recipientProvince, recipientCity, recipientZip, recipientAddress, recipientCurrency. If province/state is missing, infer it from the city/country. Infer the currency code (e.g. USD, GBP, EUR) based on the country. Address: ${address}`;

    const url = `${items.azureEndpoint}/openai/deployments/${items.azureDeployment}/chat/completions?api-version=2023-05-15`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': items.azureApiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant that parses addresses into JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure API Error Details:", errorText);
      throw new Error(`Azure API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Azure Response:", data);
    const content = data.choices[0].message.content;
    
    // Extract JSON from content if it contains other text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse JSON from Azure response");
    }
  }

  addBtn.addEventListener('click', async () => {
    const orderNumber = orderInput.value.trim();
    const phoneNumber = phoneInput.value.trim();
    const iossNumber = iossInput.value.trim();
    const rawAddress = addressInput.value.trim();

    if (orderNumber) {
      let addressData = {};
      
      if (rawAddress) {
        const originalBtnText = addBtn.innerText;
        addBtn.innerText = getMessage("parsing");
        addBtn.disabled = true;
        
        try {
          addressData = await parseAddress(rawAddress);
        } catch (error) {
          console.error("Address parsing error:", error);
          alert(getMessage("parseError") + "\n" + error.message);
          addBtn.innerText = originalBtnText;
          addBtn.disabled = false;
          return; // Stop adding if parsing fails
        }
        
        addBtn.innerText = originalBtnText;
        addBtn.disabled = false;
      }

      orders.push({ orderNumber, phoneNumber, iossNumber, rawAddress, addressData });
      orderInput.value = '';
      phoneInput.value = '';
      iossInput.value = '';
      addressInput.value = '';
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

      // Find columns indices
      let phoneColIndex = -1;
      let iossColIndex = -1;
      let nameColIndex = -1;
      let countryColIndex = -1;
      let provinceColIndex = -1;
      let cityColIndex = -1;
      let zipColIndex = -1;
      let addressColIndex = -1;
      let currencyColIndex = -1;
      let senderTaxColIndex = -1;

      if (header && header.length > 0) {
          phoneColIndex = header.findIndex(h => h && h.toString().trim() === "收件人电话");
          iossColIndex = header.findIndex(h => h && h.toString().trim() === "IOSS税号");
          nameColIndex = header.findIndex(h => h && h.toString().trim() === "收件人姓名");
          countryColIndex = header.findIndex(h => h && h.toString().trim() === "收件人国家");
          provinceColIndex = header.findIndex(h => h && h.toString().trim() === "收件人省/州");
          cityColIndex = header.findIndex(h => h && h.toString().trim() === "收件人城市");
          zipColIndex = header.findIndex(h => h && h.toString().trim() === "收件人邮编");
          addressColIndex = header.findIndex(h => h && h.toString().trim() === "收件人地址");
          currencyColIndex = header.findIndex(h => h && h.toString().trim() === "币种类型");
          senderTaxColIndex = header.findIndex(h => h && h.toString().trim() === "发件人税号信息");
      }

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
        newRow[0] = order.orderNumber;

        if (phoneColIndex !== -1) newRow[phoneColIndex] = order.phoneNumber;
        
        // Handle IOSS logic for UK
        let isUK = false;
        if (order.addressData && order.addressData.recipientCountry) {
            const country = order.addressData.recipientCountry.trim().toLowerCase();
            isUK = country === 'uk' || country === 'united kingdom' || country === 'great britain' || country === 'gb';
        }

        if (isUK) {
            if (senderTaxColIndex !== -1) newRow[senderTaxColIndex] = order.iossNumber;
        } else {
            if (iossColIndex !== -1) newRow[iossColIndex] = order.iossNumber;
        }
        
        if (order.addressData) {
            if (nameColIndex !== -1) newRow[nameColIndex] = order.addressData.recipientName;
            if (countryColIndex !== -1) newRow[countryColIndex] = order.addressData.recipientCountry;
            if (provinceColIndex !== -1) newRow[provinceColIndex] = order.addressData.recipientProvince;
            if (cityColIndex !== -1) newRow[cityColIndex] = order.addressData.recipientCity;
            if (zipColIndex !== -1) newRow[zipColIndex] = order.addressData.recipientZip;
            if (addressColIndex !== -1) newRow[addressColIndex] = order.addressData.recipientAddress;
            if (currencyColIndex !== -1) newRow[currencyColIndex] = order.addressData.recipientCurrency;
        }

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