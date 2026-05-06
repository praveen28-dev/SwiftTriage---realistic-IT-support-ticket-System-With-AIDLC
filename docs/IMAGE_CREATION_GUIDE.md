# SwiftTriage Image Creation Guide

**Date**: May 5, 2026  
**Version**: 1.0  
**Purpose**: Complete guide for creating all required images for SwiftTriage

---

## Overview

This guide provides specifications, templates, and instructions for creating all images needed for SwiftTriage, including favicons, social media images, and logos.

---

## 1. Favicon Set (5 Required Sizes)

### 📐 Specifications

| File Name | Size | Format | Purpose |
|-----------|------|--------|---------|
| `favicon-16x16.png` | 16x16px | PNG | Browser tab (small) |
| `favicon-32x32.png` | 32x32px | PNG | Browser tab (standard) |
| `apple-touch-icon.png` | 180x180px | PNG | iOS home screen |
| `android-chrome-192x192.png` | 192x192px | PNG | Android home screen |
| `android-chrome-512x512.png` | 512x512px | PNG | Android splash screen |

### 🎨 Design Guidelines

**Icon Design**:
- Use the lightning bolt icon (⚡) as the primary symbol
- Background: Primary blue gradient (#1565C0 to #104E7E)
- Icon color: White (#FFFFFF)
- Style: Modern, flat design with subtle shadow
- Padding: 15% on all sides for breathing room

**Color Palette**:
- Primary: `#1565C0` (var(--primary-600))
- Dark: `#104E7E` (var(--primary-700))
- White: `#FFFFFF`

### 🛠️ Creation Tools

**Option 1: Figma** (Recommended)
1. Create 512x512px artboard
2. Add gradient background (135° angle, #1565C0 to #104E7E)
3. Add lightning bolt icon (white, centered, 60% of canvas)
4. Add subtle shadow (0px 4px 8px rgba(0,0,0,0.2))
5. Export at all required sizes

**Option 2: Canva**
1. Use "Logo" template (500x500px)
2. Add gradient background
3. Add lightning bolt icon from elements
4. Download as PNG
5. Resize using online tool (e.g., iloveimg.com)

**Option 3: Online Favicon Generator**
- [Favicon.io](https://favicon.io/) - Generate from text or image
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Multi-platform favicons
- Upload 512x512px source image
- Download generated package

### 📝 SVG Template (Scalable)

Save this as `public/icon.svg` for reference:

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradient Background -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1565C0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#104E7E;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#bgGradient)"/>
  
  <!-- Lightning Bolt Icon -->
  <path d="M280 80L160 280H240L200 432L360 232H280L320 80Z" 
        fill="white" 
        stroke="white" 
        stroke-width="8" 
        stroke-linejoin="round"/>
</svg>
```

### 📂 File Placement

All favicon files go in the `public/` directory:
```
public/
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── icon.svg (optional, for reference)
```

---

## 2. Social Media Images

### A. Open Graph Image (Facebook, LinkedIn)

**File**: `public/og-image.png`

**Specifications**:
- Size: 1200x630px
- Format: PNG or JPG
- Max file size: 8 MB (aim for < 300 KB)
- Aspect ratio: 1.91:1

**Design Layout**:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Logo]  SwiftTriage                                    │
│                                                         │
│                                                         │
│         AI-Powered IT Service Management                │
│                                                         │
│         Transform your IT support with AI-powered       │
│         ticket triage and real-time analytics           │
│                                                         │
│                                                         │
│  ⚡ AI Triage    📊 Analytics    🔒 Secure              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design Guidelines**:
- Background: Gradient (primary blue #1565C0 to #104E7E)
- Text: White, centered
- Logo: Top left, 80x80px
- Headline: 48px, bold (Inter font)
- Subheadline: 32px, regular
- Icons: 40px, bottom section
- Padding: 80px on all sides

**Figma Template**:
1. Create 1200x630px frame
2. Add gradient background
3. Add logo (80x80px, top left, 80px padding)
4. Add "SwiftTriage" text (48px, bold, white)
5. Add headline (72px, black weight, centered)
6. Add subheadline (36px, regular, centered, 80% opacity)
7. Add 3 feature icons with labels (bottom, centered)
8. Export as PNG (2x for retina)

### B. Twitter Card Image

**File**: `public/twitter-image.png`

**Specifications**:
- Size: 1200x600px (or 1200x675px for larger card)
- Format: PNG or JPG
- Max file size: 5 MB (aim for < 300 KB)
- Aspect ratio: 2:1 (or 16:9)

**Design**: Similar to Open Graph but adjusted for Twitter's aspect ratio

**Alternative**: Use the same OG image (1200x630px) - Twitter will crop slightly

---

## 3. Logo Files

### A. Primary Logo (PNG)

**File**: `public/logo.png`

**Specifications**:
- Size: 512x512px (high resolution)
- Format: PNG with transparency
- Background: Transparent
- Use: Website, documentation, presentations

**Design**:
- Lightning bolt icon: Primary blue (#1565C0)
- Optional: Add "SwiftTriage" text below icon
- Style: Clean, modern, professional

### B. Logo (SVG)

**File**: `public/logo.svg`

**Specifications**:
- Format: SVG (vector, scalable)
- Background: Transparent
- Use: Website (preferred for web), print materials

**SVG Template**:

```svg
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Lightning Bolt -->
  <path d="M110 30L60 110H95L75 170L140 90H105L125 30Z" 
        fill="#1565C0" 
        stroke="#1565C0" 
        stroke-width="4" 
        stroke-linejoin="round"/>
  
  <!-- Optional: Add text -->
  <!-- <text x="100" y="190" font-family="Inter" font-size="24" font-weight="bold" 
        text-anchor="middle" fill="#1A202C">SwiftTriage</text> -->
</svg>
```

### C. Logo Variations

Create these variations for different use cases:

1. **Logo + Text (Horizontal)**
   - Size: 400x100px
   - Layout: Icon (left) + "SwiftTriage" text (right)
   - Use: Website header, email signatures

2. **Logo + Text (Vertical)**
   - Size: 200x250px
   - Layout: Icon (top) + "SwiftTriage" text (bottom)
   - Use: Mobile apps, square spaces

3. **Logo (Icon Only)**
   - Size: 200x200px
   - Layout: Just the lightning bolt
   - Use: App icons, small spaces

4. **Logo (White Version)**
   - Same as above but white color
   - Use: Dark backgrounds

---

## 4. Screenshot Images (Optional)

### A. Dashboard Screenshot

**File**: `public/screenshot-dashboard.png`

**Specifications**:
- Size: 1280x720px (16:9 aspect ratio)
- Format: PNG
- Use: PWA manifest, marketing materials

**How to Create**:
1. Open SwiftTriage dashboard in browser
2. Set browser window to 1280x720px
3. Take screenshot (Windows: Win+Shift+S, Mac: Cmd+Shift+4)
4. Crop to exact size
5. Optimize with TinyPNG or similar

### B. Submit Ticket Screenshot

**File**: `public/screenshot-submit.png`

**Specifications**: Same as dashboard screenshot

### C. Analytics Screenshot

**File**: `public/screenshot-analytics.png`

**Specifications**: Same as dashboard screenshot

---

## 5. Quick Creation Workflow

### 🚀 Fast Track (30 minutes)

**Step 1: Create Master Icon (10 min)**
1. Use Figma or Canva
2. Create 512x512px artboard
3. Add gradient background
4. Add white lightning bolt icon
5. Export as PNG

**Step 2: Generate Favicons (5 min)**
1. Go to [RealFaviconGenerator.net](https://realfavicongenerator.net/)
2. Upload 512x512px PNG
3. Customize settings (optional)
4. Download package
5. Extract files to `public/` directory

**Step 3: Create Social Images (10 min)**
1. Use Canva "Facebook Post" template (1200x630px)
2. Add gradient background
3. Add logo and text
4. Export as PNG
5. Rename to `og-image.png` and `twitter-image.png`

**Step 4: Create Logo SVG (5 min)**
1. Copy SVG template from this guide
2. Save as `public/logo.svg`
3. Test in browser

---

## 6. Image Optimization

### 🗜️ Compression Tools

**Online Tools**:
- [TinyPNG](https://tinypng.com/) - PNG compression (up to 70% reduction)
- [Squoosh](https://squoosh.app/) - Advanced image optimization
- [ImageOptim](https://imageoptim.com/) - Mac app for batch optimization

**Optimization Tips**:
- Compress all PNG files (aim for < 100 KB for favicons)
- Use PNG for icons and logos (transparency)
- Use JPG for photos and screenshots (smaller file size)
- Use WebP for modern browsers (best compression)

### 📊 Target File Sizes

| Image Type | Target Size | Max Size |
|------------|-------------|----------|
| Favicon 16x16 | < 5 KB | 10 KB |
| Favicon 32x32 | < 10 KB | 20 KB |
| Favicon 180x180 | < 30 KB | 50 KB |
| Favicon 192x192 | < 40 KB | 60 KB |
| Favicon 512x512 | < 80 KB | 150 KB |
| OG Image | < 200 KB | 300 KB |
| Twitter Image | < 200 KB | 300 KB |
| Logo PNG | < 50 KB | 100 KB |
| Logo SVG | < 10 KB | 20 KB |
| Screenshots | < 300 KB | 500 KB |

---

## 7. Testing Images

### ✅ Favicon Testing

**Browser Test**:
1. Clear browser cache
2. Open `http://localhost:3000`
3. Check browser tab for favicon
4. Test in Chrome, Firefox, Safari, Edge

**Mobile Test**:
1. Add to home screen (iOS/Android)
2. Check icon appearance
3. Verify correct size and clarity

### ✅ Social Media Testing

**Open Graph Test**:
1. Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Enter your URL
3. Click "Scrape Again"
4. Verify image appears correctly

**Twitter Card Test**:
1. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. Enter your URL
3. Verify card preview

**LinkedIn Test**:
1. Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
2. Enter your URL
3. Verify preview

---

## 8. Placeholder Images (Temporary)

Until you create actual images, use these placeholders:

### Placeholder Favicon (SVG)

Save as `public/favicon.svg`:

```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="4" fill="#1565C0"/>
  <path d="M17 8L12 17H15L13 24L21 15H18L20 8Z" fill="white"/>
</svg>
```

### Placeholder OG Image

Use a solid color with text:
- Background: #1565C0
- Text: "SwiftTriage - AI-Powered IT Service Management"
- Size: 1200x630px

---

## 9. Design Resources

### 🎨 Design Tools

**Free**:
- [Figma](https://figma.com) - Professional design tool (free tier)
- [Canva](https://canva.com) - Easy-to-use templates (free tier)
- [Inkscape](https://inkscape.org) - Free vector graphics editor
- [GIMP](https://gimp.org) - Free image editor

**Paid**:
- Adobe Illustrator - Professional vector graphics
- Adobe Photoshop - Professional image editing
- Sketch - Mac-only design tool

### 🖼️ Icon Resources

**Free Icons**:
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
- [Lucide](https://lucide.dev/) - Icon library (used in SwiftTriage)
- [Feather Icons](https://feathericons.com/) - Simply beautiful icons
- [Font Awesome](https://fontawesome.com/) - Icon library

### 🎨 Color Tools

- [Coolors](https://coolors.co/) - Color palette generator
- [Adobe Color](https://color.adobe.com/) - Color wheel and schemes
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - WCAG compliance

---

## 10. Checklist

### ✅ Required Images

- [ ] `favicon-16x16.png` (16x16px)
- [ ] `favicon-32x32.png` (32x32px)
- [ ] `apple-touch-icon.png` (180x180px)
- [ ] `android-chrome-192x192.png` (192x192px)
- [ ] `android-chrome-512x512.png` (512x512px)
- [ ] `og-image.png` (1200x630px)
- [ ] `twitter-image.png` (1200x600px)
- [ ] `logo.png` (512x512px)
- [ ] `logo.svg` (vector)

### ✅ Optional Images

- [ ] `screenshot-dashboard.png` (1280x720px)
- [ ] `screenshot-submit.png` (1280x720px)
- [ ] `screenshot-analytics.png` (1280x720px)
- [ ] Logo variations (horizontal, vertical, white)

### ✅ Testing

- [ ] Favicons display in browser tabs
- [ ] Mobile home screen icons work
- [ ] Open Graph preview on Facebook
- [ ] Twitter Card preview on Twitter
- [ ] LinkedIn preview works
- [ ] All images optimized (< target file size)

---

## 11. Next Steps

After creating images:

1. **Place files in `public/` directory**
2. **Test locally**: `npm run dev` and check browser tab
3. **Test social previews**: Use debugging tools
4. **Optimize images**: Compress with TinyPNG
5. **Commit to repository**: `git add public/ && git commit -m "Add brand images"`
6. **Deploy**: Images will be available at `https://swifttriage.com/[filename]`

---

## 12. Professional Design Services (Optional)

If you prefer professional design:

**Freelance Platforms**:
- [Fiverr](https://fiverr.com) - $5-$50 for logo/favicon set
- [Upwork](https://upwork.com) - $50-$500 for complete brand package
- [99designs](https://99designs.com) - Design contests ($299+)

**What to Request**:
- "Favicon set (5 sizes) for IT support software"
- "Social media images (OG + Twitter) for SaaS platform"
- "Logo design (PNG + SVG) with lightning bolt theme"
- Provide color palette: Primary #1565C0, Dark #104E7E, White #FFFFFF

---

## Conclusion

Creating professional images for SwiftTriage is straightforward with the right tools and templates. Use this guide to create all required images in under an hour, or hire a designer for a polished professional look.

**Priority Order**:
1. **Favicons** (most important - visible in every browser tab)
2. **Social Media Images** (important for sharing and marketing)
3. **Logo Files** (important for branding and documentation)
4. **Screenshots** (nice to have for PWA and marketing)

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**Status**: Ready for Implementation
