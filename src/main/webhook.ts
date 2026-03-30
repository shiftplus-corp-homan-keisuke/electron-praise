import http from 'http';
import https from 'https';
import { URL } from 'url';
import type { PraiseEvent, PraisePreferences } from '../shared/praise';

export class WebhookManager {
  async send(event: PraiseEvent, settings: PraisePreferences): Promise<void> {
    const url = settings.webhook.url.trim();

    if (url.length === 0) {
      return;
    }

    try {
      const parsedUrl = new URL(url);
      const payload = JSON.stringify({
        message: event.message,
        app_name: 'はちわれぷらいず',
      });

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const transport = parsedUrl.protocol === 'https:' ? https : http;

      await new Promise<void>((resolve) => {
        const req = transport.request(options, (res) => {
          console.info(`[Webhook] response: ${res.statusCode}`);
          res.resume();
          resolve();
        });

        req.on('error', (error) => {
          console.error('[Webhook] request failed:', error);
          resolve();
        });

        req.write(payload);
        req.end();
      });
    } catch (error) {
      console.error('[Webhook] request failed:', error);
    }
  }
}
