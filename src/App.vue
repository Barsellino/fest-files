<script setup>
import ScoresTable from './components/ScoresTable.vue'
import { storeToRefs } from 'pinia'
import { useProtocolStore } from './stores/protocol.js'

const protocol = useProtocolStore()
const { tournament: TOURNAMENT } = storeToRefs(protocol)

const protocolTabOptions = [
  { label: 'Strip Beginners', shortLabel: 'Beginners', value: 'beginners' },
  { label: 'Strip Middle', shortLabel: 'Middle', value: 'middle' },
  { label: 'Strip Skilled', shortLabel: 'Skilled', value: 'strip' },
  { label: 'Best Ladies Show', shortLabel: 'BLS', value: 'bls' },
]

function isTabActive(value) {
  return protocol.activeBundledTab === value
}

/**
 * @param {{ label: string, shortLabel: string, value: string }} tab
 * @param {EventTarget | null} target
 */
function onTabActivate(tab, target) {
  protocol.switchBundledTab(tab.value)
  if (target instanceof HTMLElement) {
    target.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    })
  }
}
</script>

<template>
  <div class="shell">
    <main class="layout">
      <nav class="protocol-tabs" aria-label="Категорія протоколу">
        <div class="protocol-tabs__edge protocol-tabs__edge--left" aria-hidden="true" />
        <div class="protocol-tabs__edge protocol-tabs__edge--right" aria-hidden="true" />
        <div
          class="tab-strip"
          role="tablist"
        >
          <button
            v-for="tab in protocolTabOptions"
            :key="tab.value"
            type="button"
            class="tab-strip__tab"
            :class="{ 'tab-strip__tab--active': isTabActive(tab.value) }"
            role="tab"
            :aria-selected="isTabActive(tab.value)"
            :aria-label="tab.label"
            @click="onTabActivate(tab, $event.currentTarget)"
          >
            <span class="tab-strip__text tab-strip__text--full" aria-hidden="true">{{
              tab.label
            }}</span>
            <span class="tab-strip__text tab-strip__text--short" aria-hidden="true">{{
              tab.shortLabel
            }}</span>
          </button>
        </div>
      </nav>

      <header class="hero">
        <p class="hero__eyebrow">{{ TOURNAMENT.name }} · {{ TOURNAMENT.dateLabel }}</p>
        <h1 class="hero__title">Оцінки конкурсу</h1>
        <p class="hero__meta">
          {{ TOURNAMENT.category }} — {{ TOURNAMENT.participantCount }} учасників ·
          {{ TOURNAMENT.studioCount }} студій · {{ TOURNAMENT.cityCount }} міст
        </p>
        <p class="hero__lead">
          Оберіть суддів і критерії для підсумку. Якщо не обрано жодного судді
          або критерію — у таблиці відображається 0 балів. Підсумок округлено до
          сотих. Голова лічильної комісії: {{ TOURNAMENT.headOfScoringCommission }}.
        </p>
      </header>

      <section class="panel" aria-label="Таблиця та фільтри">
        <ScoresTable />
      </section>
    </main>

    <footer class="site-footer">
      <p class="site-footer__text">Created by МаріченкоРудніченко</p>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  padding-left: max(clamp(0.75rem, 2vw, 1.5rem), env(safe-area-inset-left));
  padding-right: max(clamp(0.75rem, 2vw, 1.5rem), env(safe-area-inset-right));
  padding-bottom: max(clamp(0.75rem, 2vw, 1rem), env(safe-area-inset-bottom));
}

.layout {
  flex: 1 0 auto;
  max-width: 56rem;
  width: 100%;
  margin: 0 auto;
}

.protocol-tabs {
  position: relative;
  margin-bottom: clamp(0.75rem, 2.5vw, 1.25rem);
}

.protocol-tabs__edge {
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 1px;
  width: clamp(1.25rem, 5vw, 2rem);
  z-index: 1;
}

