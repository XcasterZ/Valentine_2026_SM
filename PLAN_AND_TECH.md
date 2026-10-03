# 🌌 Plan & Tech Specification: "The Celestial Memories"
> **1-Page Award-Winning Valentine Interactive Experience**
> Dedicated to **ตุ้ย (Tui) & สายไหม (Saimai)** ❤️
> Target Standard: **Awwwards Site of the Day / FWA of the Day / CSSDA**

---

## 1. Executive Summary & Concept

- **Core Concept**: *"The Celestial Memories" (ห้วงจักรวาลความทรงจำนิรันดร์)*
- **UX Paradigm**: **Non-scrollable 1-Page Viewport (100vw × 100vh)** โดยที่หน้าต่างเว็บจะล็อก `overflow: hidden` ถาวร ไม่มีการเลื่อน Document แบบเว็บทั่วไป แต่ใช้การหมุนลูกกลิ้งเมาส์ (Mouse Wheel), การปัดนิ้ว (Touch Swipe) หรือการลาก (Drag) ทำหน้าที่เป็น **Timeline Scrubber** ขับเคลื่อนการเดินทางของกล้อง 3D และเนื้อหาจากจุดเริ่มต้นสู่อนันต์ (Progress 0.000 ➔ 1.000)
- **Visual Mood & Tone**: Luxury Romantic, Cinematic, Dreamy, Deep Space with Rose-Gold Stardust, Floating Glassmorphism

---

## 2. Tech Stack Selection & Justification

| Layer | Selected Tool | เหตุผลในการเลือก (Why this tool?) |
| :--- | :--- | :--- |
| **Bundler & Build Tool** | **Vite** (Modern ES Modules) | รวดเร็ว โหลดไว (HMR ในเสี้ยววินาที) บิลด์ไฟล์ WebGL และ assets ได้เบาและมีประสิทธิภาพสูงสุด |
| **Animation & Interaction Engine** | **GSAP 3** + **Observer Plugin** | **มาตรฐานระดับโลกสำหรับเว็บรางวัล**<br>• `Observer`: ดักจับ Delta ของ Wheel, Touch, และ Pointer ได้เนียนไร้รอยต่อ โดยไม่ต้องให้หน้าเว็บเลื่อนจริง<br>• `Timeline`: ผูกทุกการขยับของทั้ง 3D (Three.js) และ 2D DOM ให้วิ่งบนเวลาเดียวกันแบบ Sub-pixel accuracy |
| **3D & WebGL Graphics** | **Three.js** + **GLSL Shaders** | หัวใจของความอลังการระดับ Awwwards:<br>• เรนเดอร์อนุภาคละอองดาว (Stardust Particles) หลายหมื่นดวงแบบ 60-120fps<br>• เรนเดอร์ **3D Glass Crystal Heart** กลางอวกาศ<br>• สร้างอุโมงค์รูปถ่าย 3D (3D Curved Photo Tunnel) ลอยล่องในกาแล็กซี<br>• Custom Shaders: ภาพถ่ายมีเอฟเฟกต์แสงสะท้อนและระลอกคลื่น (Displacement / Ripple) เมื่อเลื่อนผ่าน |
| **Kinetic Typography** | **SplitType** | แยกตัวอักษรของข้อความรักซึ้งๆ ออกมาเป็น Character/Word เพื่อให้ลอยขึ้นมาทีละตัวแบบนิตยสารไฮเอนด์ |
| **Styling & Effects** | **Tailwind CSS** + Custom CSS | ใช้ทำ Glassmorphism (Backdrop blur, noise overlay, frosted glass), ปรับแต่ง Layout UI ที่ซ้อนทับบน 3D Canvas |
| **Audio Engine** | **Howler.js** / Web Audio API | ระบบเสียงดนตรีบรรเลงเปียโนโรแมนติกแบบ Ambient Loop + Sound Effects (Chimes / Starlight twinkle) เมื่อขยับผ่านความทรงจำ พร้อมปุ่ม Mute/Unmute และคลื่นเสียง Visualizer |
| **Interactive Physics / FX** | **Canvas-Confetti** & Custom Three.js Particle Burst | เอฟเฟกต์หัวใจระเบิดกระจายรอบทิศทางเมื่อกดปุ่มส่งความรักในฉากสุดท้าย |

