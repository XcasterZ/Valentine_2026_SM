<!-- Gallery.vue - Responsive แบบ 2 หน้าบน iPad, 1 หน้าบนมือถือ -->
<template>
  <section 
    class="gallery-section" 
    :class="{ 'section-active': isActive, 'section-inactive': !isActive }"
    ref="sectionRef"
  >
    <!-- พื้นหลัง -->
    <div class="book-bg"></div>
    
    <!-- Container หลัก -->
    <div class="ebook-container">
      <!-- Header -->
      <div class="ebook-header" :style="headerStyle">
        <h2 class="ebook-title">
          <span class="title-line">{{ t('titleLine1') }}</span>
          <span class="title-line">{{ t('titleLine2') }}</span>
        </h2>
        <p class="ebook-subtitle">{{ t('subtitle') }}</p>
        <div class="page-counter">{{ currentPage }}/{{ totalPages }}</div>
      </div>
      
      <!-- หนังสือ - ใช้ CSS Media Query ควบคุม -->
      <div class="book-wrapper" ref="bookWrapperRef" :class="{ 'single-page': isMobileView }">
        <!-- หน้าซ้าย - แสดงบน iPad ขึ้นไป -->
        <div 
          class="book-page left-page" 
          ref="leftPageRef"
          :class="{ 
            'has-content': currentPage > 1,
            'mobile-hidden': isMobileView && currentPage === 1,
            'desktop-visible': !isMobileView
          }"
        >
          <div class="page-content">
            <div class="page-image">
              <img 
                v-if="photos[currentPage - 2] && currentPage > 1" 
                :src="photos[currentPage - 2].url" 
                :alt="photos[currentPage - 2].title"
                class="vertical-photo"
                ref="leftImageRef"
              />
              <div v-else class="empty-page">
                <div class="cover-design">
                  <div class="cover-heart">📖</div>
                  <h3>{{ t('coverTitle') }}</h3>
                  <p>{{ photos.length }} {{ t('moments') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="page-number left-number" v-if="currentPage > 1">{{ currentPage - 1 }}</div>
        </div>
        
        <!-- หน้าขวา - แสดงตลอด -->
        <div 
          class="book-page right-page" 
          ref="rightPageRef"
          :class="{ 
            'has-content': true,
            'mobile-single': isMobileView
          }"
        >
          <div class="page-content">
            <div class="page-image">
              <img 
                v-if="photos[currentPage - 1]" 
                :src="photos[currentPage - 1].url" 
                :alt="photos[currentPage - 1].title"
                class="vertical-photo"
                ref="rightImageRef"
              />
              <div v-else class="empty-page">
                <div class="cover-design">
                  <div class="cover-heart">❤️</div>
                  <h3>{{ t('welcomeTitle') }}</h3>
                  <p>{{ t('openAlbum') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="page-number right-number">{{ currentPage }}</div>
        </div>
        
        <!-- หน้าซ้ายสำหรับ Mobile (เมื่อดูหน้าอื่นๆ) -->
        <div 
          class="book-page mobile-left-page" 
          v-if="isMobileView && currentPage > 1 && showMobileLeftPage"
          ref="mobileLeftPageRef"
        >
          <div class="page-content">
            <div class="page-image">
              <img 
                v-if="photos[currentPage - 2]" 
                :src="photos[currentPage - 2].url" 
                :alt="photos[currentPage - 2].title"
                class="vertical-photo"
              />
            </div>
          </div>
          <div class="page-number">{{ currentPage - 1 }}</div>
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="navigation">
        <!-- ปุ่มเลื่อนหน้า -->
        <div class="page-controls">
          <button class="nav-btn prev-btn" @click="prevPage" :disabled="currentPage <= 1">
            <span class="btn-icon">←</span>
            <span class="btn-text mobile-hide">{{ isMobileView ? t('prevShort') : t('previous') }}</span>
          </button>
          
          <div class="page-dots">
            <div v-for="page in totalPages" :key="page" class="dot" :class="{ active: page === currentPage }" @click="goToPage(page)"></div>
          </div>
          
          <button class="nav-btn next-btn" @click="nextPage" :disabled="currentPage >= totalPages">
            <span class="btn-text mobile-hide">{{ t('next') }}</span>
            <span class="btn-icon">→</span>
          </button>
        </div>
        
        <!-- Mobile swipe hint -->
        <div class="swipe-hint" v-if="isMobileView">
          <span class="swipe-icon">← →</span>
          <span class="swipe-text">{{ t('swipeHint') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

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
  showNext: {
    type: Boolean,
    default: true
  },
  lang: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['next', 'prev'])

// ข้อความภาษาต่างๆ
const translations = {
  en: {
    titleLine1: 'Our',
    titleLine2: 'Memories',
    subtitle: 'A digital photo album',
    coverTitle: 'Our Love Story',
    moments: 'moments',
    welcomeTitle: 'Welcome',
    openAlbum: 'Open the album',
    previous: 'Previous',
    next: 'Next',
    prevShort: 'Prev',
    swipeHint: 'Swipe to navigate'
  },
  th: {
    titleLine1: 'ความทรงจำ',
    titleLine2: 'ของเรา',
    subtitle: 'อัลบั้มภาพดิจิทัล',
    coverTitle: 'เรื่องราวความรักของเรา',
    moments: 'ช่วงเวลา',
    welcomeTitle: 'ยินดีต้อนรับ',
    openAlbum: 'เปิดอัลบั้ม',
    previous: 'ก่อนหน้า',
    next: 'ถัดไป',
    prevShort: 'ก่อนหน้า',
    swipeHint: 'ปัดเพื่อเลื่อน'
  }
}

// Function สำหรับแปลภาษา
const t = (key) => {
  return translations[props.lang][key] || key
}

// Refs
const sectionRef = ref(null)
const bookWrapperRef = ref(null)
const leftPageRef = ref(null)
const rightPageRef = ref(null)
const mobileLeftPageRef = ref(null)
const leftImageRef = ref(null)
const rightImageRef = ref(null)

// State
const currentPage = ref(1)
const isAnimating = ref(false)
const isMobileView = ref(false)
const showMobileLeftPage = ref(false)
const windowWidth = ref(window.innerWidth)

// ข้อมูลรูปภาพ
const photos = ref([
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'First Sunset Together',
    date: 'June 15, 2020',
    description: 'Watching the sunset hand in hand'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'Coffee Shop Date',
    date: 'July 20, 2020',
    description: 'Our favorite corner table'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'Mountain Adventure',
    date: 'August 7, 2020',
    description: 'Reaching new heights together'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'Beach Day',
    date: 'September 12, 2020',
    description: 'Building sandcastles by the shore'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'Autumn Colors',
    date: 'October 30, 2020',
    description: 'Walking through fallen leaves'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'Winter Warmth',
    date: 'December 24, 2020',
    description: 'First Christmas by the fireplace'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'Spring Blooms',
    date: 'March 21, 2021',
    description: 'Cherry blossoms and new beginnings'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=600&fit=crop',
    title: 'Summer Nights',
    date: 'July 4, 2021',
    description: 'Stargazing till dawn'
  }
])

// Computed
const totalPages = computed(() => photos.value.length)
// const headerStyle = computed(() => ({
//   transform: `translateY(${props.isActive ? props.scrollProgress * 0.1 : 0}px)`,
//   opacity: props.isActive ? 1 - (props.scrollProgress * 0.01) : 0
// }))

// ตรวจสอบหน้าจอ
const checkViewport = () => {
  windowWidth.value = window.innerWidth
  // iPad ขึ้นไป (768px+) = 2 หน้า, มือถือ = 1 หน้า
  isMobileView.value = windowWidth.value < 768
  
  console.log('Viewport check:', {
    windowWidth: windowWidth.value,
    isMobileView: isMobileView.value,
    isAnimating: isAnimating.value
  })
  
  // Reset transforms when viewport changes
  if (leftPageRef.value && rightPageRef.value && !isAnimating.value) {
    resetPageTransforms()
  }
}

// Animation functions แบบ Responsive
const animatePageTurn = (direction) => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  
  if (!isMobileView.value) {
    // Desktop/iPad: Animation แบบหนังสือ 2 หน้า
    animateTwoPageTurn(direction)
  } else {
    // Mobile: Animation แบบเลื่อนหน้าเดียว
    animateSinglePageTurn(direction)
  }
}

const animateTwoPageTurn = (direction) => {
  if (!leftPageRef.value || !rightPageRef.value) return
  
  const leftPage = leftPageRef.value
  const rightPage = rightPageRef.value
  
  leftPage.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  rightPage.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  
  if (direction === 'next') {
    leftPage.style.transform = 'rotateY(-150deg) translateX(-20px)'
    leftPage.style.opacity = '0'
    rightPage.style.transform = 'rotateY(-10deg) translateX(-20px)'
    rightPage.style.zIndex = '1'
  } else {
    rightPage.style.transform = 'rotateY(150deg) translateX(20px)'
    rightPage.style.opacity = '0'
    leftPage.style.transform = 'rotateY(10deg) translateX(20px)'
    leftPage.style.zIndex = '2'
  }
  
  setTimeout(() => {
    resetPageTransforms()
    isAnimating.value = false
  }, 600)
}

const animateSinglePageTurn = async (direction) => {
  const currentPageEl = direction === 'next' ? rightPageRef.value : leftPageRef.value
  const nextPageEl = direction === 'next' ? leftPageRef.value : rightPageRef.value
  
  if (!currentPageEl) return
  
  // Animation หน้าเดิมออก
  currentPageEl.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  currentPageEl.style.transform = direction === 'next' 
    ? 'translateX(-100%)' 
    : 'translateX(100%)'
  currentPageEl.style.opacity = '0'
  
  // สำหรับหน้า 2 ขึ้นไปบนมือถือ ให้แสดง left page ด้วย
  if (direction === 'prev' && currentPage.value > 1 && isMobileView.value) {
    showMobileLeftPage.value = true
    if (mobileLeftPageRef.value) {
      mobileLeftPageRef.value.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      mobileLeftPageRef.value.style.transform = 'translateX(0)'
      mobileLeftPageRef.value.style.opacity = '1'
    }
  } else if (direction === 'next' && isMobileView.value) {
    showMobileLeftPage.value = false
  }
  
  setTimeout(() => {
    // Reset และแสดงหน้าต่อไป
    if (nextPageEl) {
      nextPageEl.style.transition = 'none'
      nextPageEl.style.transform = 'translateX(0)'
      nextPageEl.style.opacity = '1'
      void nextPageEl.offsetWidth
      nextPageEl.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }
    
    currentPageEl.style.transition = 'none'
    currentPageEl.style.transform = 'translateX(0)'
    currentPageEl.style.opacity = '0'
    
    isAnimating.value = false
  }, 500)
}

const resetPageTransforms = () => {
  if (!leftPageRef.value || !rightPageRef.value) return
  
  const leftPage = leftPageRef.value
  const rightPage = rightPageRef.value
  
  if (isMobileView.value) {
    // สำหรับ mobile
    leftPage.style.transition = 'none'
    rightPage.style.transition = 'none'
    
    leftPage.style.transform = ''
    rightPage.style.transform = ''
    leftPage.style.opacity = ''
    rightPage.style.opacity = ''
    leftPage.style.zIndex = ''
    rightPage.style.zIndex = ''
  } else {
    // สำหรับ desktop/iPad
    leftPage.style.transition = 'none'
    rightPage.style.transition = 'none'
    
    if (currentPage.value > 1) {
      leftPage.style.transform = 'rotateY(-5deg) translateX(-10px)'
      leftPage.style.opacity = '0.95'
    } else {
      leftPage.style.transform = 'rotateY(0deg) translateX(0)'
      leftPage.style.opacity = '1'
    }
    
    rightPage.style.transform = 'rotateY(5deg) translateX(10px)'
    rightPage.style.opacity = '1'
    rightPage.style.zIndex = '2'
    leftPage.style.zIndex = '1'
  }
  
  void leftPage.offsetWidth
  void rightPage.offsetWidth
  
  leftPage.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  rightPage.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
}

const animatePageChange = async (newPage, direction) => {
  if (isAnimating.value) return
  if (newPage === currentPage.value) return
  
  isAnimating.value = true
  
  // Trigger animation
  animatePageTurn(direction)
  
  // Wait for animation
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Change page
  const oldPage = currentPage.value
  currentPage.value = newPage
  
  // Update mobile left page visibility
  if (isMobileView.value) {
    showMobileLeftPage.value = newPage > 1
  }
  
  // Wait for DOM update
  await nextTick()
  
  // Image fade-in animation
  animateImagesFadeIn()
  
  // Reset animation flag
  setTimeout(() => {
    isAnimating.value = false
  }, 600)
}

const animateImagesFadeIn = () => {
  // สำหรับ desktop/iPad
  if (!isMobileView.value) {
    if (leftImageRef.value && currentPage.value > 1) {
      leftImageRef.value.style.opacity = '0'
      leftImageRef.value.style.transform = 'scale(0.95)'
      setTimeout(() => {
        if (leftImageRef.value) {
          leftImageRef.value.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
          leftImageRef.value.style.opacity = '1'
          leftImageRef.value.style.transform = 'scale(1)'
        }
      }, 100)
    }
    
    if (rightImageRef.value) {
      rightImageRef.value.style.opacity = '0'
      rightImageRef.value.style.transform = 'scale(0.95)'
      setTimeout(() => {
        if (rightImageRef.value) {
          rightImageRef.value.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
          rightImageRef.value.style.opacity = '1'
          rightImageRef.value.style.transform = 'scale(1)'
        }
      }, 100)
    }
  }
}

// Page navigation methods
const prevPage = async () => {
  if (currentPage.value <= 1 || isAnimating.value) return
  await animatePageChange(currentPage.value - 1, 'prev')
}

const nextPage = async () => {
  if (currentPage.value >= totalPages.value || isAnimating.value) return
  await animatePageChange(currentPage.value + 1, 'next')
}

const goToPage = async (page) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value || isAnimating.value) return
  
  const direction = page > currentPage.value ? 'next' : 'prev'
  await animatePageChange(page, direction)
}

