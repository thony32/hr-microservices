import fetch from "node-fetch"

export async function httpRequest(url, options = {}, retries = 2) {
    try {
        const res = await fetch(url, { timeout: 10_000, ...options })
        if (!res.ok) throw new Error(`HTTP ${res.status} – ${await res.text()}`)
        const txt = await res.text()
        try {
            return JSON.parse(txt)
        } catch {
            return txt
        }
    } catch (err) {
        if (retries) return httpRequest(url, options, retries - 1)
        throw err
    }
}
