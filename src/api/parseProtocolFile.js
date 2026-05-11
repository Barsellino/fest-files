/**
 * Надсилає файл (PDF/JSON тощо) на ваш бекенд, який парсить і повертає JSON
 * у форматі `protocol.json` (tournament + judges + criteria + participants + scores).
 *
 * **Безпека:** справжній секретний ключ не варто класти в `VITE_*` — він потрапить у
 * клієнтський бандл. Надійно: бекенд читає ключ зі свого `.env`, фронт лише викликає
 * `/api/parse` без ключа або з сесійною cookie. Поле `apiKey` нижче — для локальних
 * тестів / внутрішніх інструментів.
 *
 * @param {object} opts
 * @param {File} opts.file
 * @param {string} [opts.endpoint] — повна URL; інакше `import.meta.env.VITE_PROTOCOL_PARSE_URL`
 * @param {string} [opts.apiKey] — інакше `import.meta.env.VITE_PROTOCOL_PARSE_API_KEY`
 * @returns {Promise<import('../data/protocol.json')>}
 */
export async function parseProtocolFile({ file, endpoint, apiKey }) {
  const url =
    endpoint?.trim() ||
    (typeof import.meta.env.VITE_PROTOCOL_PARSE_URL === 'string'
      ? import.meta.env.VITE_PROTOCOL_PARSE_URL.trim()
      : '')
  if (!url) {
    throw new Error(
      'Не задано URL: вкажіть endpoint або змінну середовища VITE_PROTOCOL_PARSE_URL',
    )
  }

  const body = new FormData()
  body.append('file', file)

  const headers = {}
  const key =
    apiKey?.trim() ||
    (typeof import.meta.env.VITE_PROTOCOL_PARSE_API_KEY === 'string'
      ? import.meta.env.VITE_PROTOCOL_PARSE_API_KEY.trim()
      : '')
  if (key) {
    headers.Authorization = `Bearer ${key}`
  }

  const timeoutMs = Number(
    typeof import.meta.env.VITE_PROTOCOL_PARSE_TIMEOUT_MS === 'string'
      ? import.meta.env.VITE_PROTOCOL_PARSE_TIMEOUT_MS.trim()
      : '',
  )
  const ms = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 240_000

  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      body,
      headers,
      signal: ac.signal,
    })
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        `Час очікування відповіді (${Math.round(ms / 1000)} с) вичерпано. PDF через OpenAI може обробляти 1–2 хв; спробуйте ще раз або зменшіть файл.`,
      )
    }
    throw e
  } finally {
    clearTimeout(t)
  }

  const text = await res.text()
  if (!res.ok) {
    let msg = text || `Помилка ${res.status}`
    try {
      const j = JSON.parse(text)
      if (j && typeof j.error === 'string') msg = j.error
    } catch {
      /* не JSON */
    }
    throw new Error(msg)
  }

  try {
    return /** @type {import('../data/protocol.json')} */ (JSON.parse(text))
  } catch {
    throw new Error('Відповідь не JSON — перевірте бекенд')
  }
}
