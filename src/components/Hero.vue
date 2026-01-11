<!-- Hero.vue - ปรับใหม่ -->
<template>
  <section 
    class="hero-section" 
    :class="{ 'section-active': isActive, 'section-inactive': !isActive }"
  >
    <!-- เลเยอร์พารัลแลกซ์ -->
    <div class="hero-layer bg-layer" :style="bgLayerStyle"></div>
    
    <div class="hero-layer graphic-layer" :style="graphicLayerStyle">
      <div class="modern-heart">
        <!-- Outer heart -->
        <div class="heart-outer"></div>
        
        <!-- Inner heart with gradient -->
        <div class="heart-inner">
          <div class="heart-gradient"></div>
        </div>
        
        <!-- Sparkle effects -->
        <div class="sparkle sparkle-1"></div>
        <div class="sparkle sparkle-2"></div>
        <div class="sparkle sparkle-3"></div>
      </div>
    </div>
    
    <div class="hero-content" :style="contentStyle">
      <h1 class="hero-title" :style="titleStyle">
        <span class="title-line">{{ titleLine1 }}</span>
        <span class="title-line">{{ titleLine2 }}</span>
        <span class="title-line">{{ titleLine3 }}</span>
      </h1>
      
      <!-- เพิ่มชื่อ TUI SAIMAI -->
      <div class="name-tag" :style="nameStyle">
        <span class="name-heart">❤️</span>
        <!-- <span class="name-text">{{ t('nameLine1') }}</span> -->
        <span class="name-text">{{ t('nameLine2') }}</span>
        <span class="name-heart">❤️</span>
      </div>
      
      <p class="hero-subtitle" :style="subtitleStyle">
        {{ t('continueMessage') }}
      </p>
      
      <!-- ปุ่มเริ่ม (เฉพาะ Hero) -->
      <button class="start-btn" @click="$emit('next')" v-if="isActive">
        {{ t('startButton') }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  isActive: Boolean,
  scrollProgress: {
    type: Number,
    default: 0
  },
  lang: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['next'])

// ข้อความภาษาต่างๆ
const translations = {
  en: {
    continueMessage: 'Scroll or use arrow keys to continue',
    startButton: 'Begin Our Story',
    titleLine1: 'Happy',
    titleLine2: 'Valentine\'s',
    titleLine3: 'Day',
    nameLine1: 'TUI',
    nameLine2: 'SAIMAI'
  },
  th: {
    continueMessage: 'เลื่อนหรือใช้ปุ่มลูกศรเพื่อดำเนินต่อ',
    startButton: 'เริ่มต้นเรื่องราวของเรา',
    titleLine1: 'สุขสันต์',
    titleLine2: 'วัน',
    titleLine3: 'วาเลนไทน์',
    nameLine1: 'ตุ้ย',
    nameLine2: 'สายไหม'
  }
}

// Function สำหรับแปลภาษา
const t = (key) => {
  return translations[props.lang][key] || key
}

// Computed สำหรับ title lines
const titleLine1 = computed(() => t('titleLine1'))
const titleLine2 = computed(() => t('titleLine2'))
const titleLine3 = computed(() => t('titleLine3'))

// Computed สำหรับ name lines
const nameLine1 = computed(() => t('nameLine1'))
const nameLine2 = computed(() => t('nameLine2'))

// เอฟเฟกต์พารัลแลกซ์เมื่อ section active
const bgLayerStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.1 : 0}px)`,
  opacity: props.isActive ? 1 : 0
}))

const graphicLayerStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.3 : 0}px) scale(${props.isActive ? 1 - props.scrollProgress * 0.0005 : 0.8})`,
  opacity: props.isActive ? 1 - (props.scrollProgress * 0.002) : 0
}))

const contentStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.5 : 20}px)`,
  opacity: props.isActive ? 1 : 0
}))

const titleStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.7 : 30}px)`
}))

const nameStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.65 : 25}px)`,
  opacity: props.isActive ? 1 : 0
}))

const subtitleStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.6 : 40}px)`
}))
</script>

<style scoped>
.hero-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.section-active {
  transform: translateY(0);
  opacity: 1;
  z-index: 10;
}