.protocol-tabs__edge--left {
  left: 0;
  background: linear-gradient(
    to right,
    rgba(247, 245, 251, 0.97) 0%,
    rgba(247, 245, 251, 0) 100%
  );
}

.protocol-tabs__edge--right {
  right: 0;
  background: linear-gradient(
    to left,
    rgba(247, 245, 251, 0.97) 0%,
    rgba(247, 245, 251, 0) 100%
  );
}

@media (min-width: 640px) {
  .protocol-tabs__edge {
    display: none;
  }
}

.tab-strip {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.35rem clamp(0.5rem, 2.5vw, 1.35rem);
  border-bottom: 1px solid rgba(45, 42, 85, 0.14);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scroll-snap-type: x proximity;
  padding-inline: max(0.125rem, env(safe-area-inset-left, 0px))
    max(0.125rem, env(safe-area-inset-right, 0px));
}

.tab-strip__tab {
  position: relative;
  flex: 0 0 auto;
  scroll-snap-align: center;
  margin: 0;
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem clamp(0.85rem, 2.5vw, 1.25rem) 0.65rem;
  border: none;
  border-radius: 0.5rem 0.5rem 0 0;
  background: transparent;
  font: inherit;
  font-size: clamp(0.8125rem, 2vw, 0.9375rem);
  font-weight: 500;
  color: #9d99ae;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.tab-strip__text--short {
  display: none;
}

@media (max-width: 639.98px) {
  .tab-strip {
    gap: 0.25rem clamp(0.35rem, 2vw, 0.75rem);
    scroll-padding-inline: max(0.75rem, env(safe-area-inset-left, 0px))
      max(0.75rem, env(safe-area-inset-right, 0px));
  }

  .tab-strip__text--full {
    display: none;
  }

  .tab-strip__text--short {
    display: inline;
  }
}

.tab-strip__tab:hover {
  color: #6b6780;
  background: rgba(99, 102, 241, 0.06);
}

.tab-strip__tab:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.tab-strip__tab--active {
  color: #1e1b2e;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.55);
}

.tab-strip__tab--active:hover {
  color: #1e1b2e;
}

.tab-strip__tab--active::after {
  content: '';
  position: absolute;
  left: 0.35rem;
  right: 0.35rem;
  bottom: -1px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #4f46e5;
  box-shadow: 0 -1px 0 0 rgba(255, 255, 255, 0.5);
}

@media (max-width: 520px) {
  .tab-strip__tab {
    padding-inline: clamp(0.65rem, 3vw, 0.95rem);
  }
}

.site-footer {
  flex-shrink: 0;
  margin-top: clamp(1.25rem, 4vw, 2rem);
  padding-top: clamp(1rem, 3vw, 1.5rem);
  border-top: 1px solid rgba(45, 42, 85, 0.1);
  text-align: center;
}

.site-footer__text {
  margin: 0;
  font-size: clamp(0.75rem, 1.8vw, 0.8125rem);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #8b8799;
}

.hero {
  margin-bottom: clamp(1.25rem, 4vw, 2rem);
}

.hero__eyebrow {
  margin: 0 0 0.35rem;
  font-size: clamp(0.7rem, 1.5vw, 0.8125rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5c5778;
}

.hero__title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: #12121c;
}

.hero__meta {
  margin: 0 0 0.75rem;
  font-size: clamp(0.8125rem, 2vw, 0.9375rem);
  font-weight: 500;
  color: #4a4668;
}

.hero__lead {
  margin: 0;
  max-width: 38rem;
  font-size: clamp(0.875rem, 2.2vw, 0.9375rem);
  line-height: 1.55;
  color: #5a5670;
}

.panel {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: clamp(1rem, 3vw, 1.25rem);
  box-shadow:
    0 1px 2px rgba(22, 22, 35, 0.04),
    0 12px 40px -12px rgba(45, 42, 85, 0.18);
  padding: clamp(1rem, 3.5vw, 1.5rem);
}
</style>
