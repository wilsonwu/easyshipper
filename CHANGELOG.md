# Changelog

All notable changes to the "EasyShipper" extension will be documented in this file.

## [1.3] - 2025-12-17

### Added

- **Platform Setting**: Added a new "Platform" option in the Settings page. Users can now select between "Etsy" and "None".
- **Conditional Logic**: The automatic tax ID filling feature for the "燕文小包" template is now restricted to when the "Etsy" platform is selected.

## [1.2] - 2025-12-17

### Added

- **Auto-fill Tax ID**: Implemented automatic tax ID filling for the "燕文小包" template when the IOSS field is empty.
  - **EU Countries**: Automatically fills `IM3720000224`.
  - **United Kingdom**: Automatically fills `370 6004 28`.

## [1.1] - 2025-12-16

### Changed

- **UI Overhaul**: Completely redesigned the extension popup and options page with a modern, card-based interface, improved typography, and better spacing.
- **UK Tax ID Logic**: Updated export logic for "燕文小包" template. For UK addresses, the IOSS number is now correctly placed in the "Sender Tax Info" (发件人税号信息) column instead of the standard IOSS column.

## [1.0] - 2025-12-16

### Added

- Initial Release.
- Features:
  - Side Panel layout.
  - Azure OpenAI integration for address parsing.
  - Excel template support.
  - Dynamic field mapping configuration.
  - Multi-language support (English/Chinese).
