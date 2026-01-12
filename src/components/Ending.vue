<!-- Ending.vue - หน้าสุดท้ายโรแมนติก -->
<template>
  <section 
    class="ending-section" 
    :class="{ 'section-active': isActive, 'section-inactive': !isActive }"
    ref="sectionRef"
  >
    <!-- พื้นหลังดาวน์และกราฟิก -->
    <div class="ending-bg-layer"></div>
    
    <!-- เอฟเฟกต์ดาวตก -->
    <div class="falling-stars">
      <div class="star" v-for="(s, i) in starStyles" :key="i" :style="s"></div>
    </div>
    
    <!-- ใจกลางเนื้อหา -->
    <div class="ending-content" :style="contentStyle">
      <!-- หัวใจแบบ responsive -->
      <div class="floating-hearts">
        <div class="floating-heart heart-1">❤️</div>
        <div class="floating-heart heart-2">💖</div>
        <div class="floating-heart heart-3">💕</div>
      </div>
      
      <div class="ending-message">
        <!-- ข้อความหลัก -->
        <h1 class="ending-title" :style="titleStyle">
          <span class="title-line">{{ t('titleLine1') }}</span>
          <span class="title-line">{{ t('titleLine2') }}</span>
        </h1>
        
        <!-- ข้อความอ้างอิงโรแมนติก -->
        <div class="quote-container">
          <p class="quote">
            {{ t('quoteLine1') }}<br>
            {{ t('quoteLine2') }}
          </p>
          <!-- <p class="quote-author">{{ t('quoteAuthor') }}</p> -->
        </div>
        
        <!-- ข้อความส่วนตัว -->
        <div class="personal-message">
          <p class="message-text">
            {{ t('message1Line1') }}<br>
            {{ t('message1Line2') }}
          </p>
          <p class="message-text">
            {{ t('message2Line1') }}<br>
            {{ t('message2Line2') }}
          </p>
        </div>
        
        <!-- วันที่สำคัญ -->
        <div class="date-marker">
          <div class="date-icon">💘</div>
          <p class="date-text">{{ t('dateText') }}</p>
        </div>
        
        <!-- ปุ่มสำหรับ restart หรือ share -->
        <div class="ending-actions">
          <!-- <button class="action-btn restart-btn" @click="restartJourney">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">{{ t('reliveStory') }}</span>
          </button> -->
          <button class="action-btn share-btn" @click="shareLove">
            <span class="btn-icon">💌</span>
            <span class="btn-text">{{ t('shareLove') }}</span>
          </button>
        </div>
      </div>
      
      <!-- ฟุตเตอร์ -->
      <div class="ending-footer">
        <p class="footer-text">
          {{ t('footerText') }}
        </p>
        <p class="footer-date">{{ t('footerDate') }}</p>
      </div>
    </div>
    
    <!-- ปุ่มกลับ (ถ้ามี) -->
    <!-- <button 
      v-if="showPrev" 
      class="back-to-gallery-btn" 
      @click="$emit('prev')"
      :style="backButtonStyle"
    >
      <span class="back-icon">←</span>
      {{ t('backToMemories') }}
    </button> -->
  </section>
</template>

<script setup>
import { defineProps, ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  isActive: Boolean,
  scrollProgress: {
    type: Number,
    default: 0
  },
  showPrev: {
    type: Boolean,
    default: true
  },
  lang: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['prev', 'restart'])

