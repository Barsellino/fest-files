<script setup>
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
</script>

<template>
  <section>
    <p>Значення: <strong>{{ counter.count }}</strong></p>
    <p>Подвоєне: <strong>{{ counter.doubleCount }}</strong></p>
    <div class="actions">
      <button type="button" @click="counter.increment">+1</button>
      <button type="button" @click="counter.decrement">−1</button>
      <button type="button" class="ghost" @click="counter.reset">Скинути</button>
    </div>
  </section>
</template>

<style scoped>
section {
  margin-top: 1.25rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  background: #fafafa;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
button {
  padding: 0.35rem 0.75rem;
  border-radius: 0.35rem;
  border: 1px solid #333;
  background: #111;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}
button:hover {
  opacity: 0.9;
}
button.ghost {
  background: #fff;
  color: #111;
}
</style>
