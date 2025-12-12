# EasyShipper (易发货)

EasyShipper is a browser extension designed to streamline the process of creating shipping order lists. It allows you to input order details, parse unformatted addresses using AI, and export the data into pre-defined Excel templates.

## Features

*   **Excel Template Support**: Works with your custom Excel (`.xlsx`) templates.
*   **AI Address Parsing**: Uses Azure OpenAI to intelligently parse unformatted address blocks into structured data (Name, Street, City, State, Zip, Country).
*   **Currency Inference**: Automatically infers the currency (e.g., 美元, 欧元) based on the destination country.
*   **Data Entry**: Easily input Order Numbers, Phone Numbers, and IOSS Tax IDs.
*   **One-Click Export**: Generate and download the filled Excel file instantly.
*   **Multi-language Support**: English and Simplified Chinese.

## Installation

1.  Clone or download this repository.
2.  Open your browser (Chrome or Edge) and navigate to `chrome://extensions`.
3.  Enable **Developer mode** (usually a toggle in the top right).
4.  Click **Load unpacked**.
5.  Select the folder containing this extension.

## Configuration

### 1. Azure OpenAI Setup (Required for Address Parsing)

To use the AI address parsing feature, you need access to an Azure OpenAI endpoint.

1.  Right-click the EasyShipper extension icon and select **Options**.
2.  Under **Azure OpenAI Settings**, enter your:
    *   **Endpoint**: Your Azure OpenAI resource endpoint (e.g., `https://your-resource.openai.azure.com/`).
    *   **API Key**: Your Azure OpenAI API key.
    *   **Deployment Name**: The name of your deployed model (e.g., `gpt-35-turbo` or `gpt-4`).
3.  Click **Save**.

### 2. Template Setup

1.  Place your Excel template files (`.xlsx`) in the `templates/` folder inside the extension directory.
2.  Ensure your template has a header row (usually the first row).
3.  The extension looks for specific column names to map the data. Ensure your template uses the following column headers (in Chinese):

    *   `收件人电话` (Recipient Phone)
    *   `IOSS税号` (IOSS Tax ID)
    *   `收件人姓名` (Recipient Name)
    *   `收件人国家` (Recipient Country)
    *   `收件人省/州` (Recipient Province/State)
    *   `收件人城市` (Recipient City)
    *   `收件人邮编` (Recipient Zip Code)
    *   `收件人地址` (Recipient Address)
    *   `币种类型` (Currency Type)

    *Note: The Order Number is currently placed in the first column (Column A) by default.*

## Usage

1.  Click the EasyShipper icon to open the popup.
2.  **Select Template**: Choose a template from the dropdown list.
3.  **Enter Details**:
    *   **Order Number**: (Required)
    *   **Phone Number**: (Optional)
    *   **IOSS Tax ID**: (Optional)
    *   **Unformatted Address**: Paste the full address block here.
4.  **Add Order**:
    *   If you entered an address, the button will show "Parsing...". The extension will use AI to extract the details.
    *   Once parsed, the order is added to the list below.
5.  **Export**: Click the **Export** button to download the Excel file with all added orders.