// ข้อความภาษาต่างๆ
const translations = {
  en: {
    titleLine1: 'To My',
    titleLine2: 'Beloved',
    quoteLine1: '"I love you not only for what you are,',
    quoteLine2: 'but for what I am when I am with you."',
    quoteAuthor: '— Roy Croft',
    message1Line1: 'Every moment with you is a treasure,',
    message1Line2: 'every memory a beautiful chapter in our story.',
    message2Line1: 'Thank you for being my sunshine,',
    message2Line2: 'my anchor, and my greatest love.',
    dateText: 'Forever and Always',
    reliveStory: 'Relive Our Story',
    shareLove: 'Share the Love',
    footerText: 'Made with ❤️ for the most special person',
    footerDate: 'Happy Valentine\'s Day 2024',
    backToMemories: 'Back to Memories',
    shareAlertTitle: 'Our Love Story',
    shareAlertText: 'Check out this beautiful Valentine\'s Day message! ❤️',
    shareCopied: 'Link copied to clipboard! Share with your loved one. ❤️'
  },
  th: {
    titleLine1: 'ถึง',
    titleLine2: 'คนที่ฉันรัก',
    quoteLine1: '"ฉันรักเธอไม่ใช่เพียงเพราะสิ่งที่เธอเป็น',
    quoteLine2: 'แต่เพราะสิ่งที่ฉันเป็นเมื่อฉันอยู่กับเธอ"',
    quoteAuthor: '— รอย ครอฟต์',
    message1Line1: 'ทุกช่วงเวลากับเธอคือสมบัติล้ำค่า',
    message1Line2: 'ทุกความทรงจำคือบทสวยงามในเรื่องราวของเรา',
    message2Line1: 'ขอบคุณที่เป็นดั่งแสงตะวันของฉัน',
    message2Line2: 'เป็นหินผาและรักที่ยิ่งใหญ่ที่สุดของฉัน',
    dateText: 'ตลอดไปและตลอดกาล',
    reliveStory: 'สัมผัสเรื่องราวของเราอีกครั้ง',
    shareLove: 'แบ่งปันความรัก',
    footerText: 'ทำด้วย ❤️ สำหรับคนพิเศษที่สุด',
    footerDate: 'สุขสันต์วันวาเลนไทน์ 2024',
    backToMemories: 'กลับสู่ความทรงจำ',
    shareAlertTitle: 'เรื่องราวความรักของเรา',
    shareAlertText: 'ดูข้อความวาเลนไทน์แสนสวยนี้สิ! ❤️',
    shareCopied: 'คัดลอกลิงก์แล้ว! แบ่งปันให้คนที่คุณรัก ❤️'
  }
}

// Function สำหรับแปลภาษา
const t = (key) => {
  return translations[props.lang][key] || key
}

// Ref
const sectionRef = ref(null)

// Precompute star styles once to avoid recalculating on every render
const starStyles = ref([])

onMounted(() => {
  if (!starStyles.value.length) {
    starStyles.value = Array.from({ length: 20 }).map(() => {
      const delay = Math.random() * 5
      const duration = 3 + Math.random() * 2
      const left = Math.random() * 100
      return {
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity: 0.3 + Math.random() * 0.5
      }
    })
  }
})

