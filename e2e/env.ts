import { existsSync, readFileSync } from 'node:fs';

/** True when the server's Instacart key is configured (in the shell env or a non-empty `.env` entry). */
export function instacartConfigured() {
  if (process.env.INSTACART_API_KEY) {
    return true;
  }
  const dotenv = existsSync('.env') ? readFileSync('.env', 'utf8') : '';
  return /^[ \t]*INSTACART_API_KEY[ \t]*=[ \t]*\S/m.test(dotenv);
}
