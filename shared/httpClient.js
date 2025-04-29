import fetch from "node-fetch";

/**
 * Appel HTTP avec retries
 * @param {string} url
 * @param {object} [options]
 * @param {number} retries
 */
export async function httpRequest(url, options = {}, retries = 2) {
	try {
		const res = await fetch(url, { timeout: 10_000, ...options });
		if (!res.ok) throw new Error(`HTTP ${res.status} – ${await res.text()}`);
		const text = await res.text();
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	} catch (err) {
		if (retries) return httpRequest(url, options, retries - 1);
		throw err;
	}
}