// Initial book opening animation
const openBook = () => {
  if (!leftPageRef.value || !rightPageRef.value) return
  
  if (!isMobileView.value) {
    // Desktop/iPad: เปิดหนังสือ 2 หน้า
    leftPageRef.value.style.transform = 'rotateY(-90deg) translateX(-100px)'
    leftPageRef.value.style.opacity = '0'
    rightPageRef.value.style.transform = 'rotateY(90deg) translateX(100px)'
    rightPageRef.value.style.opacity = '0'
    
    setTimeout(() => {
      if (leftPageRef.value && rightPageRef.value) {
        leftPageRef.value.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        rightPageRef.value.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
        
        if (currentPage.value > 1) {
          leftPageRef.value.style.transform = 'rotateY(-5deg) translateX(-10px)'
        } else {
          leftPageRef.value.style.transform = 'rotateY(0deg) translateX(0)'
        }
        leftPageRef.value.style.opacity = currentPage.value > 1 ? '0.95' : '1'
        
        rightPageRef.value.style.transform = 'rotateY(5deg) translateX(10px)'
        rightPageRef.value.style.opacity = '1'
      }
    }, 100)
  } else {
    // Mobile: แสดงหน้าเดียว
    rightPageRef.value.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    rightPageRef.value.style.opacity = '1'
  }
}

