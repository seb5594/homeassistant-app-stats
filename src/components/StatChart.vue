<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, DoughnutController, ArcElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js'
Chart.register(DoughnutController, ArcElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip)
const props = defineProps({ type: { type: String, default: 'doughnut' }, data: { type: Object, required: true }, options: { type: Object, default: () => ({}) }, label: { type: String, required: true } })
const canvas = ref(null)
let chart
function render() {
  chart?.destroy()
  if (!canvas.value) return
  chart = new Chart(canvas.value, { type: props.type, data: JSON.parse(JSON.stringify(props.data)), options: {
    responsive: true, maintainAspectRatio: false,
    animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 450 },
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#11294b', padding: 12, cornerRadius: 8 } }, ...props.options,
  } })
}
onMounted(render)
watch(() => [props.type, props.data, props.options], render, { deep: true })
onBeforeUnmount(() => chart?.destroy())
</script>
<template><canvas ref="canvas" role="img" :aria-label="label">{{ label }}</canvas></template>
