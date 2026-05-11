/** @typedef {{ id: string, name: string }} ParticipantMeta */

import protocolData from './protocol.json'

/** Серіалізувати довільний об'єкт протоколу. */
export function getProtocolJson(data, pretty = true) {
  return JSON.stringify(data, null, pretty ? 2 : undefined)
}

/** Парсинг рядка JSON. */
export function parseProtocolJson(jsonString) {
  return /** @type {typeof protocolData} */ (JSON.parse(jsonString))
}

/** Округлення підсумку до сотих. */
export function roundToHundredths(value) {
  return Math.round(value * 100) / 100
}

/**
 * Зведені рядки: місце, ім'я, сума балів лише за обраними суддями та критеріями ÷ кількість обраних суддів.
 * @param {Record<string, Record<string, Record<string, number>>>} nested
 * @param {string[]} judgeIds
 * @param {string[]} criterionIds
 * @param {readonly { id: string, name: string }[]} participants
 * @param {readonly { id: string, label: string }[]} criteria
 */
export function buildTableRows(
  nested,
  judgeIds,
  criterionIds,
  participants,
  criteria,
) {
  const jIds = Array.isArray(judgeIds) ? [...judgeIds] : []
  const cIds = Array.isArray(criterionIds) ? [...criterionIds] : []

  const rows = participants.map((p) => {
    if (jIds.length === 0 || cIds.length === 0) {
      return {
        participantId: p.id,
        participantName: p.name,
        sumOverJudges: 0,
      }
    }

    let total = 0
    for (const jId of jIds) {
      const byJudge = nested[p.id]?.[jId]
      if (!byJudge) continue
      for (const c of criteria) {
        if (!cIds.includes(c.id)) continue
        total += byJudge[c.id]
      }
    }
    /** @type {{ participantId: string, participantName: string, sumOverJudges: number, rank?: number }} */
    const row = {
      participantId: p.id,
      participantName: p.name,
      sumOverJudges: roundToHundredths(total / jIds.length),
    }
    return row
  })

  const sorted = [...rows].sort((a, b) => b.sumOverJudges - a.sumOverJudges)
  let prev = null
  let rank = 0
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i].sumOverJudges
    if (s !== prev) {
      rank = i + 1
      prev = s
    }
    sorted[i].rank = rank
  }

  return [...rows].sort(
    (a, b) =>
      a.rank - b.rank ||
      a.participantName.localeCompare(b.participantName, 'uk'),
  )
}
