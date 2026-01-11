<!-- components/ParallaxController.vue -->
<template>
  <slot :scrollY="scrollY" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)
const isScrolling = ref(false)

const handleScroll = () => {
  if (!isScrolling.value) {
    isScrolling.value = true
    requestAnimationFrame(() => {
      scrollY.value = window.pageYOffset || document.documentElement.scrollTop
      isScrolling.value = false
    })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>