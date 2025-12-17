# EasyShipper

EasyShipper is a browser extension designed specifically for cross-border e-commerce sellers to streamline the shipping order creation process. It intelligently parses addresses, manages order data, and exports Excel files tailored to logistics providers' requirements with a single click.

The current version is deeply optimized for the **Etsy** platform and the **Yanwen Express (燕文小包)** logistics template.

## Key Features

*   **Smart Address Parsing**: Integrated with Azure OpenAI to intelligently parse unstructured address text into structured data (Name, Street, City, State/Province, Zip Code, Country).
*   **Multi-Template Support**: Supports custom Excel (`.xlsx`) templates. Currently, it has built-in perfect support for the **Yanwen Express** template.
*   **Etsy Platform Optimization**:
    *   For Etsy orders, it supports automatically filling in the corresponding platform tax ID (IOSS/VAT) based on the recipient's country (UK or EU).
    *   **United Kingdom (UK)**: Automatically fills tax ID `370 6004 28` into the "Sender Tax Info" (发件人税号信息) column.
    *   **European Union (EU)**: Automatically fills tax ID `IM3720000224` into the "IOSS Tax ID" (IOSS税号) column.
*   **Dynamic Field Mapping**: You can configure fixed column values for different templates in the settings page (e.g., default filling "Item Name", "Declared Value", etc.).
*   **One-Click Export**: After batch entering orders, generate and download the filled Excel file with one click.
*   **Multi-Language Support**: Supports Simplified Chinese and English interfaces.

## Installation

1.  Download the zip package of this extension or clone the code repository.
2.  Open Chrome or Edge browser and navigate to the extensions management page (`chrome://extensions`).
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the folder containing this extension's files.

## Configuration Guide

### 1. Azure OpenAI Setup (Required for Address Parsing)

To use the AI address parsing feature, you need to configure the Azure OpenAI service.

1.  Right-click on the extension icon and select **Options**, or click the settings button in the extension interface.
2.  Fill in the **Azure OpenAI Settings** section:
    *   **Endpoint**: Your Azure OpenAI resource endpoint (e.g., `https://your-resource.openai.azure.com/`).
    *   **API Key**: Your API key.
    *   **Deployment Name**: The name of the deployed model (recommended to use `gpt-35-turbo` or higher).
3.  Click **Save**.

### 2. Platform Settings

In the **General Settings** on the settings page, you can select the current e-commerce platform you are operating on:
*   **Etsy**: Enables the automatic tax ID filling feature specifically for Etsy.
*   **None**: Disables platform-specific automation logic.

### 3. Template & Field Configuration

The extension reads Excel files from the `templates/` directory by default.
*   **Yanwen Express (燕文小包)**: The extension has built-in special logic support for this template (such as special handling for the UK tax ID column).
*   **Custom Columns**: At the bottom of the settings page, you can add fixed value fields for the selected template. For example, you can set "Column B" to automatically fill in "Gift".

## Usage

1.  Click the browser side panel or the extension icon to open EasyShipper.
2.  **Select Template**: Choose `燕文小包` (Yanwen Express) or another template from the dropdown menu.
3.  **Enter Order**:
    *   **Order Number**: Required.
    *   **Phone Number**: Optional.
    *   **IOSS Tax ID**: Optional. If left empty and the platform is set to Etsy, the extension will automatically fill in the tax ID based on the country.
    *   **Address Info**: Paste the complete recipient address text.
4.  **Add Order**:
    *   Click **Add Order**. The extension will automatically call AI to parse the address.
    *   After successful parsing, the order will be displayed in the list below.
5.  **Export**: Click the **Export to Excel** button at the bottom to download the generated shipping list.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed change logs.
