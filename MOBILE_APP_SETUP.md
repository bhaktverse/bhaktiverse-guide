# 📱 BhaktVerse Mobile App Setup Guide

## 🚀 Capacitor Integration Complete

Your React app now supports **native iOS and Android** development with Capacitor! The setup includes:

### ✅ Native Features Integrated
- **Push Notifications** - Spiritual reminders (aarti times, festivals)
- **Local Notifications** - Daily practice reminders  
- **Geolocation** - Find nearby temples
- **Camera** - Temple visits, community posts
- **Haptic Feedback** - Enhanced spiritual interactions
- **Splash Screen** - Branded app launch experience
- **Status Bar** - Customized with spiritual theme colors

### 📦 Dependencies Installed
```json
{
  "@capacitor/core": "latest",
  "@capacitor/cli": "latest", 
  "@capacitor/ios": "latest",
  "@capacitor/android": "latest",
  "@capacitor/splash-screen": "latest",
  "@capacitor/status-bar": "latest",
  "@capacitor/push-notifications": "latest",
  "@capacitor/local-notifications": "latest",
  "@capacitor/geolocation": "latest",
  "@capacitor/camera": "latest",
  "@capacitor/haptics": "latest"
}
```

### ⚙️ Configuration Created
- `capacitor.config.ts` - Main Capacitor configuration
- `src/services/mobileServices.ts` - Native functionality wrapper
- Mobile-optimized UI with `MobileBottomNav` component

## 🛠️ To Build Mobile Apps

### 1. Export to GitHub (Required First)
Click "Export to GitHub" button in Lovable to push your code to a repository.

### 2. Local Development Setup
```bash
# Clone your repository
git clone https://github.com/yourusername/bhaktiverse-guide
cd bhaktiverse-guide

# Install dependencies
npm install

# Add iOS and Android platforms
npx cap add ios      # Requires macOS with Xcode
npx cap add android  # Requires Android Studio

# Build the web app
npm run build

# Sync with native platforms
npx cap sync

# Open in native IDEs
npx cap run ios      # Opens Xcode (macOS only)  
npx cap run android  # Opens Android Studio
```

### 3. Platform-Specific Setup

#### iOS Requirements
- **macOS** with Xcode installed
- **Apple Developer Account** (for App Store)
- **iOS Simulator** or physical device

#### Android Requirements  
- **Android Studio** installed
- **Android SDK** configured
- **Android Emulator** or physical device

## 📱 Native Features Usage

### Spiritual Reminders
```typescript
import { MobileServices } from '@/services/mobileServices'

// Schedule morning aarti reminder
await MobileServices.scheduleAartiReminder(
  "🌅 Morning Aarti", 
  "Start your day with divine blessings",
  new Date(2024, 0, 15, 6, 0) // 6:00 AM
)

// Setup daily spiritual reminders
await MobileServices.scheduleDailyReminders({
  morningAarti: true,
  eveningAarti: true, 
  mantraReminder: true,
  meditationReminder: true
})
```

### Temple Finder with GPS
```typescript
// Get current location for nearby temples
const location = await MobileServices.getCurrentLocation()
console.log(`Lat: ${location.latitude}, Lng: ${location.longitude}`)
```

### Camera for Community Posts
```typescript
// Take photo for temple visit or spiritual experience
const photoDataUrl = await MobileServices.takePhoto()
// Upload to Supabase storage
```

### Haptic Feedback
```typescript
// Spiritual interaction feedback
await MobileServices.vibrate('light')   // Gentle mantra tap
await MobileServices.vibrate('medium')  // Prayer completion
await MobileServices.vibrate('heavy')   // Achievement unlock
```

## 📊 Mobile-Optimized UI

### Responsive Components
- **MobileBottomNav** - Touch-friendly navigation
- **Card layouts** - Optimized for mobile screens
- **Touch targets** - 44px minimum tap areas
- **Swipe gestures** - Native mobile interactions

### Mobile-First Design
- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Mobile-optimized spacing and typography
- Touch-friendly button sizes
- Proper safe area handling for notched devices

## 🔔 Push Notification Strategy

### Spiritual Engagement Notifications
- **Morning Aarti** - 6:00 AM daily
- **Evening Aarti** - 6:00 PM daily  
- **Festival Alerts** - Major spiritual festivals
- **Streak Reminders** - Maintain daily practice
- **Weekly Wisdom** - Spiritual quotes from saints

### Implementation Example
```typescript
// In your notification service
const notifications = [
  {
    title: "🕉️ Maha Shivratri Tonight",
    body: "Join the global celebration. Special prayers and darshan available.",
    data: { 
      type: "festival",
      festivalId: "maha-shivratri-2024"
    }
  }
]
```

## 🎨 Branding & Assets

### App Icons Needed
Create icons in these sizes:
- **iOS**: 1024x1024px (App Store), 180x180px (iPhone), 152x152px (iPad)
- **Android**: 512x512px (Play Store), various adaptive icon sizes

### Splash Screen
- Background color: `#FF9933` (Saffron)
- Logo: Om symbol with "BhaktVerse" text
- Duration: 2 seconds with fade transition

### Color Scheme
```css
Primary: #FF9933 (Saffron)
Secondary: #FFD700 (Gold) 
Accent: #E91E63 (Lotus Pink)
Background: Light spiritual gradients
```

## 🚀 Deployment Checklist

### iOS App Store
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect setup
- [ ] Privacy policy and terms of service
- [ ] App Store screenshots and metadata
- [ ] TestFlight beta testing

### Google Play Store  
- [ ] Google Play Console account ($25 one-time)
- [ ] Play Store listing assets
- [ ] Content rating questionnaire
- [ ] Privacy policy compliance
- [ ] Internal testing track

## 🔐 Native Security

### Secure Storage
```typescript
// Store sensitive spiritual data securely
import { SecureStoragePlugin } from '@capacitor-community/secure-storage'

// Save user's spiritual preferences
await SecureStoragePlugin.set({
  key: 'spiritual_preferences',
  value: JSON.stringify(userPreferences)
})
```

### Biometric Authentication
```typescript
// Optional: Add biometric login for enhanced security
import { BiometricAuth } from '@capacitor-community/biometric-auth'

const result = await BiometricAuth.checkBiometry()
if (result.isAvailable) {
  // Enable Touch ID / Face ID login
}
```

Your BhaktVerse app is now ready for native mobile deployment! 🙏📱