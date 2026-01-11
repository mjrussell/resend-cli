import { Command } from 'commander';
import { Resend } from 'resend';
import * as path from 'path';

// Types for Resend API responses
interface ReceivedEmail {
  id: string;
  from: string;
  to: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  created_at: string;
}

interface EmailListResponse {
  object: string;
  has_more: boolean;
  data: ReceivedEmail[];
}

interface Attachment {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  content_disposition?: string;
  content_id?: string;
}

interface AttachmentListResponse {
  object: string;
  data: Attachment[];
}

interface Domain {
  id: string;
  name: string;
  status: string;
  region: string;
  created_at: string;
  default?: boolean;
  records?: Array<{ record: string; value: string }>;
}

interface DomainListResponse {
  data: Domain[];
}

const program = new Command()
  .name('resend')
  .description('Resend email API CLI')
  .version('0.1.0');

// Initialize Resend client (will check API key when actually making requests)
let resend: Resend;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('Error: RESEND_API_KEY environment variable is required');
      process.exit(2);
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}

const emailCmd = program
  .command('email')
  .description('Manage received emails (inbound)');

const domainCmd = program
  .command('domain')
  .description('Manage domains');

emailCmd
  .command('list')
  .description('List received emails (inbound)')
  .option('-j, --json', 'JSON output')
  .option('-l, --limit <number>', 'Number of emails to retrieve (default: 10)', '10')
  .action(async (options: { json?: boolean; limit?: string }) => {
    try {
      const client = getResendClient();
      const limit = parseInt(options.limit || '10', 10);
      const result = await client.emails.receiving.list({ limit });
      if (!result.data) {
        console.error('No email data returned');
        process.exit(1);
      }
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const listData = result.data as EmailListResponse;
        const emails = listData.data || [];
        if (emails.length === 0) {
          console.log('No received emails found');
        } else {
          console.log(`Found ${emails.length} received email(s):\n`);
          emails.forEach((email: ReceivedEmail) => {
            console.log(`ID: ${email.id}`);
            console.log(`From: ${email.from}`);
            console.log(`To: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`);
            console.log(`Subject: ${email.subject || '(no subject)'}`);
            console.log(`Created: ${email.created_at}`);
            console.log('---');
          });
          if (listData.has_more) {
            console.log('\n(More emails available - use pagination)');
          }
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

emailCmd
  .command('get')
  .description('Get received email details (inbound)')
  .argument('<id>', 'Email ID')
  .option('-j, --json', 'JSON output')
  .action(async (id: string, options: { json?: boolean }) => {
    try {
      const client = getResendClient();
      const result = await client.emails.receiving.get(id);
      if (!result.data) {
        console.error('No email data returned');
        process.exit(1);
      }
      const email = result.data as ReceivedEmail;
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`ID: ${email.id}`);
        console.log(`From: ${email.from}`);
        console.log(`To: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`);
        console.log(`Subject: ${email.subject || '(no subject)'}`);
        console.log(`Text: ${email.text || 'N/A'}`);
        console.log(`HTML: ${email.html ? email.html.substring(0, 200) + '...' : 'N/A'}`);
        console.log(`Created: ${email.created_at}`);
      }
    } catch (error) {
      handleError(error);
    }
  });

emailCmd
  .command('attachments')
  .description('List attachments for a received email (inbound)')
  .argument('<email_id>', 'Email ID')
  .option('-j, --json', 'JSON output')
  .action(async (emailId: string, options: { json?: boolean }) => {
    try {
      const client = getResendClient();
      const result = await client.emails.receiving.attachments.list({ emailId });
      if (!result.data) {
        console.error('No attachment data returned');
        process.exit(1);
      }
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const listData = result.data as AttachmentListResponse | Attachment[];
        const attachments = Array.isArray(listData) ? listData : listData.data;
        if (!Array.isArray(attachments) || attachments.length === 0) {
          console.log('No attachments found');
        } else {
          console.log(`Found ${attachments.length} attachment(s):\n`);
          attachments.forEach((att: Attachment) => {
            console.log(`ID: ${att.id}`);
            console.log(`Filename: ${att.filename}`);
            console.log(`Size: ${att.size} bytes`);
            console.log(`Content-Type: ${att.content_type}`);
            console.log('---');
          });
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

emailCmd
  .command('attachment')
  .description('Get a specific attachment from a received email (inbound)')
  .argument('<email_id>', 'Email ID')
  .argument('<attachment_id>', 'Attachment ID')
  .option('-j, --json', 'JSON output')
  .option('-o, --output <path>', 'Download attachment to file')
  .action(async (emailId: string, attachmentId: string, options: { json?: boolean; output?: string }) => {
    try {
      const client = getResendClient();
      const result = await client.emails.receiving.attachments.get({ emailId, id: attachmentId });
      if (!result.data) {
        console.error('No attachment data returned');
        process.exit(1);
      }
      const attachment = result.data as Attachment;

      if (options.output) {
        const outputPath = path.resolve(options.output);
        console.log(`Attachment metadata for ${attachment.filename}:`);
        console.log(`  Size: ${attachment.size} bytes`);
        console.log(`  Type: ${attachment.content_type}`);
        console.log(`  Content-ID: ${attachment.content_id}`);
        console.log(`\nNote: To download the actual file, use the content_id with the Resend API`);
      } else if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`ID: ${attachment.id}`);
        console.log(`Filename: ${attachment.filename}`);
        console.log(`Size: ${attachment.size} bytes`);
        console.log(`Content-Type: ${attachment.content_type}`);
        console.log(`Content-Disposition: ${attachment.content_disposition || 'N/A'}`);
        console.log(`Content-ID: ${attachment.content_id || 'N/A'}`);
      }
    } catch (error) {
      handleError(error);
    }
  });

domainCmd
  .command('list')
  .description('List domains')
  .option('-j, --json', 'JSON output')
  .action(async (options: { json?: boolean }) => {
    try {
      const client = getResendClient();
      const result = await client.domains.list();
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const listData = result.data as DomainListResponse | Domain[];
        const domains = Array.isArray(listData) ? listData : listData.data || [];
        if (domains.length === 0) {
          console.log('No domains found');
        } else {
          console.log(`Found ${domains.length} domain(s):\n`);
          domains.forEach((domain: Domain) => {
            console.log(`Name: ${domain.name}`);
            console.log(`Status: ${domain.status}`);
            console.log(`Region: ${domain.region}`);
            console.log(`Created: ${domain.created_at}`);
            console.log('---');
          });
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

domainCmd
  .command('get')
  .description('Get domain details')
  .argument('<id>', 'Domain ID')
  .option('-j, --json', 'JSON output')
  .action(async (domainId: string, options: { json?: boolean }) => {
    try {
      const client = getResendClient();
      const result = await client.domains.get(domainId);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const domain = result.data as Domain;
        if (!domain) {
          console.error('No domain data returned');
          process.exit(1);
        }
        console.log(`Name: ${domain.name}`);
        console.log(`Status: ${domain.status}`);
        console.log(`Region: ${domain.region}`);
        console.log(`Created: ${domain.created_at}`);
        console.log(`Default: ${domain.default ?? 'N/A'}`);
        if (domain.records && domain.records.length > 0) {
          console.log('\nDNS Records:');
          domain.records.forEach((record) => {
            console.log(`  ${record.record}: ${record.value}`);
          });
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
