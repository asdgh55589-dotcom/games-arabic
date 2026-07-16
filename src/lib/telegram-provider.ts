/**
 * lib/telegram-provider.ts — Custom Telegram OAuth Provider.
 */
import type { Provider } from 'next-auth/providers/index'

export function TelegramProvider(): Provider {
  return {
    id: 'telegram',
    name: 'Telegram',
    type: 'oauth',
    version: '2.0',
    authorization: { url: '', params: {} },
    token: { async request() { return {} } },
    userinfo: { async request() { return {} } },
    profile(profile: any) {
      return {
        id: String(profile.id || Date.now()),
        name: profile.username || profile.first_name || 'Telegram User',
        email: `${profile.id || Date.now()}@telegram.com`,
        image: profile.photo_url || null,
        role: 'member',
      }
    },
  } as Provider
}