// Auto page change based on scroll progress
// watch(() => props.scrollProgress, (progress) => {
//   if (!props.isActive || isAnimating.value) return
  
//   const targetPage = Math.ceil((progress / 100) * totalPages.value)
//   if (targetPage !== currentPage.value && targetPage >= 1 && targetPage <= totalPages.value) {
//     const direction = targetPage > currentPage.value ? 'next' : 'prev'
//     animatePageChange(targetPage, direction)
//   }
// })

// When section becomes active
watch(() => props.isActive, (isActive) => {
  if (isActive && currentPage.value === 1) {
    setTimeout(() => {
      openBook()
    }, 300)
  }
}, { immediate: true })

// Handle window resize
const handleResize = () => {
  checkViewport()
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!props.isActive || isAnimating.value) return
  
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevPage()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextPage()
  }
}

// Wheel navigation
const handleWheel = (e) => {
  if (!props.isActive || !sectionRef.value || isAnimating.value) return
  
  const rect = sectionRef.value.getBoundingClientRect()
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    e.preventDefault()
    
    if (e.deltaY > 0) {
      nextPage()
    } else if (e.deltaY < 0) {
      prevPage()
    }
  }
}

// Touch/swipe for mobile
let touchStartX = 0
let touchStartY = 0
const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchEnd = (e) => {
  if (!props.isActive || isAnimating.value) return
  
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const diffX = touchStartX - touchEndX
  const diffY = touchStartY - touchEndY
  
  // ถ้า swipe ในแนวนอนและไม่ใช่ vertical swipe
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0 && currentPage.value < totalPages.value) {
      // Swipe left - next page
      nextPage()
    } else if (diffX < 0 && currentPage.value > 1) {
      // Swipe right - previous page
      prevPage()
    }
  }
}