---

## 3. Architecture & Interaction Blueprint

### 3.1 Interaction Loop (Virtual Scroll Engine)
```
[User Input: Wheel / Touch / Arrow Key]
                 │
                 ▼
      [GSAP Observer Plugin]
                 │
        (Normalize & Damping)
                 │
                 ▼
       [Virtual Progress: 0.000 -> 1.000]
                 │
         ┌───────┴────────────────────────┐
         ▼                                ▼
  [Three.js Scene]                 [DOM / UI Layer]
  • Camera Position Z/Y            • Title Split Reveal
  • 3D Photo Mesh Transforms       • Subtitles / Captions
  • Particle Flow & Lights         • Progress Indicator & Dots
  • Heart Mesh Rotation            • Interactive Letter Reveal
```

### 3.2 4-Act Cinematic Narrative Flow

#### 🌟 Act I: The Singularity of Love (จุดกำเนิดความรัก) — Progress: 0.00 - 0.20
- **Visual**: ความมืดมิดในอวกาศ ค่อยๆ ปรากฏละอองดาวประกายชมพูโรสโกลด์ หมุนวนรวมตัวกันเป็น **3D Crystal Heart** ลอยหมุนช้าๆ สะท้อนแสง
- **Typography**: ข้อความเปิดตัวปรากฏขึ้นด้วย Kinetic Reveal:
  - *"Happy Valentine's Day"*
  - *"Tui & Saimai — Our Universe of Two"*
- **Indicator**: ป้ายบอกใบ้เรืองแสง *"Scroll or swipe to travel through our time"*

#### 📸 Act II: Constellation of Memories (อุโมงค์ความทรงจำ 16 ภาพ) — Progress: 0.20 - 0.65
- **Visual**: กล้อง 3D พุ่งทะลุหัวใจเข้าสู่กาแล็กซีแห่งความทรงจำ
- **The 16 S3 Photos**:
  - ภาพทั้ง 16 ภาพถูกดึงจาก Amazon S3 มาแมปเป็น 3D Interactive Cards ลอยอยู่ในมิติโค้ง (Curved Cylinder / Helix Pathway)
  - มีมิติความลึก (Z-Depth) เมื่อเลื่อนผ่าน ภาพจะหมุนองศาเข้าหาผู้ใช้ พร้อมประกายแสงดาว
  - มีฟังก์ชัน **Click to Inspect**: คลิกที่รูปใดก็ได้เพื่อเปิดดูแบบ High-Res Lightbox คมชัด
- **Captions**: แต่ละรูปมีข้อความและวันที่สั้นๆ ลอยคลอคู่ไปกับภาพ

#### ✍️ Act III: Symphony of Promises (กลุ่มดาวแห่งคำสัญญา) — Progress: 0.65 - 0.85
- **Visual**: ภาพความทรงจำค่อยๆ ลอยห่างออกไป ดาวในฉากเรียงตัวกันเป็นเส้นแสงกลุ่มดาว (Constellation Lines)
- **Romantic Quotes**:
  - *"I love you not only for what you are, but for what I am when I am with you."*
  - *"ทุกช่วงเวลากับเธอคือสมบัติล้ำค่า ขอบคุณที่เป็นดั่งแสงตะวันและรักที่ยิ่งใหญ่ที่สุดของฉัน"*
- ข้อความตอบสนองต่อการขยับเมาส์ (Mouse Parallax) และ Gyroscope บนมือถือ

