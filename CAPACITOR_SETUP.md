# Capacitor Setup Guide - Step by Step

Follow these steps to convert your BookStoa web app into native Android and iOS apps.

---

## Step 1: Install Capacitor Dependencies

Run these commands in your terminal:

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/filesystem @capacitor/share @capacitor/splash-screen @capacitor/status-bar @capacitor/app @capacitor/browser
```

**What this does:** Installs Capacitor core and platform-specific packages.

---

## Step 2: Initialize Capacitor

```bash
npx cap init "Pneuma BookStore" "org.christfaculty.books" --web-dir=dist
```

**What this does:** Creates Capacitor configuration with your app name and bundle ID.

**Note:** The bundle ID `org.christfaculty.books` should be unique. You can change it if needed.

---

## Step 3: Build Your Web App

```bash
npm run build
```

**What this does:** Creates the production build in the `dist` folder that Capacitor will use.

---

## Step 4: Add Android Platform

```bash
npx cap add android
```

**What this does:** Creates an Android project in the `android` folder.

**Requirements:**
- Android Studio installed
- Java JDK 17 or higher

**Download Android Studio:** https://developer.android.com/studio

---

## Step 5: Add iOS Platform (Mac Only)

```bash
npx cap add ios
```

**What this does:** Creates an iOS project in the `ios` folder.

**Requirements:**
- macOS computer
- Xcode installed

**Download Xcode:** From Mac App Store

---

## Step 6: Sync Your Code

Every time you make changes to your web app, run:

```bash
npm run cap:sync
```

**What this does:** Builds your web app and copies it to the native projects.

---

## Step 7: Open in Android Studio

```bash
npm run cap:open:android
```

**What this does:** Opens your Android project in Android Studio.

### In Android Studio:
1. Wait for Gradle sync to complete (first time takes 5-10 minutes)
2. Click the green "Run" button (▶️)
3. Select an emulator or connected device
4. Your app will launch!

---

## Step 8: Open in Xcode (Mac Only)

```bash
npm run cap:open:ios
```

**What this does:** Opens your iOS project in Xcode.

### In Xcode:
1. Select a simulator or device
2. Click the "Run" button (▶️)
3. Your app will launch!

---

## Quick Commands Reference

| Command | What it does |
|---------|-------------|
| `npm run android` | Build, sync, and open Android Studio |
| `npm run ios` | Build, sync, and open Xcode |
| `npm run cap:sync` | Sync web code to native projects |
| `npm run build` | Build web app only |

---

## Customizing Your App

### 1. App Icon

Replace these files with your app icon:
- **Android:** `android/app/src/main/res/mipmap-*/ic_launcher.png`
- **iOS:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Recommended tool:** https://icon.kitchen/ (generates all sizes)

### 2. Splash Screen

Replace these files:
- **Android:** `android/app/src/main/res/drawable*/splash.png`
- **iOS:** `ios/App/App/Assets.xcassets/Splash.imageset/`

### 3. App Name

Edit `capacitor.config.json`:
```json
{
  "appName": "Your App Name"
}
```

### 4. Bundle ID (Important!)

Edit `capacitor.config.json`:
```json
{
  "appId": "com.yourcompany.yourapp"
}
```

**Format:** Use reverse domain notation (e.g., `org.christfaculty.books`)

---

## Testing Your App

### Android Emulator:
1. Open Android Studio
2. Tools → Device Manager
3. Create a new virtual device
4. Select a device (e.g., Pixel 6)
5. Download a system image (e.g., Android 13)
6. Click "Run"

### iOS Simulator (Mac):
1. Open Xcode
2. Select a simulator from the device dropdown
3. Click "Run"

### Real Device:
- **Android:** Enable USB debugging in Developer Options
- **iOS:** Connect via USB and trust the computer

---

## Common Issues & Solutions

### Issue: "Android SDK not found"
**Solution:** 
1. Open Android Studio
2. Tools → SDK Manager
3. Install Android SDK Platform 33 or higher

### Issue: "Gradle sync failed"
**Solution:**
1. File → Invalidate Caches / Restart
2. Wait for re-sync

### Issue: "Command not found: cap"
**Solution:**
```bash
npm install -g @capacitor/cli
```

### Issue: Build fails with "dist folder not found"
**Solution:**
```bash
npm run build
```

---

## Publishing to App Stores

### Google Play Store:

1. **Create a signed APK/AAB:**
   - In Android Studio: Build → Generate Signed Bundle/APK
   - Create a keystore (save it securely!)
   - Build release version

2. **Create Google Play Developer Account:**
   - Go to https://play.google.com/console
   - Pay $25 one-time fee
   - Complete registration

3. **Upload your app:**
   - Create new app
   - Fill in app details
   - Upload AAB file
   - Submit for review

### Apple App Store:

1. **Create Apple Developer Account:**
   - Go to https://developer.apple.com
   - Pay $99/year
   - Complete registration

2. **Archive your app:**
   - In Xcode: Product → Archive
   - Wait for archive to complete

3. **Upload to App Store Connect:**
   - Window → Organizer
   - Select your archive
   - Click "Distribute App"
   - Follow the wizard

4. **Submit for review:**
   - Go to https://appstoreconnect.apple.com
   - Fill in app details
   - Submit for review

---

## App Store Assets Needed

### Screenshots:
- **Android:** 
  - Phone: 1080x1920 (at least 2)
  - Tablet: 1920x1080 (optional)
  
- **iOS:**
  - iPhone 6.7": 1290x2796
  - iPhone 6.5": 1242x2688
  - iPad Pro 12.9": 2048x2732

### Graphics:
- **Android:**
  - Feature graphic: 1024x500
  - App icon: 512x512
  
- **iOS:**
  - App icon: 1024x1024

### Text:
- App title (30 characters max)
- Short description (80 characters)
- Full description (4000 characters)
- Keywords
- Privacy policy URL

---

## Development Workflow

### Daily Development:
1. Make changes to your React code
2. Test in browser: `npm run dev`
3. When ready to test on mobile:
   ```bash
   npm run android  # or npm run ios
   ```

### Before Publishing:
1. Update version in `package.json`
2. Build production: `npm run build`
3. Sync: `npm run cap:sync`
4. Test thoroughly on real devices
5. Generate signed builds
6. Submit to stores

---

## Useful Capacitor Plugins

Already included:
- ✅ `@capacitor/filesystem` - File system access
- ✅ `@capacitor/share` - Native share dialog
- ✅ `@capacitor/splash-screen` - Splash screen control
- ✅ `@capacitor/status-bar` - Status bar styling
- ✅ `@capacitor/app` - App lifecycle events
- ✅ `@capacitor/browser` - In-app browser

Additional plugins you might need:
- `@capacitor/camera` - Camera access
- `@capacitor/geolocation` - GPS location
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/local-notifications` - Local notifications
- `@capacitor/network` - Network status

Install with:
```bash
npm install @capacitor/plugin-name
```

---

## Next Steps

1. ✅ Install dependencies (Step 1)
2. ✅ Initialize Capacitor (Step 2)
3. ✅ Build your app (Step 3)
4. ✅ Add Android platform (Step 4)
5. ✅ Test in Android Studio (Step 7)
6. 📱 Customize app icon and splash screen
7. 🚀 Publish to Google Play Store

---

## Need Help?

Common resources:
- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio Guide: https://developer.android.com/studio/intro
- Xcode Guide: https://developer.apple.com/xcode/

If you encounter issues, let me know and I'll help you troubleshoot!
