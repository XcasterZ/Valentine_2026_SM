
<template>
  <div class="sections-container" ref="container">
    <!-- เก็บทุก Section ไว้ใน container เดียวกัน -->
    <slot />
    
    <!-- หัวใจลอยทั้งหน้า -->
    <div class="global-floating-hearts">
      <div 
        v-for="n in heartCount" 
        :key="n" 
        class="floating-heart"
        :style="getHeartStyle(n)"
      >
        {{ getHeartEmoji(n) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'

// จำนวนหัวใจ
const heartCount = 20
const container = ref(null)

// สร้างหัวใจแต่ละดวง
const getHeartStyle = (index) => {
  const size = 15 + (index % 4) * 8
  const left = (index * 15) % 100
  const animationDelay = (index * 0.2) % 5
  const duration = 15 + (index % 10)
  
  return {
    fontSize: `${size}px`,
    left: `${left}%`,
    top: `-${30 + (index % 3) * 20}px`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${duration}s`,
    opacity: 0.5 + (index % 3) * 0.15,
  }
}

// ไอคอนหัวใจหลากหลาย
const getHeartEmoji = (index) => {
  const hearts = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🤍', '🤎']
  return hearts[index % hearts.length]
}

// ส่ง container ออกไปให้ Sections ใช้
provide('sectionsContainer', container)
</script>

<style scoped>
.sections-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.global-floating-hearts {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.floating-heart {
  position: absolute;
  animation: floatDown linear infinite;
  user-select: none;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@keyframes floatDown {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) translateX(20px) rotate(360deg);
    opacity: 0;
  }
}
</style>