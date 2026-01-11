<template>
  <section
    class="h-screen bg-pink-100 flex items-center justify-center"
  >
    <img
      ref="photo"
      src="https://picsum.photos/420/560"
      class="rounded-2xl shadow-2xl"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const photo = ref(null)

onMounted(() => {
  gsap.from(photo.value, {
    y: 160,
    scale: 0.9,
    scrollTrigger: {
      trigger: photo.value,
      scrub: true
    }
  })
})
</script>
