import { describe, it, expect } from 'vitest';
import {
  generateWaLinkPayload,
  renderTemplate,
  sendWhatsAppNotification,
  getWaLogs,
  normalizeWhatsAppNumber,
  formatWhatsAppDisplay,
  extractPhoneNumber,
  DEFAULT_QUEUE_SETTINGS
} from '../../server/src/queueHelpers.ts';

describe('WhatsApp Multi-Device Linking & Notifications', () => {
  it('generates a valid QR payload and pairing code for instant connection', () => {
    const session = generateWaLinkPayload('page-123', '+6281234567890');
    expect(session.qrString).toContain('2@707Studio,page-123');
    expect(session.pairingCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(session.cleanPhone).toBe('6281234567890');
    expect(session.formattedDisplay).toBe('+62 812-3456-7890');
    expect(session.directLink).toBe('https://wa.me/6281234567890');
    expect(session.expiresInSeconds).toBe(180);
    expect(session.generatedAt).toBeDefined();
  });

  it('normalizes local Indonesian phone numbers and prevents wrong number issues', () => {
    // Leading zero format (08...)
    expect(normalizeWhatsAppNumber('081234567890')).toBe('6281234567890');
    // Spaced and dashed format
    expect(normalizeWhatsAppNumber('+62 812-3456-7890')).toBe('6281234567890');
    // Missing country code (812...)
    expect(normalizeWhatsAppNumber('81234567890')).toBe('6281234567890');
    // Singapore international format
    expect(normalizeWhatsAppNumber('+65 9123 4567')).toBe('6591234567');
  });

  it('formats clean WhatsApp numbers for international display', () => {
    expect(formatWhatsAppDisplay('6281234567890')).toBe('+62 812-3456-7890');
    expect(formatWhatsAppDisplay('081234567890')).toBe('+62 812-3456-7890');
  });

  it('reliably extracts phone number from any custom form field name', () => {
    expect(extractPhoneNumber({ 'WhatsApp Number': '081234567890' })).toBe('081234567890');
    expect(extractPhoneNumber({ 'Phone': '+6281234567890' })).toBe('+6281234567890');
    expect(extractPhoneNumber({ 'No. WhatsApp': '081234567890' })).toBe('081234567890');
    expect(extractPhoneNumber({ 'telepon': '081234567890' })).toBe('081234567890');
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

  it('records outgoing notifications into recent audit log with normalized numbers', async () => {
    const testPhone = '0812 7070 1234';
    const testMessage = 'Welcome to 707 Studio VIP Event!';
    const ok = await sendWhatsAppNotification(testPhone, testMessage, {
      pageId: 'test-campaign-1',
      event: 'welcome'
    });

    expect(ok).toBe(true);

    const logs = getWaLogs('test-campaign-1');
    expect(logs.length).toBeGreaterThan(0);
    const latest = logs[0];
    expect(latest.phone).toBe('6281270701234');
    expect(latest.text).toBe(testMessage);
    expect(latest.event).toBe('welcome');
    expect(latest.status).toBe('delivered');
  });

  it('has proper default queue settings with waConnection structure', () => {
    expect(DEFAULT_QUEUE_SETTINGS.waConnection).toBeDefined();
    expect(DEFAULT_QUEUE_SETTINGS.waConnection?.connected).toBe(false);
    expect(DEFAULT_QUEUE_SETTINGS.waConnection?.provider).toBe('direct_sender');
  });

  it('includes dynamic {{link}} in default expired WhatsApp template', () => {
    expect(DEFAULT_QUEUE_SETTINGS.waTemplates.expired).toContain('{{link}}');
    expect(DEFAULT_QUEUE_SETTINGS.waTemplates.expired).toContain('{{queue_number}}');
  });

  it('renders guest e-pass link in expired template with code parameter', () => {
    const expiredTemplate = DEFAULT_QUEUE_SETTINGS.waTemplates.expired;
    const passUrl = 'https://707.studio/nike/air-max-day?code=STAN-8842';
    const rendered = renderTemplate(expiredTemplate, {
      name: 'Maya Lin',
      queue_number: 14,
      link: passUrl,
      requeue_link: passUrl,
      epass_link: passUrl,
      pass_url: passUrl
    });

    expect(rendered).toContain('Maya Lin');
    expect(rendered).toContain('#14');
    expect(rendered).toContain('https://707.studio/nike/air-max-day?code=STAN-8842');
  });
});
