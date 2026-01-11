<!-- App.vue - ใหม่ทั้งหมด -->
<template>
  <div class="app-container">
    <!-- พื้นหลังสีที่เปลี่ยนตามการเลื่อน -->
    <div class="color-background" :style="bgColorStyle"></div>
    
    <!-- ปุ่มภาษา -->
    <div class="language-switcher">
      <button 
        class="lang-btn en"  
        :class="{ active: currentLang === 'en' }"
        @click="changeLanguage('en')"
      >
        EN
      </button>
      <button 
        class="lang-btn th"  
        :class="{ active: currentLang === 'th' }"
        @click="changeLanguage('th')"
      >
        ไทย
      </button>
    </div>
    
    <!-- Container สำหรับ Sections ที่จะทับกัน -->
    <SectionsContainer>
      <!-- Hero Section (อยู่ด้านล่างสุด) -->
      <HeroSection 
        :is-active="activeSection === 0"
        :scroll-progress="sectionProgress"
        @next="goToSection(1)"
        :lang="currentLang"
      />
      
      <!-- Story Section -->
      <StorySection 
        :is-active="activeSection === 1"
        :scroll-progress="sectionProgress"
        @next="goToSection(2)"
        @prev="goToSection(0)"
        :lang="currentLang"
      />
      
      <!-- Gallery Section -->
      <!-- <GallerySection 
        :is-active="activeSection === 2"
        :scroll-progress="sectionProgress"
        @next="goToSection(3)"
        @prev="goToSection(1)"
      /> -->
      
      <!-- Ending Section -->
      <EndingSection 
        :is-active="activeSection === 2"
        :scroll-progress="sectionProgress"
        @prev="goToSection(1)"
        :lang="currentLang"
      />
    </SectionsContainer>
    
    <!-- ตัวติดตามความคืบหน้า -->
    <div class="scroll-progress">
      <div class="scroll-dots">
        <div 
          v-for="i in 3" 
          :key="i" 
          class="scroll-dot"
          :class="{ active: activeSection === i-1 }"
          @click="goToSection(i-1)"
        ></div>
      </div>
      <div class="section-indicator">
        {{ t('sectionIndicator', { current: activeSection + 1, total: 3 }) }}
      </div>
    </div>
    
    <!-- ปุ่มนำทาง -->
    <!-- <div class="navigation-buttons" v-if="activeSection < 2">
      <button class="nav-btn next-btn" @click="goToSection(activeSection + 1)">
        ↓ {{ t('next') }}
      </button>
    </div>
    <div class="navigation-buttons" v-if="activeSection > 0">
      <button class="nav-btn prev-btn" @click="goToSection(activeSection - 1)">
        ↑ {{ t('previous') }}
      </button>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SectionsContainer from './components/SectionsContainer.vue'
import HeroSection from './components/Hero.vue'
import StorySection from './components/Story.vue'
import GallerySection from './components/Gallery.vue'
import EndingSection from './components/Ending.vue'

// State
const activeSection = ref(0)
const isTransitioning = ref(false)
const sectionProgress = ref(0)
const currentLang = ref('en') // 'en' หรือ 'th'

// ข้อความภาษาต่างๆ
const translations = {
  en: {
    sectionIndicator: 'Section {current}/{total}',
    next: 'Next',
    previous: 'Previous',
    continueMessage: 'Scroll or use arrow keys to continue',
    startButton: 'Begin Our Story',
    heroTitle1: 'Happy',
    heroTitle2: 'Valentine\'s',
    heroTitle3: 'Day',
    storyTitle1: 'Our',
    storyTitle2: 'Love',
    storyTitle3: 'Story',
    endingTitle1: 'To My',
    endingTitle2: 'Beloved'
  },
  th: {
    sectionIndicator: 'ส่วนที่ {current}/{total}',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',
    continueMessage: 'เลื่อนหรือใช้ปุ่มลูกศรเพื่อดำเนินต่อ',
    startButton: 'เริ่มต้นเรื่องราวของเรา',
    heroTitle1: 'สุขสันต์',
    heroTitle2: 'วัน',
    heroTitle3: 'วาเลนไทน์',
    storyTitle1: 'เรื่องราว',
    storyTitle2: 'ความรัก',
    storyTitle3: 'ของเรา',
    endingTitle1: 'ถึง',
    endingTitle2: 'คนที่ฉันรัก'
  }
}

