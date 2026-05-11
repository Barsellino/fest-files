import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import bundledStrip from '../data/protocol.json'
import bundledBestLadiesShow from '../data/protocolBestLadiesShow.json'
import bundledStripBeginners from '../data/protocolStripBeginners.json'
import bundledStripMiddle from '../data/protocolStripMiddle.json'

function clone(obj) {
  return structuredClone(obj)
}

/** @typedef {'strip' | 'bls' | 'beginners' | 'middle'} BundledProtocolTab */

const BUNDLED_BY_TAB = {
  strip: bundledStrip,
  bls: bundledBestLadiesShow,
  beginners: bundledStripBeginners,
  middle: bundledStripMiddle,
}

/**
 * @param {unknown} p
 * @returns {boolean}
 */
function isValidProtocol(p) {
  if (!p || typeof p !== 'object') return false
  const o = /** @type {Record<string, unknown>} */ (p)
  return (
    o.tournament != null &&
    typeof o.tournament === 'object' &&
    Array.isArray(o.judges) &&
    Array.isArray(o.criteria) &&
    Array.isArray(o.participants) &&
    o.scores != null &&
    typeof o.scores === 'object'
  )
}

export const useProtocolStore = defineStore('protocol', () => {
  /** Поточна «вкладка» вбудованого моку — для скидання після API. */
  /** @type {import('vue').Ref<BundledProtocolTab>} */
  const activeBundledTab = ref('beginners')

  const data = ref(clone(bundledStripBeginners))

  const tournament = computed(() => data.value.tournament)
  const judges = computed(() => data.value.judges)
  const criteria = computed(() => data.value.criteria)
  const participants = computed(() => data.value.participants)
  const scores = computed(() => data.value.scores)

  /**
   * Підставити протокол після парсингу на бекенді / з файлу JSON.
   * @param {typeof bundledStrip} payload
   */
  function setFromParsed(payload) {
    if (!isValidProtocol(payload)) {
      throw new Error(
        'Невірний формат: потрібні поля tournament, judges, criteria, participants, scores',
      )
    }
    data.value = clone(payload)
  }

  /**
   * Перемкнути вбудований мок (Strip Skilled / Beginners / Middle / BLS).
   * @param {BundledProtocolTab} tab
   */
  function switchBundledTab(tab) {
    if (tab !== 'strip' && tab !== 'bls' && tab !== 'beginners' && tab !== 'middle')
      return
    activeBundledTab.value = tab
    data.value = clone(BUNDLED_BY_TAB[tab])
  }

  function resetToBundled() {
    data.value = clone(BUNDLED_BY_TAB[activeBundledTab.value])
  }

  function toJsonString(pretty = true) {
    return JSON.stringify(data.value, null, pretty ? 2 : undefined)
  }

  return {
    data,
    activeBundledTab,
    tournament,
    judges,
    criteria,
    participants,
    scores,
    setFromParsed,
    switchBundledTab,
    resetToBundled,
    toJsonString,
  }
})
