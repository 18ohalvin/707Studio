import { describe, it, expect } from 'vitest';
import {
  generateWaLinkPayload,
  renderTemplate,
  sendWhatsAppNotification,
  getWaLogs,
  DEFAULT_QUEUE_SETTINGS
} from '../../server/src/queueHelpers.ts';

describe('WhatsApp Multi-Device Linking & Notifications', () => {
  it('generates a valid QR payload and pairing code for instant connection', () => {
    const session = generateWaLinkPayload('page-123', '+6281234567890');
    expect(session.qrString).toContain('2@707Studio,page-123');
    expect(session.pairingCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(session.expiresInSeconds).toBe(180);
    expect(session.generatedAt).toBeDefined();
  });

  it('renders dynamic variables inside WhatsApp notification templates', () => {
    const template = 'Hello {{name}}! Your queue number is #{{queue_number}} (Party: {{party_size}}). Access ID: {{access_id}}.';
    const rendered = renderTemplate(template, {
      name: 'Alex Tan',
      queue_number: 42,
      party_size: 2,
      access_id: 'STAN-8842'
    });

    expect(rendered).toBe('Hello Alex Tan! Your queue number is #42 (Party: 2). Access ID: STAN-8842.');
  });

  it('records outgoing notifications into recent audit log', async () => {
    const testPhone = '6281270701234';
    const testMessage = 'Welcome to 707 Studio VIP Event!';
    const ok = await sendWhatsAppNotification(testPhone, testMessage, {
      pageId: 'test-campaign-1',
      event: 'welcome'
    });

    expect(ok).toBe(true);

    const logs = getWaLogs('test-campaign-1');
    expect(logs.length).toBeGreaterThan(0);
    const latest = logs[0];
    expect(latest.phone).toBe(testPhone);
    expect(latest.text).toBe(testMessage);
    expect(latest.event).toBe('welcome');
    expect(latest.status).toBe('delivered');
  });

  it('has proper default queue settings with waConnection structure', () => {
    expect(DEFAULT_QUEUE_SETTINGS.waConnection).toBeDefined();
    expect(DEFAULT_QUEUE_SETTINGS.waConnection?.connected).toBe(false);
    expect(DEFAULT_QUEUE_SETTINGS.waConnection?.provider).toBe('linked_device');
  });
});
