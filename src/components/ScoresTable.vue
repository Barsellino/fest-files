<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Fieldset from 'primevue/fieldset'
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

const judgesCollapsed = ref(false)
const criteriaCollapsed = ref(false)

let mq
let mqApply

onMounted(() => {
  mq = window.matchMedia('(max-width: 640px)')
  mqApply = () => {
    const narrow = mq.matches
    isCompactTable.value = narrow
    if (narrow) {
      judgesCollapsed.value = true
      criteriaCollapsed.value = true
    } else {
      judgesCollapsed.value = false
      criteriaCollapsed.value = false
    }
  }
  mqApply()
  mq.addEventListener('change', mqApply)
})

onUnmounted(() => {
  if (mq && mqApply) mq.removeEventListener('change', mqApply)
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
      <Fieldset
        v-model:collapsed="judgesCollapsed"
        legend="Судді в підсумку"
        toggleable
        class="block-panel"
      >
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
      </Fieldset>

      <Fieldset
        v-model:collapsed="criteriaCollapsed"
        legend="Критерії в підсумку"
        toggleable
        class="block-panel"
      >
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
      </Fieldset>
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

.block-panel {
  margin: 0;
  border-radius: 0.875rem;
  overflow: hidden;
}

.block-panel :deep(.p-fieldset-legend) {
  font-weight: 600;
  font-size: clamp(0.9rem, 2.2vw, 1rem);
  padding: 0.25rem 0.35rem;
}

.block-panel :deep(.p-fieldset-toggle-button) {
  margin-inline-end: 0.25rem;
}

.block-panel :deep(.p-fieldset-content-container) {
  padding: 0.125rem 0.125rem 0.35rem;
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