// Function สำหรับแปลภาษา
const t = (key, params = {}) => {
  let text = translations[currentLang.value][key] || key
  // แทนที่พารามิเตอร์
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param])
  })
  return text
}

// เปลี่ยนภาษา
const changeLanguage = (lang) => {
  currentLang.value = lang
  // ตั้งค่า lang attribute บน html element
  document.documentElement.lang = lang
  // บันทึกการตั้งค่าภาษาใน localStorage
  localStorage.setItem('valentineLang', lang)
}

// โหลดการตั้งค่าภาษาจาก localStorage
const loadLanguagePreference = () => {
  const savedLang = localStorage.getItem('valentineLang')
  if (savedLang && (savedLang === 'en' || savedLang === 'th')) {
    currentLang.value = savedLang
    document.documentElement.lang = savedLang
  } else {
    // ถ้าไม่มีค่าที่บันทึกไว้ ให้ตรวจสอบภาษาของเบราว์เซอร์
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.includes('th')) {
      currentLang.value = 'th'
      document.documentElement.lang = 'th'
    } else {
      currentLang.value = 'en'
      document.documentElement.lang = 'en'
    }
  }
}

// Provide translation function ไปให้ลูก
const provideTranslations = () => {
  return { t, currentLang }
}

// เปลี่ยน section
const goToSection = (index) => {
  if (isTransitioning.value || index < 0 || index > 2) return
  
  isTransitioning.value = true
  activeSection.value = index
  sectionProgress.value = 0
  
  // รีเซ็ต animation
  setTimeout(() => {
    isTransitioning.value = false
  }, 1000)
}

// พื้นหลังเปลี่ยนสีตาม section
const bgColorStyle = computed(() => {
  const colors = [
    'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',  // Section 1
    'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)',  // Section 2
    'linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)'   // Section 3
  ]
  return { background: colors[activeSection.value] }
})

// รับ keyboard events
const handleKeydown = (e) => {
  if (e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault()
    if (activeSection.value < 2) goToSection(activeSection.value + 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (activeSection.value > 0) goToSection(activeSection.value - 1)
  }
  // ปุ่มเปลี่ยนภาษา L สำหรับ Language
  else if (e.key === 'l' || e.key === 'L') {
    e.preventDefault()
    changeLanguage(currentLang.value === 'en' ? 'th' : 'en')
  }
}

// รับ wheel events (แทน scroll)
const handleWheel = (e) => {
  e.preventDefault()
  if (e.deltaY > 0 && activeSection.value < 2) {
    goToSection(activeSection.value + 1)
  } else if (e.deltaY < 0 && activeSection.value > 0) {
    goToSection(activeSection.value - 1)
  }
}

// รับ touch events สำหรับมือถือ
let touchStartY = 0
const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY
}
const handleTouchEnd = (e) => {
  const touchEndY = e.changedTouches[0].clientY
  const diff = touchStartY - touchEndY
  
  if (Math.abs(diff) > 50) {
    if (diff > 0 && activeSection.value < 2) {
      // Swipe up
      goToSection(activeSection.value + 1)
    } else if (diff < 0 && activeSection.value > 0) {
      // Swipe down
      goToSection(activeSection.value - 1)
    }
  }
}

onMounted(() => {
  loadLanguagePreference()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchend', handleTouchEnd, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
})

// Provide สำหรับ component ลูก
defineExpose({
  provideTranslations
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --en-heading: 'Playfair Display', serif;
  --en-body: 'Inter', sans-serif;
  --th-heading: 'Kanit', sans-serif;
  --th-body: 'Sarabun', sans-serif;
}

html, body {
  height: 100%;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

.app-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.color-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ปุ่มภาษา - แก้ไขใหม่ทั้งหมด */
.language-switcher {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  gap: 0;
  background: rgba(0, 0, 0, 0.25); /* เปลี่ยนเป็นพื้นหลังเข้มขึ้น */
  backdrop-filter: blur(15px) saturate(180%); /* เพิ่ม saturation */
  padding: 4px;
  border-radius: 50px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1); /* เพิ่มเส้นขอบบาง */
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 140px;
  height: 40px;
}

.lang-btn {
  background: transparent;
  border: none;
  padding: 0;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700; /* เพิ่มความหนา */
  color: rgba(255, 255, 255, 0.95); /* ทำให้สีขาวเข้มขึ้น */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  flex: 1;
  height: 32px;
  line-height: 32px;
  margin: 0 2px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); /* เพิ่มเงาให้ตัวอักษร */
  letter-spacing: 0.5px; /* เพิ่มระยะห่างตัวอักษร */
}