.section-inactive {
  transform: translateY(100vh);
  opacity: 0;
  z-index: 1;
}

.hero-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transition: opacity 0.8s ease;
}

.bg-layer {
  background: linear-gradient(135deg, #ff4081 0%, #7c4dff 100%);
  opacity: 0.1;
  z-index: 1;
}

.graphic-layer {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.modern-heart {
  position: relative;
  width: 60vmin;
  height: 60vmin;
}

.heart-outer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  clip-path: path("M50,85 C30,70 10,50 10,30 C10,15 25,5 40,5 C50,5 60,10 65,20 L50,35 L35,20 C40,10 50,5 60,5 C75,5 90,15 90,30 C90,50 70,70 50,85 Z");
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.heart-inner {
  position: absolute;
  width: 85%;
  height: 85%;
  top: 7.5%;
  left: 7.5%;
  clip-path: path("M50,85 C30,70 10,50 10,30 C10,15 25,5 40,5 C50,5 60,10 65,20 L50,35 L35,20 C40,10 50,5 60,5 C75,5 90,15 90,30 C90,50 70,70 50,85 Z");
  overflow: hidden;
}

.heart-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 64, 129, 0.3) 0%,
    rgba(124, 77, 255, 0.2) 100%
  );
  animation: gradientMove 8s ease-in-out infinite;
}

.sparkle {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: sparkleTwinkle 2s ease-in-out infinite;
}

.sparkle-1 {
  width: 10px;
  height: 10px;
  top: 20%;
  left: 30%;
  animation-delay: 0s;
}

.sparkle-2 {
  width: 8px;
  height: 8px;
  top: 40%;
  left: 70%;
  animation-delay: 0.5s;
}

.sparkle-3 {
  width: 6px;
  height: 6px;
  top: 70%;
  left: 40%;
  animation-delay: 1s;
}

@keyframes gradientMove {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10%);
  }
}

@keyframes sparkleTwinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  transition: all 0.8s ease;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 6rem);
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  line-height: 0.9;
  text-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.title-line {
  display: block;
}

/* ชื่อ TUI SAIMAI */
.name-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 1rem 0 1.5rem;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.8s ease;
  animation: nameGlow 3s ease-in-out infinite;
}

.name-heart {
  font-size: 3rem;
  animation: heartBeat 2s ease-in-out infinite;
}

.name-text {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 10px rgba(255, 64, 129, 0.5);
  letter-spacing: 0.05em;
}

.name-text:first-of-type {
  color: #ffeb3b;
}

.name-text:last-of-type {
  color: #4fc3f7;
}

@keyframes nameGlow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 4px 25px rgba(255, 64, 129, 0.3);
    transform: scale(1.02);
  }
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
}

.start-btn {
  background: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  color: #ff4081;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.start-btn:active {
  transform: translateY(0);
}

/* สำหรับภาษาไทย */
:global(body:lang(th)) .hero-title {
  font-family: 'Kanit', 'Sarabun', sans-serif;
  line-height: 1.1;
}

:global(body:lang(th)) .name-text {
  font-family: 'Kanit', 'Sarabun', sans-serif;
  font-weight: 700;
}

:global(body:lang(th)) .hero-subtitle {
  font-family: 'Kanit', 'Sarabun', sans-serif;
}

:global(body:lang(th)) .start-btn {
  font-family: 'Kanit', 'Sarabun', sans-serif;
}

/* Responsive สำหรับชื่อ */
@media (max-width: 768px) {
  /* .name-tag {
    flex-direction: column;
    gap: 8px;
    padding: 10px 20px;
    margin: 0.5rem 0 1rem;
  } */
  
  .name-heart {
    font-size: 1.2rem;
  }
  
  .name-text {
    font-size: clamp(1.5rem, 3vw, 2rem);
  }
  
  .hero-title {
    margin-bottom: 0.3rem;
  }
}

@media (max-width: 480px) {
  .name-tag {
    padding: 8px 16px;
  }
  
  .name-text {
    font-size: clamp(1.3rem, 2.5vw, 1.8rem);
  }
}
</style>