#### 💌 Act IV: The Eternal Horizon & Sealed Letter (บทสรุปและจดหมายรัก) — Progress: 0.85 - 1.00
- **Visual**: ฝนดาวตก (Shooting Stars) พาดผ่านท้องฟ้า มีซองจดหมาย 3D / Glass Card วางเด่นตรงกลาง
- **Interactive Love Letter**:
  - สามารถคลิกที่ซองจดหมายเพื่อคลี่ข้อความลับในใจ (Heartfelt Letter) ออกมาอ่าน
- **Interactive Button: "Send All My Love"**:
  - ปุ่มส่งหัวใจ เมื่อกดจะเกิด Particle Explosion (หัวใจนับร้อยดวงลอยกระจายทั่วจอ) พร้อมเสียงกริ๊งกระดิ่งแก้ว
- **Controls**:
  - ปุ่มสลับภาษา TH / EN
  - ปุ่มเปิด/ปิดเสียงดนตรีบรรเลง
  - ปุ่มย้อนกลับไปจุดเริ่มต้น (Restart Journey)

---

## 4. Visual Design System

- **Color Palette**:
  - **Void Obsidian**: `#06070B` (พื้นหลังอวกาศลึก)
  - **Nebula Pink**: `#FF4D79` & `#FF758F` (แสงนีออนชมพูความรัก)
  - **Champagne Gold**: `#E6C280` & `#F3E7C4` (สีทองแห่งความหรูหรา)
  - **Starlight White**: `#F8F9FA` (ตัวอักษรและประกายดาว)
- **Typography Hierarchy**:
  - Heading (English): *Cinzel Decorative* / *Playfair Display* (หรูหรา โอ่อ่า สไตล์ไฮเอนด์)
  - Heading (Thai): *Noto Serif Thai* / *Sarabun* / *Prompt* (นุ่มนวล โรแมนติก)
  - Body: *Plus Jakarta Sans* / *Montserrat* (อ่านง่าย ทันสมัย สบายตา)
- **Surface & Textures**:
  - Glassmorphic Cards (Backdrop filter blur 16px, border 1px solid rgba(255,255,255,0.12))
  - Subtle Film Grain Texture (เพิ่มความ cinematic เหมือนดูภาพยนตร์)

---

## 5. Project File Structure

```text
index.html                    <-- หน้า HTML หลัก
PLAN_AND_TECH.md              <-- แผนและสเปกฉบับนี้
src/
├── main.js                   <-- จุดเริ่มต้นและตัวควบคุมฉาก
├── assets/memories/          <-- ภาพความทรงจำทั้ง 16 ภาพ
├── scene/                    <-- ฉาก Three.js และแกลเลอรี 3D
├── interaction/              <-- ระบบเลื่อนและเคอร์เซอร์
├── audio/                    <-- ระบบเพลงและเสียง
├── data/                     <-- ข้อมูลภาพและข้อความ TH / EN
└── styles/                   <-- CSS และฟอนต์
```

---

## 6. Implementation Roadmap

1. **Phase 1: Setup & Data Modeling**
   - จัดเตรียมไฟล์โครงสร้าง และรวบรวมรูปภาพความทรงจำทั้ง 16 ภาพ + ข้อความของ "ตุ้ย & สายไหม" ลงใน `src/data/`
2. **Phase 2: Virtual Scroll & Timeline Controller**
   - ตั้งค่า GSAP Observer เพื่อแปลง Mouse Wheel และ Touch ให้เป็น Progress 0-1 ที่ลื่นไหล (Smooth Damping)
3. **Phase 3: Three.js World & Gallery 3D**
   - สร้างฉาก 3D ละอองดาว, 3D Heart Crystal และอุโมงค์ภาพถ่าย 16 ใบที่บินทะลุได้
4. **Phase 4: Cinematic UI Layer & Kinetic Typography**
   - ใส่ลูกเล่นข้อความลอยขึ้นและการ์ดซองจดหมายแบบกดเปิดได้
5. **Phase 5: Sound & Finishing Touches**
   - ใส่เสียงเพลงบรรเลง, รองรับ TH/EN, ปรับแต่ง Responsive ให้สวยสะกดตาบนทั้ง Desktop, iPad และ Mobile