/* ปุ่มภาษาอังกฤษ - ใช้ font อังกฤษ */
.lang-btn.en {
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 13.5px; /* ขนาดเล็กกว่าปกตินิดหน่อย */
}

/* ปุ่มภาษาไทย - ใช้ font ไทย */
.lang-btn.th {
  font-family: 'Kanit', 'Sarabun', sans-serif;
  font-weight: 600; /* ลดความหนาลงเล็กน้อย */
  letter-spacing: 0.5px;
  font-size: 13.5px;
  padding: 1px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4); /* เงาเข้มขึ้นสำหรับภาษาไทย */
}

.lang-btn:hover {
  opacity: 1;
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.lang-btn.active {
  background: linear-gradient(135deg, rgba(255, 107, 139, 0.9), rgba(255, 142, 158, 0.9));
  opacity: 1;
  color: white;
  box-shadow: 
    0 4px 15px rgba(255, 107, 139, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  transform: translateY(0);
}

.lang-btn.active:hover {
  background: linear-gradient(135deg, rgba(255, 107, 139, 1), rgba(255, 142, 158, 1));
  box-shadow: 
    0 6px 20px rgba(255, 107, 139, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

/* เอฟเฟกต์กดปุ่ม */
.lang-btn:active {
  transform: translateY(1px) scale(0.98);
  transition: all 0.1s ease;
}

/* ลบส่วนนี้ (ไม่จำเป็นเพราะใช้คลาส .en และ .th แทน) */
/* body:lang(th) .lang-btn {
  font-size: 13.5px !important;
  letter-spacing: 0.02em;
} */

/* Navigation */
.scroll-progress {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.scroll-dots {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scroll-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.scroll-dot:hover {
  transform: scale(1.3);
  background: rgba(255, 255, 255, 0.6);
}

.scroll-dot.active {
  background: white;
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(255, 64, 129, 0.5);
}

.section-indicator {
  color: white;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
  min-width: 70px;
  text-align: center;
}

/* Navigation Buttons */
.navigation-buttons {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  color: #ff4081;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  text-align: center;
}

.nav-btn:hover {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nav-btn:active {
  transform: translateY(0);
}

.prev-btn {
  margin-right: 10px;
}

.next-btn {
  margin-left: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .scroll-progress {
    top: 10px;
    right: 10px;
  }
  
  .scroll-dot {
    width: 8px;
    height: 8px;
  }
  
  .nav-btn {
    padding: 10px 20px;
    font-size: 14px;
    min-width: 100px;
  }
  
  .navigation-buttons {
    bottom: 20px;
  }
  
  .language-switcher {
    top: 12px;
    left: 12px;
    padding: 3px;
    width: 120px;
    height: 36px;
  }
  
  .lang-btn {
    height: 30px;
    line-height: 30px;
    font-size: 12.5px;
  }
  
  .lang-btn.en {
    font-size: 12px;
  }
  
  .lang-btn.th {
    font-size: 12px;
    font-weight: 600;
  }
}

/* ส่วนอื่นๆ ของเว็บไซต์ */
body:lang(th) {
  font-family: var(--th-body, 'Kanit', 'Sarabun', sans-serif);
}

body:lang(th) h1,
body:lang(th) h2,
body:lang(th) h3,
body:lang(th) .hero-title,
body:lang(th) .story-title,
body:lang(th) .ending-title,
body:lang(th) .ebook-title,
body:lang(th) .nav-btn,
body:lang(th) .action-btn,
body:lang(th) button {
  font-family: var(--th-heading, 'Kanit', sans-serif);
  font-weight: 600;
}

/* Animation สำหรับการเปลี่ยนภาษา */
.lang-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tooltip สำหรับปุ่มภาษา */
.language-switcher::after {
  content: 'Press L to switch language';
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
}

.language-switcher:hover::after {
  opacity: 1;
}

@media (max-width: 768px) {
  .language-switcher::after {
    display: none;
  }
}
</style>