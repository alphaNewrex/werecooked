import { existsSync, readFileSync } from 'node:fs';

/** True when the server's Instacart key is configured (in the shell env or a non-empty `.env` entry). */
export function instacartConfigured() {
  if (process.env.INSTACART_API_KEY) {
    return true;
  }
  const dotenv = existsSync('.env') ? readFileSync('.env', 'utf8') : '';
  return /^[ \t]*INSTACART_API_KEY[ \t]*=[ \t]*\S/m.test(dotenv);
}

/** True when both Kroger client credentials are configured in the shell or `.env`. */
export function krogerConfigured() {
  if (process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET) {
    return true;
  }
  const dotenv = existsSync('.env') ? readFileSync('.env', 'utf8') : '';
  return (
    /^[ \t]*KROGER_CLIENT_ID[ \t]*=[ \t]*\S/m.test(dotenv) &&
    /^[ \t]*KROGER_CLIENT_SECRET[ \t]*=[ \t]*\S/m.test(dotenv)
  );
}
