# Changelog

## [0.3.0] - 2026-01-11

### Changed
- **BREAKING:** All commands now work with **received (inbound) emails**, not sent emails
  - `resend email list` - List received emails (uses `resend.emails.receiving.list()`)
  - `resend email get` - Get received email details (uses `resend.emails.receiving.get()`)
  - `resend email attachments` - List attachments from received emails (uses `resend.emails.receiving.attachments.list()`)
  - `resend email attachment` - Get attachment metadata from received emails (uses `resend.emails.receiving.attachments.get()`)
- Updated all command descriptions to clarify "(inbound)" functionality
- Upgraded resend SDK from v4.8.0 to v6.7.0 (required for `list()` method)

## [0.2.0] - 2026-01-11

### Added
- **List emails**: `resend email list` - List emails (default: 10 most recent)
  - `--limit <n>` option to control number of results
  - `--json` output flag
- **Attachment support**: List and retrieve attachment metadata
  - `resend email attachments <email_id>` - List all attachments for an email
  - `resend email attachment <email_id> <attachment_id>` - Get specific attachment metadata
- Both attachment commands support `--json` output flag
- Lazy initialization of Resend client to allow `--help` without API key

### Changed
- Refactored to use lazy client initialization
- Fixed tsup config to avoid duplicate shebang in build output
- Fixed list command response parsing for nested data structure

## [0.1.0] - 2026-01-10

### Added
- Initial release with `resend email get <id>` command
- Retrieve email details (from, to, subject, text, html, timestamps)