// Event listeners
onMounted(() => {
  checkViewport()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchend', handleTouchEnd, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.gallery-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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

.book-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(108, 92, 231, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(255, 107, 107, 0.08) 0%, transparent 50%);
  z-index: 1;
}

.ebook-container {
  position: relative;
  z-index: 2;
  max-width: 1000px;
  height: 100vh;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* Header */
.ebook-header {
  text-align: center;
  padding: 20px 0 15px;
  transition: all 0.8s ease;
  flex-shrink: 0;
}

.ebook-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #2d3436;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  line-height: 0.9;
}

.title-line {
  display: block;
}

.ebook-subtitle {
  font-size: 1.1rem;
  color: #636e72;
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: 0.8rem;
}

.page-counter {
  display: inline-block;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c5ce7;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* หนังสือ */
.book-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  perspective: 2000px;
  padding: 20px 0;
  position: relative;
}

/* เมื่อไม่ใช่ mobile view ให้แสดง 2 หน้า */
.book-wrapper:not(.single-page) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 40px !important;
}

.book-wrapper:not(.single-page) .book-page {
  position: relative !important;
  transform: none !important;
  opacity: 1 !important;
  display: block !important;
}

/* สำหรับ left page ใน desktop */
.desktop-visible {
  display: block !important;
  visibility: visible !important;
}

