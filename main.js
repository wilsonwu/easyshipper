console.log('This is a popup!');

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('title').innerText = chrome.i18n.getMessage("popupTitle");
  document.getElementById('template-label').innerText = chrome.i18n.getMessage("templateLabel");
  document.getElementById('order-input').placeholder = chrome.i18n.getMessage("inputPlaceholder");
  document.getElementById('add-btn').innerText = chrome.i18n.getMessage("addBtn");
  document.getElementById('export-btn').innerText = chrome.i18n.getMessage("exportBtn");
  document.getElementById('list-header').innerText = chrome.i18n.getMessage("listHeader");

  const templates = [
    { id: 'yanwen_xiaobao', nameKey: 'templateYanwenXiaobao' }
  ];

  const select = document.getElementById('template-select');
  templates.forEach(tpl => {
    const option = document.createElement('option');
    option.value = tpl.id;
    option.innerText = chrome.i18n.getMessage(tpl.nameKey);
    select.appendChild(option);
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
      removeBtn.textContent = chrome.i18n.getMessage("removeBtn");
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

      orders.forEach((order) => {
        // Create a new row. 
        // For now, we assume the Order Number goes to the first column (Column A).
        const newRow = [order]; 
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