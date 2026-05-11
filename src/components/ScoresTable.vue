<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'
import { storeToRefs } from 'pinia'
import { useScoringStore } from '../stores/scoring.js'
import { useProtocolStore } from '../stores/protocol.js'

const scoring = useScoringStore()
const protocol = useProtocolStore()
const { judges, criteria } = storeToRefs(protocol)
const { tableRows, allJudgesSelected, allCriteriaSelected } =
  storeToRefs(scoring)

const isCompactTable = ref(false)

/** Нативні <details> — надійні на мобільних (PrimeVue Fieldset + transition часто глючить у Safari). */
const judgesDetails = ref(null)
const criteriaDetails = ref(null)

let mq
let removeMqListener

function syncDetailsToViewport() {
  if (!mq) return
  const narrow = mq.matches
  isCompactTable.value = narrow
  const openWide = !narrow
  if (judgesDetails.value) judgesDetails.value.open = openWide
  if (criteriaDetails.value) criteriaDetails.value.open = openWide
}

onMounted(() => {
  mq = window.matchMedia('(max-width: 640px)')

  const onMqChange = () => {
    void nextTick(syncDetailsToViewport)
  }

  void nextTick(syncDetailsToViewport)

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onMqChange)
    removeMqListener = () => mq.removeEventListener('change', onMqChange)
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onMqChange)
    removeMqListener = () => mq.removeListener(onMqChange)
  }
})

onUnmounted(() => {
  removeMqListener?.()
})

function onJudgeCheck(judgeId, value) {
  if (value === true) scoring.setJudgeSelected(judgeId, true)
  else if (value === false) scoring.setJudgeSelected(judgeId, false)
}

function onCriterionCheck(criterionId, value) {
  if (value === true) scoring.setCriterionSelected(criterionId, true)
  else if (value === false) scoring.setCriterionSelected(criterionId, false)
}

function onSelectAllJudges(value) {
  if (value === true) scoring.setAllJudges(true)
  else if (value === false) scoring.setAllJudges(false)
}

function onSelectAllCriteria(value) {
  if (value === true) scoring.setAllCriteria(true)
  else if (value === false) scoring.setAllCriteria(false)
}
</script>

<template>
  <div class="scores-wrap">
    <div class="filters-grid">
      <details ref="judgesDetails" class="block-panel filter-details">
        <summary class="filter-details__summary">
          <span class="filter-details__chevron" aria-hidden="true" />
          <span class="filter-details__title">Судді в підсумку</span>
        </summary>
        <div class="filter-details__body">
          <p class="hint">
            Підсумок враховує лише позначених суддів і критерії з сусіднього блоку.
            Без суддів — усі бали в таблиці нулі.
          </p>
          <div class="select-all-row">
            <Checkbox
              input-id="judges-select-all"
              binary
              :model-value="allJudgesSelected"
              @update:model-value="onSelectAllJudges"
            />
            <label class="select-all-label" for="judges-select-all">Обрати всіх</label>
          </div>
          <ul class="check-list">
            <li v-for="j in judges" :key="j.id" class="check-row">
              <Checkbox
                :input-id="'judge-' + j.id"
                binary
                :model-value="scoring.isJudgeSelected(j.id)"
                @update:model-value="(v) => onJudgeCheck(j.id, v)"
              />
              <label class="row-label" :for="'judge-' + j.id">{{ j.name }}</label>
            </li>
          </ul>
        </div>
      </details>

      <details ref="criteriaDetails" class="block-panel filter-details">
        <summary class="filter-details__summary">
          <span class="filter-details__chevron" aria-hidden="true" />
          <span class="filter-details__title">Критерії в підсумку</span>
        </summary>
        <div class="filter-details__body">
          <p class="hint">
            Лише обрані критерії входять у суму. Якщо нічого не позначено — 0
            балів.
          </p>
          <div class="select-all-row">
            <Checkbox
              input-id="criteria-select-all"
              binary
              :model-value="allCriteriaSelected"
              @update:model-value="onSelectAllCriteria"
            />
            <label class="select-all-label" for="criteria-select-all">Обрати всіх</label>
          </div>
          <ul class="check-list">
            <li v-for="c in criteria" :key="c.id" class="check-row">
              <Checkbox
                :input-id="'criterion-' + c.id"
                binary
                :model-value="scoring.isCriterionSelected(c.id)"
                @update:model-value="(v) => onCriterionCheck(c.id, v)"
              />
              <label class="row-label" :for="'criterion-' + c.id">{{ c.label }}</label>
            </li>
          </ul>
        </div>
      </details>
    </div>

    <div class="table-shell">
      <DataTable
        :value="tableRows"
        sort-mode="multiple"
        removable-sort
        striped-rows
        :size="isCompactTable ? 'small' : undefined"
        class="scores-table"
      >
        <Column
          field="rank"
          header="Місце"
          sortable
          :style="{ width: isCompactTable ? '3.25rem' : '4.5rem' }"
        />
        <Column field="participantName" header="Учасник" sortable />
        <Column
          field="sumOverJudges"
          :header="isCompactTable ? 'Бал' : 'Бал ÷ судді'"
          sortable
        >
          <template #body="{ data }">
            <span class="score-cell">{{ data.sumOverJudges.toFixed(2) }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.scores-wrap {
  width: 100%;
}

.filters-grid {
  display: grid;
  gap: 0.375rem;
  margin-bottom: clamp(0.75rem, 2vw, 1.125rem);
}

@media (min-width: 640px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
    gap: 0.375rem 0.5rem;
  }
}

