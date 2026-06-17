import { logger } from "./logger";

const DEFAULT_INTERVAL_MS = 10 * 60 * 1000;

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function startKeepAlive() {
  if (process.env.KEEP_ALIVE_ENABLED !== "true") {
    return;
  }

  const baseUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;
  if (!baseUrl) {
    logger.warn("Keep-alive is enabled, but KEEP_ALIVE_URL or RENDER_EXTERNAL_URL is not configured");
    return;
  }

  const intervalMs = Number(process.env.KEEP_ALIVE_INTERVAL_MS || DEFAULT_INTERVAL_MS);
  if (Number.isNaN(intervalMs) || intervalMs < 60_000) {
    logger.warn({ intervalMs }, "Keep-alive interval is invalid; using default interval");
  }

  const target = `${normalizeBaseUrl(baseUrl)}/api/healthz`;
  const safeIntervalMs = Number.isNaN(intervalMs) || intervalMs < 60_000 ? DEFAULT_INTERVAL_MS : intervalMs;

  const ping = async () => {
    try {
      const response = await fetch(target, { method: "GET" });
      logger.info({ status: response.status }, "Keep-alive ping completed");
    } catch (err) {
      logger.warn({ err }, "Keep-alive ping failed");
    }
  };

  setTimeout(ping, 30_000);
  setInterval(ping, safeIntervalMs);
  logger.info({ target, intervalMs: safeIntervalMs }, "Keep-alive started");
}