// Computed styles สำหรับ animation
const contentStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.2 : 30}px)`,
  opacity: props.isActive ? 1 : 0,
  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
}))

const titleStyle = computed(() => ({
  transform: `translateY(${props.isActive ? props.scrollProgress * 0.3 : 40}px)`
}))

const backButtonStyle = computed(() => ({
  opacity: props.isActive ? 1 - (props.scrollProgress * 0.01) : 0
}))

// Note: star styles are precomputed in `starStyles` to avoid recalculation

// Methods
// const restartJourney = () => {
//   emit('restart')
//   // หรือถ้าต้องการให้ scroll ไปหน้าแรก
//   window.scrollTo({ top: 0, behavior: 'smooth' })
// }

const shareLove = () => {
  if (navigator.share) {
    navigator.share({
      title: t('shareAlertTitle'),
      text: t('shareAlertText'),
      url: window.location.href
    })
  } else {
    // Fallback สำหรับเบราว์เซอร์ที่ไม่ support Web Share API
    navigator.clipboard.writeText(window.location.href)
    alert(t('shareCopied'))
  }
}

// Effect เมื่อ section เปิดใช้งาน
watch(() => props.isActive, (active) => {
  if (active) {
    // เพิ่ม effect เมื่อแสดงหน้า ending
    // Use nextTick to add the class as soon as DOM is ready (avoid a forced delay)
    nextTick(() => {
      if (sectionRef.value) {
        sectionRef.value.classList.add('ending-enter')
      }
    })
  }
}, { immediate: true })
</script>

<style scoped>
.ending-section {
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
  overflow: hidden;
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

.ending-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(255, 105, 180, 0.15) 0%, 
    rgba(219, 112, 147, 0.1) 25%,
    rgba(199, 21, 133, 0.05) 50%,
    rgba(255, 182, 193, 0.1) 75%,
    rgba(255, 105, 180, 0.15) 100%);
  z-index: 1;
}

/* เอฟเฟกต์ดาวตก */
.falling-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.star {
  position: absolute;
  top: -20px;
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8));
  animation: fallingStar linear infinite;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

@keyframes fallingStar {
  0% {
    transform: translateY(0) rotate(45deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(45deg);
    opacity: 0;
  }
}

/* เนื้อหาหลัก */
.ending-content {
  position: relative;
  z-index: 3;
  text-align: center;
  max-width: 800px;
  padding: 20px;
  width: 100%;
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* หัวใจลอย */
.floating-hearts {
  position: relative;
  height: 100px;
  margin-bottom: 40px;
}

.floating-heart {
  position: absolute;
  font-size: 3rem;
  animation: float 6s ease-in-out infinite;
}

.heart-1 {
  left: 15%;
  animation-delay: 0s;
  color: #ff4081;
}

.heart-2 {
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 2s;
  color: #ff79b0;
  font-size: 4rem;
}

.heart-3 {
  right: 15%;
  animation-delay: 4s;
  color: #ff4d8d;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(10deg);
  }
  66% {
    transform: translateY(10px) rotate(-10deg);
  }
}

/* ข้อความหลัก */
.ending-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 800;
  color: #8b0000;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(139, 0, 0, 0.2);
}

.title-line {
  display: block;
}

/* ข้อความอ้างอิง */
.quote-container {
  margin: 2.5rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 
    0 10px 30px rgba(139, 0, 0, 0.1),
    0 0 0 1px rgba(255, 182, 193, 0.3);
  backdrop-filter: blur(10px);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.quote {
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  color: #8b0000;
  line-height: 1.6;
  font-style: italic;
  font-weight: 300;
  margin-bottom: 1rem;
}

.quote-author {
  font-size: 1rem;
  color: #c71585;
  font-weight: 500;
}

/* ข้อความส่วนตัว */
.personal-message {
  margin: 2.5rem 0;
  padding: 0 1rem;
}

.message-text {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  color: #8b0000;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  font-weight: 400;
}

/* วันที่สำคัญ */
.date-marker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem 2rem;
  border-radius: 50px;
  margin: 2rem auto;
  box-shadow: 0 5px 15px rgba(139, 0, 0, 0.1);
}

.date-icon {
  font-size: 1.5rem;
}

.date-text {
  font-size: 1.2rem;
  color: #8b0000;
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* ปุ่ม action */
.ending-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin: 3rem 0;
  flex-wrap: wrap;
}

.action-btn {
  background: linear-gradient(135deg, #ff4081 0%, #c71585 100%);
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 5px 20px rgba(199, 21, 133, 0.3);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(199, 21, 133, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}

.share-btn {
  background: linear-gradient(135deg, #ff79b0 0%, #ff4081 100%);
}

/* ฟุตเตอร์ */
.ending-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(139, 0, 0, 0.1);
}

.footer-text {
  font-size: 1rem;
  color: #8b0000;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.footer-date {
  font-size: 0.9rem;
  color: #c71585;
  font-weight: 500;
}

/* ปุ่มกลับ */
.back-to-gallery-btn {
  position: absolute;
  bottom: 30px;
  left: 30px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #ff4081;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ff4081;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
}

.back-to-gallery-btn:hover {
  background: white;
  transform: translateX(-3px);
}

.back-icon {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .ending-content {
    padding: 15px;
  }
  
  .floating-hearts {
    height: 80px;
    margin-bottom: 30px;
  }
  
  .floating-heart {
    font-size: 2rem;
  }
  
  .heart-2 {
    font-size: 2.5rem;
  }
  
  .quote-container {
    padding: 1.5rem;
    margin: 2rem 0;
  }
  
  .ending-actions {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
  
  .back-to-gallery-btn {
    bottom: 20px;
    left: 20px;
    padding: 8px 16px;
    font-size: 0.8rem;
  }
  
  .ending-title {
    font-size: clamp(2rem, 6vw, 3.5rem);
  }
  
  .quote {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
  }
}

@media (max-height: 700px) {
  .floating-hearts {
    height: 60px;
    margin-bottom: 20px;
  }
  
  .ending-title {
    margin-bottom: 1.5rem;
  }
  
  .quote-container {
    margin: 1.5rem 0;
    padding: 1.2rem;
  }
  
  .personal-message {
    margin: 1.5rem 0;
  }
  
  .ending-actions {
    margin: 2rem 0;
  }
}

/* Animation เมื่อเข้าสู่หน้า */
.ending-enter .ending-content {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* เพิ่ม subtle pulse สำหรับหัวใจ */
@keyframes heartPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.heart-2 {
  animation: float 6s ease-in-out infinite, heartPulse 2s ease-in-out infinite;
}

/* Apply Thai fonts directly for this component so they display regardless of document lang */
.ending-title,
.quote,
.quote-author,
.message-text,
.date-text,
.action-btn,
.footer-text,
.footer-date,
.back-to-gallery-btn {
  font-family: 'Kanit', 'Sarabun', sans-serif;
}

.ending-title {
  line-height: 1.1;
}
</style>