/* Нативні акордеони: без overflow:hidden (на iOS інколи різали клік по summary) */
.block-panel.filter-details {
  margin: 0;
  border-radius: 0.875rem;
  border: 1px solid rgba(45, 42, 85, 0.12);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.65) inset;
}

.filter-details__summary {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  list-style: none;
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  font-weight: 600;
  font-size: clamp(0.9rem, 2.2vw, 1rem);
  color: #2d2a55;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.filter-details__summary::-webkit-details-marker {
  display: none;
}

.filter-details__title {
  flex: 1;
  text-align: left;
}

.filter-details__chevron {
  flex-shrink: 0;
  display: inline-block;
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.05rem;
  border-right: 2px solid #6366f1;
  border-bottom: 2px solid #6366f1;
  transform: rotate(45deg);
  transition: transform 0.18s ease;
}

.filter-details[open] .filter-details__chevron {
  transform: rotate(225deg);
  margin-top: 0.2rem;
}

.filter-details__body {
  padding: 0.125rem 0.85rem 0.65rem;
}

.hint {
  margin: 0 0 0.5rem;
  font-size: clamp(0.8125rem, 2vw, 0.875rem);
  line-height: 1.45;
  color: #5c5870;
}

.select-all-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.5rem;
  padding: 0.15rem 0 0.5rem;
  margin-bottom: 0.15rem;
  border-bottom: 1px solid rgba(90, 88, 112, 0.12);
}

.select-all-label {
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9375rem;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.check-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.5rem;
  padding: 0.25rem 0;
  border-radius: 0.5rem;
  margin: 0 -0.25rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

@media (hover: hover) {
  .check-row:hover {
    background: rgba(99, 102, 241, 0.06);
  }
}

.row-label {
  flex: 1;
  cursor: pointer;
  font-size: clamp(0.875rem, 2.2vw, 0.95rem);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  line-height: 1.35;
}

.table-shell {
  width: 100%;
  margin: 0 -0.125rem;
  padding: 0 0.125rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 0.75rem;
}

.scores-table {
  width: 100%;
  min-width: 0;
}

.scores-table :deep(.p-datatable-table) {
  border-radius: 0.65rem;
  overflow: hidden;
  min-width: 18rem;
}

@media (min-width: 640px) {
  .scores-table :deep(.p-datatable-table) {
    min-width: 22rem;
  }
}

.scores-table :deep(.p-datatable-thead > tr > th) {
  font-size: clamp(0.75rem, 2vw, 0.8125rem);
  white-space: nowrap;
}

.scores-table :deep(.p-datatable-tbody > tr > td) {
  font-size: clamp(0.8125rem, 2.2vw, 0.9rem);
}

.scores-table :deep(.p-datatable-tbody > tr > td:nth-child(2)) {
  word-break: break-word;
  hyphens: auto;
  max-width: min(42vw, 14rem);
}

@media (min-width: 640px) {
  .scores-table :deep(.p-datatable-tbody > tr > td:nth-child(2)) {
    max-width: none;
  }
}

.score-cell {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