/* Desktop/iPad (768px ขึ้นไป) - หนังสือ 2 หน้า */
.book-page {
  position: absolute;
  background: white;
  border-radius: 4px 8px 8px 4px;
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(0, 0, 0, 0.05),
    inset 1px 0 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.left-page {
  width: 45%;
  max-width: 320px;
  height: 65vh;
  max-height: 550px;
  transform-origin: right center;
  z-index: 1;
}

.right-page {
  width: 45%;
  max-width: 320px;
  height: 65vh;
  max-height: 550px;
  transform-origin: left center;
  z-index: 2;
}

.has-content {
  background: linear-gradient(to right, #fafafa 0%, #ffffff 5%, #ffffff 95%, #f5f5f5 100%);
}

/* iPad (768px-1024px) - แสดง 2 หน้า */
@media (min-width: 768px) and (max-width: 1024px) {
  .ebook-container {
    padding: 20px;
  }
  
  .book-wrapper {
    gap: 30px !important;
  }
  
  .left-page, .right-page {
    width: 42%;
    height: 60vh;
    max-height: 500px;
    position: relative !important;
    left: auto !important;
    right: auto !important;
    transform: none !important;
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }
  
  /* 3D effect เฉพาะ iPad */
  .left-page {
    transform: rotateY(-5deg) translateX(-10px) !important;
    opacity: 0.95 !important;
  }
  
  .right-page {
    transform: rotateY(5deg) translateX(10px) !important;
  }
  
  .page-content {
    padding: 20px;
  }
  
  .mobile-left-page {
    display: none !important;
  }
  .page-controls {
    flex-direction: row !important;
  }
  
  .mobile-hide {
    display: inline !important;
  }
}

/* Mobile (น้อยกว่า 768px) - หนังสือหน้าเดียว */
@media (max-width: 767px) {
  .book-wrapper.single-page {
    perspective: none;
    flex-direction: column;
    gap: 20px;
  }
  
  .book-wrapper.single-page .left-page,
  .book-wrapper.single-page .right-page {
    position: relative;
    width: 85%;
    max-width: 300px;
    height: 55vh;
    transform: none !important;
    margin: 0 auto;
    border-radius: 8px;
    box-shadow: 
      0 10px 25px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }
  
  .book-wrapper.single-page .left-page.mobile-hidden {
    display: none;
  }
  
  .book-wrapper.single-page .right-page.mobile-single {
    width: 85%;
    transform: none !important;
    opacity: 1 !important;
    z-index: 1;
  }
  
  /* Mobile left page สำหรับแสดงเมื่อไม่ใช่หน้าแรก */
  .mobile-left-page {
    position: absolute !important;
    width: 85% !important;
    max-width: 300px !important;
    height: 55vh !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 0 !important;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .book-wrapper.single-page .left-page:not(.mobile-hidden) {
    position: absolute;
    left: -100%;
    opacity: 0;
  }
}

/* เนื้อหาในหน้า */
.page-content {
  width: 100%;
  height: 100%;
  padding: 25px;
  display: flex;
  flex-direction: column;
}

.page-image {
  flex: 1;
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  position: relative;
}

.vertical-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.empty-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dee2e6;
}

.cover-design {
  text-align: center;
  padding: 2rem;
}

.cover-heart {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.cover-design h3 {
  font-size: 1.8rem;
  color: #495057;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.cover-design p {
  font-size: 1rem;
  color: #868e96;
  opacity: 0.8;
}

/* ข้อมูลหน้า */
.page-info {
  text-align: center;
  padding: 0 10px;
}

.page-info h3 {
  font-size: 1.3rem;
  color: #2d3436;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.page-date {
  font-size: 0.95rem;
  color: #6c5ce7;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.page-description {
  font-size: 0.9rem;
  color: #636e72;
  line-height: 1.5;
  font-style: italic;
  margin-top: 0.5rem;
  padding-top: 0.8rem;
  border-top: 1px solid #f1f3f4;
}

/* หมายเลขหน้า */
.page-number {
  position: absolute;
  bottom: 15px;
  font-size: 0.85rem;
  color: #adb5bd;
  font-family: 'Georgia', serif;
  font-style: italic;
}

.left-number {
  right: 20px;
}

.right-number {
  left: 20px;
}

/* Navigation */
.navigation {
  flex-shrink: 0;
  padding: 20px 0 10px;
}

.page-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 15px;
}

@media (max-width: 767px) {
  .page-controls {
    gap: 15px;
  }
}

.nav-btn {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #dee2e6;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

@media (max-width: 767px) {
  .nav-btn {
    padding: 10px 20px;
    min-width: 100px;
    font-size: 0.9rem;
  }
}

.nav-btn:hover:not(.disabled) {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.nav-btn:active:not(.disabled) {
  transform: translateY(0);
}

.nav-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(248, 249, 250, 0.8);
}

.prev-btn {
  border-color: #74b9ff;
  color: #0984e3;
}

.next-btn {
  border-color: #55efc4;
  color: #00b894;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

@media (max-width: 767px) {
  .btn-icon {
    font-size: 1rem;
  }
}

.btn-text {
  font-size: 0.95rem;
}

@media (max-width: 767px) {
  .btn-text {
    font-size: 0.85rem;
  }
}

.page-dots {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(173, 181, 189, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.dot:hover {
  background: #74b9ff;
  transform: scale(1.2);
}

.dot.active {
  background: #6c5ce7;
  transform: scale(1.2);
  border-color: rgba(108, 92, 231, 0.3);
}

/* Mobile swipe hint */
.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  opacity: 0.7;
  animation: pulse 2s infinite;
}

.swipe-icon {
  font-size: 1.2rem;
  color: #6c5ce7;
}

.swipe-text {
  font-size: 0.85rem;
  color: #636e72;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

@media (min-width: 768px) {
  .swipe-hint {
    display: none;
  }
}

/* Responsive สำหรับ Tablet (iPad) */
@media (min-width: 768px) and (max-width: 1024px) {
  .ebook-container {
    padding: 15px;
  }
  
  .book-wrapper {
    perspective: 1500px;
  }
  
  .left-page, .right-page {
    width: 42%;
    height: 60vh;
  }
  
  .page-content {
    padding: 20px;
  }
  
  .ebook-title {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
  }
  
  .book-wrapper.single-page {
    flex-direction: row !important;
    gap: 30px !important;
  }
}

/* Responsive สำหรับ Mobile */
@media (max-width: 767px) {
  .page-controls {
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    width: 100%;
    gap: 10px !important;
  }
  
  .page-dots {
    order: 2; /* ให้อยู่ตรงกลาง */
    flex: 1;
    justify-content: center;
    margin: 0 10px;
  }
  
  .prev-btn {
    order: 1; /* ให้อยู่ซ้าย */
    margin-right: auto;
    min-width: 60px !important;
    padding: 10px 15px !important;
  }
  
  .next-btn {
    order: 3; /* ให้อยู่ขวา */
    margin-left: auto;
    min-width: 60px !important;
    padding: 10px 15px !important;
  }
  
  .mobile-hide {
    display: none !important;
  }
  
  .nav-btn {
    justify-content: center !important;
    width: auto !important;
    max-width: none !important;
  }
  
  .btn-icon {
    margin: 0 !important;
  }
}


@media (max-height: 700px) {
  .left-page, .right-page {
    height: 50vh;
    max-height: 400px;
  }
  
  .page-content {
    padding: 15px;
  }
  
  .ebook-header {
    padding: 10px 0 5px;
  }
  
  .navigation {
    padding: 15px 0 5px;
  }
}

/* Animation keyframes */
@keyframes bookOpen {
  0% {
    transform: rotateY(-90deg) translateX(-100px);
    opacity: 0;
  }
  100% {
    transform: rotateY(-10deg) translateX(-20px);
    opacity: 0.9;
  }
}

@keyframes pageFlipLeft {
  0% {
    transform: rotateY(-10deg) translateX(-20px);
  }
  50% {
    transform: rotateY(-150deg) translateX(-50px);
    opacity: 0.3;
  }
  100% {
    transform: rotateY(-10deg) translateX(-20px);
    opacity: 0.9;
  }
}

@keyframes pageFlipRight {
  0% {
    transform: rotateY(10deg) translateX(20px);
  }
  50% {
    transform: rotateY(150deg) translateX(50px);
    opacity: 0.3;
  }
  100% {
    transform: rotateY(10deg) translateX(20px);
    opacity: 1;
  }
}

@keyframes imageFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile slide animation */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* ป้องกัน text selection */
.book-page, .nav-btn {
  user-select: none;
}

/* ปรับปรุงสำหรับรูปแนวตั้ง */
.vertical-photo {
  object-position: center top;
}

/* สำหรับ iPad Pro (แนวตั้ง) 1024px ขึ้นไป */
@media (min-width: 1024px) {
  .left-page, .right-page {
    width: 45%;
    max-width: 320px;
  }
  
  .book-wrapper {
    gap: 50px !important;
  }
}

/* ปรับปรุงสำหรับการแสดงผล 2 หน้าบน iPad */
@media (min-width: 768px) {
  .book-wrapper {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: center !important;
  }
  
  .book-wrapper .left-page {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  .mobile-left-page {
    display: none !important;
  }
  
  /* 3D effect เฉพาะเมื่อไม่ใช่หน้าแรก */
  .book-wrapper:not(.single-page) .left-page.has-content {
    transform: rotateY(-5deg) translateX(-10px) !important;
    opacity: 0.95 !important;
  }
  
  .book-wrapper:not(.single-page) .right-page {
    transform: rotateY(5deg) translateX(10px) !important;
  }
}

/* สำหรับภาษาไทย */
:global(body:lang(th)) .ebook-title,
:global(body:lang(th)) .ebook-subtitle,
:global(body:lang(th)) .cover-design h3,
:global(body:lang(th)) .cover-design p,
:global(body:lang(th)) .nav-btn,
:global(body:lang(th)) .swipe-text {
  font-family: 'Kanit', 'Sarabun', sans-serif;
}

:global(body:lang(th)) .ebook-title {
  line-height: 1.1;
}
</style>