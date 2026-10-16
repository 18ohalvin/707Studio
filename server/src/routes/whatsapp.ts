import { Router } from 'express';
import {
  initPageWhatsApp,
  getPageStatus,
  disconnectPageWhatsApp,
  sendBaileysMessage,
  normalizePhoneDigits
} from '../baileysManager.js';
import { formatWhatsAppDisplay, sendWhatsAppNotification } from '../queueHelpers.js';
import { getQueueSettings } from '../queueManager.js';

export const whatsappRouter = Router();

// GET /api/whatsapp/:pageId/status
whatsappRouter.get('/:pageId/status', async (req, res) => {
  const pageId = String(req.params.pageId || '');
  if (!pageId) return res.status(400).json({ success: false, error: 'pageId is required' });
  const status = getPageStatus(pageId);
  return res.json({ success: true, ...status });
});

// POST /api/whatsapp/:pageId/connect
whatsappRouter.post('/:pageId/connect', async (req, res) => {
  const pageId = String(req.params.pageId || '');
  const { expectedPhone } = req.body || {};
  if (!pageId) return res.status(400).json({ success: false, error: 'pageId is required' });
  const status = await initPageWhatsApp(pageId, { expectedPhone });
  return res.json({ success: true, ...status });
});

// POST /api/whatsapp/:pageId/disconnect
whatsappRouter.post('/:pageId/disconnect', async (req, res) => {
  const pageId = String(req.params.pageId || '');
  if (!pageId) return res.status(400).json({ success: false, error: 'pageId is required' });
  const result = await disconnectPageWhatsApp(pageId);
  return res.json(result);
});

// POST /api/whatsapp/:pageId/send-test
whatsappRouter.post('/:pageId/send-test', async (req, res) => {
  const pageId = String(req.params.pageId || '');
  const recipientPhone = req.body?.recipientPhone || req.body?.phone;
  const message = req.body?.message || req.body?.text;

  if (!recipientPhone) {
    return res.status(400).json({ success: false, error: 'recipientPhone is required' });
  }

  const cleanPhone = normalizePhoneDigits(recipientPhone);
  if (!cleanPhone || cleanPhone.length < 8) {
    return res.status(400).json({ success: false, error: `Invalid phone number format: "${recipientPhone}"` });
  }

  const messageText = message || '[707 Activation Hub] This is a test notification from your linked WhatsApp device!';

  const result = await sendBaileysMessage(pageId, cleanPhone, messageText);
  if (result.success) {
    await sendWhatsAppNotification(cleanPhone, messageText, { pageId, event: 'test_dispatch' });
    return res.json({
      success: true,
      message: `Test message sent successfully to +${cleanPhone}!`,
      formattedPhone: formatWhatsAppDisplay(cleanPhone),
      messageId: result.messageId
    });
  }

  // Fallback to gateway if configured
  const settings = await getQueueSettings(pageId);
  if (settings?.waConnection?.gatewayUrl) {
    const gwResult = await sendWhatsAppNotification(cleanPhone, messageText, {
      pageId,
      event: 'test_dispatch',
      gatewayUrl: settings.waConnection.gatewayUrl,
      apiToken: settings.waConnection.apiToken,
      provider: settings.waConnection.provider
    });
    if (gwResult) {
      return res.json({
        success: true,
        mode: 'gateway',
        message: `Test notification sent via Gateway to +${cleanPhone}!`,
        formattedPhone: formatWhatsAppDisplay(cleanPhone)
      });
    }
  }

  return res.status(400).json({
    success: false,
    error: result.error || 'WhatsApp device is not linked or not currently connected. Please link device via QR code first.',
    waUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`
  });
});

// POST /api/whatsapp/:pageId/send
whatsappRouter.post('/:pageId/send', async (req, res) => {
  const pageId = String(req.params.pageId || '');
  const recipientPhone = req.body?.recipientPhone || req.body?.phone;
  const message = req.body?.message || req.body?.text;

  if (!recipientPhone || !message) {
    return res.status(400).json({ success: false, error: 'recipientPhone and message are required' });
  }

  const cleanPhone = normalizePhoneDigits(recipientPhone);
  const result = await sendBaileysMessage(pageId, cleanPhone, message);
  if (result.success) {
    await sendWhatsAppNotification(cleanPhone, message, { pageId, event: 'api_dispatch' });
    return res.json(result);
  }

  return res.status(400).json(result);
});
