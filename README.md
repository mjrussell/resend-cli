# resend-cli

[![CI](https://github.com/mjrussell/resend-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/mjrussell/resend-cli/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@mjrussell/resend-cli.svg)](https://www.npmjs.com/package/@mjrussell/resend-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Unofficial CLI for Resend** — Not affiliated with or endorsed by Resend.

A command-line interface for the [Resend email API](https://resend.com) for managing **received (inbound) emails** and attachments.

## Features

- List and view received emails
- View email attachments
- JSON output for scripting
- Simple environment-based configuration

## Installation

### From npm (recommended)

```bash
npm install -g @mjrussell/resend-cli
```

### From source

```bash
git clone https://github.com/mjrussell/resend-cli.git
cd resend-cli
npm install
npm run build
npm install -g .
```

## Configuration

Set your Resend API key as an environment variable:

```bash
export RESEND_API_KEY="re_your_api_key_here"
```

### Getting an API Key

1. Sign up at [resend.com](https://resend.com)
2. Set up inbound email routing for your domain
3. Go to API Keys → Create API key (needs read permissions)
4. Store securely (e.g., in your shell profile or a secrets manager)

## Quick Start

```bash
# List received emails
resend email list

# Get details for a specific email
resend email get <email_id>

# List attachments for an email
resend email attachments <email_id>

# JSON output for scripting
resend email list --json | jq '.data.data[0]'
```

## Commands

### `resend email list [options]`

List received (inbound) emails (default: 10 most recent).

| Option | Description |
|--------|-------------|
| `-j, --json` | Output as JSON |
| `-l, --limit <n>` | Number of emails (default: 10) |

### `resend email get <id>`

Get details for a received email (from, to, subject, text, html).

| Option | Description |
|--------|-------------|
| `-j, --json` | Output as JSON |

### `resend email attachments <email_id>`

List all attachments for a received email.

| Option | Description |
|--------|-------------|
| `-j, --json` | Output as JSON |

### `resend email attachment <email_id> <attachment_id>`

Get metadata for a specific attachment.

| Option | Description |
|--------|-------------|
| `-j, --json` | Output as JSON |
| `-o, --output <path>` | Output path (metadata only) |

## Examples

```bash
# List 5 most recent emails
resend email list --limit 5

# Get the most recent email ID
EMAIL_ID=$(resend email list --json | jq -r '.data.data[0].id')

# Get email details
resend email get $EMAIL_ID

# Check attachment count
resend email attachments $EMAIL_ID --json | jq '.data.data | length'
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Your Resend API key | Yes |

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | API error or generic failure |
| `2` | Invalid usage or missing API key |

## Development

```bash
git clone https://github.com/mjrussell/resend-cli.git
cd resend-cli
npm install
npm run build      # Build the CLI
npm run dev        # Run with tsx (dev mode)
npm run watch      # Watch mode with tsup
npm run typecheck  # Type check without emitting
```

## Roadmap

- [ ] Send emails (`resend email send`)
- [ ] Domain management (`resend domain list`)
- [ ] Actual attachment file downloads
- [ ] Pagination support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © Matt Russell

## Disclaimer

This is an unofficial tool. Resend is a trademark of Resend Inc.
