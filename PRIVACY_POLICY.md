# Privacy Policy for EasyShipper

**Last Updated: December 17, 2025**

EasyShipper ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our browser extension collects, uses, and discloses your information.

## 1. Information Collection

### 1.1. User-Provided Information
We collect information that you voluntarily input into the extension, including:
*   Order details (Order Number, Phone Number, IOSS Tax ID).
*   Address information (Recipient Name, Address, City, Country, etc.).
*   Configuration settings (Azure OpenAI API keys, template preferences).

### 1.2. Automated Data Processing
*   **Address Parsing**: When you use the "Add Order" feature with an unformatted address, the text you provide is sent to the Azure OpenAI service endpoint that **you configure**. We do not own or control this endpoint; it is your own private resource.
*   **Excel Export**: The extension processes your data locally within your browser to generate Excel (`.xlsx`) files.

## 2. Information Usage

We use the information solely for the purpose of providing the extension's functionality:
*   To parse unstructured address text into structured data.
*   To generate shipping lists in Excel format based on your selected templates.
*   To save your user preferences and settings locally.

## 3. Data Storage and Security

*   **Local Storage**: All sensitive data, including your Azure OpenAI API Key and order history, is stored locally in your browser using the Chrome Storage API (`chrome.storage.sync` or `chrome.storage.local`).
*   **No External Servers**: Apart from the Azure OpenAI endpoint **you provide**, EasyShipper does not send your data to any external servers, analytics platforms, or third-party trackers. We do not have access to your data.

## 4. Third-Party Services

### 4.1. Azure OpenAI
The extension interacts with the Azure OpenAI API to perform address parsing.
*   This interaction only occurs when you explicitly click the "Add Order" button with address text present.
*   Your data is subject to Microsoft Azure's privacy policy and the terms of your specific Azure subscription.
*   We do not act as an intermediary for this data; the request is made directly from your browser to your Azure endpoint.

## 5. Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

## 6. Contact Us

If you have any questions about this Privacy Policy, please contact us at:
*   Email: iwilsonwu@gmail.com
*   GitHub: [https://github.com/wilsonwu/easyshipper](https://github.com/wilsonwu/easyshipper)
