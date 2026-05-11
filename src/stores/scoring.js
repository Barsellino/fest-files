import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { buildTableRows } from '../data/mockScores.js'
import { useProtocolStore } from './protocol.js'

export const useScoringStore = defineStore('scoring', () => {
  const protocol = useProtocolStore()

  const selectedJudgeIds = ref([])
  const selectedCriterionIds = ref([])

  function syncSelectionFromProtocol() {
    selectedJudgeIds.value = protocol.judges.map((j) => j.id)
    selectedCriterionIds.value = protocol.criteria.map((c) => c.id)
  }

  watch(
    [() => protocol.judges, () => protocol.criteria],
    () => {
      syncSelectionFromProtocol()
    },
    { deep: true, immediate: true },
  )

  const allJudgesSelected = computed(
    () =>
      protocol.judges.length > 0 &&
      protocol.judges.every((j) => selectedJudgeIds.value.includes(j.id)),
  )

  const allCriteriaSelected = computed(
    () =>
      protocol.criteria.length > 0 &&
      protocol.criteria.every((c) =>
        selectedCriterionIds.value.includes(c.id),
      ),
  )

  const tableRows = computed(() =>
    buildTableRows(
      protocol.scores,
      selectedJudgeIds.value,
      selectedCriterionIds.value,
      protocol.participants,
      protocol.criteria,
    ),
  )

  function setAllJudges(checked) {
    selectedJudgeIds.value =
      checked === true ? protocol.judges.map((j) => j.id) : []
  }

  function setAllCriteria(checked) {
    selectedCriterionIds.value =
      checked === true ? protocol.criteria.map((c) => c.id) : []
  }

  /**
   * @param {string} judgeId
   * @param {boolean | null | undefined} checked
   */
  function setJudgeSelected(judgeId, checked) {
    const cur = new Set(selectedJudgeIds.value)
    if (checked === true) {
      cur.add(judgeId)
      selectedJudgeIds.value = Array.from(cur)
      return
    }
    if (checked === false) {
      cur.delete(judgeId)
      selectedJudgeIds.value = Array.from(cur)
    }
  }

  /**
   * @param {string} criterionId
   * @param {boolean | null | undefined} checked
   */
  function setCriterionSelected(criterionId, checked) {
    const cur = new Set(selectedCriterionIds.value)
    if (checked === true) {
      cur.add(criterionId)
      selectedCriterionIds.value = Array.from(cur)
      return
    }
    if (checked === false) {
      cur.delete(criterionId)
      selectedCriterionIds.value = Array.from(cur)
    }
  }

  function isJudgeSelected(judgeId) {
    return selectedJudgeIds.value.includes(judgeId)
  }

  function isCriterionSelected(criterionId) {
    return selectedCriterionIds.value.includes(criterionId)
  }

  return {
    selectedJudgeIds,
    selectedCriterionIds,
    allJudgesSelected,
    allCriteriaSelected,
    tableRows,
    setAllJudges,
    setAllCriteria,
    setJudgeSelected,
    setCriterionSelected,
    isJudgeSelected,
    isCriterionSelected,
  }
})
