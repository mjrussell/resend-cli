import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('resend-cli', () => {
  describe('--help', () => {
    it('should display help without requiring API key', () => {
      const result = execSync('npx tsx src/cli.ts --help', {
        encoding: 'utf-8',
        env: { ...process.env, RESEND_API_KEY: undefined },
      });
      expect(result).toContain('Resend email API CLI');
      expect(result).toContain('email');
      expect(result).toContain('domain');
    });
  });

  describe('--version', () => {
    it('should display version', () => {
      const result = execSync('npx tsx src/cli.ts --version', {
        encoding: 'utf-8',
      });
      expect(result.trim()).toBe('0.1.0');
    });
  });

  describe('email commands', () => {
    it('should show email subcommands in help', () => {
      const result = execSync('npx tsx src/cli.ts email --help', {
        encoding: 'utf-8',
        env: { ...process.env, RESEND_API_KEY: undefined },
      });
      expect(result).toContain('list');
      expect(result).toContain('get');
      expect(result).toContain('attachments');
      expect(result).toContain('attachment');
    });

    it('should require API key for list command', async () => {
      try {
        execSync('npx tsx src/cli.ts email list', {
          encoding: 'utf-8',
          env: { ...process.env, RESEND_API_KEY: '' },
          stdio: 'pipe',
        });
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        const execError = error as { stderr?: string; status?: number };
        expect(execError.stderr).toContain('RESEND_API_KEY');
        expect(execError.status).toBe(2);
      }
    });
  });

  describe('domain commands', () => {
    it('should show domain subcommands in help', () => {
      const result = execSync('npx tsx src/cli.ts domain --help', {
        encoding: 'utf-8',
        env: { ...process.env, RESEND_API_KEY: undefined },
      });
      expect(result).toContain('list');
      expect(result).toContain('get');
    });
  });
});
