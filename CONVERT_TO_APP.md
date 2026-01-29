# Converting Pneuma BookStore to Mobile/Desktop Apps

This guide covers multiple approaches to turn your web app into native-like applications.

---

## Option 1: Progressive Web App (PWA) ⭐ RECOMMENDED FIRST

PWA makes your app installable on mobile and desktop with offline support.

### Step 1: Install Dependencies

```bash
npm install -D vite-plugin-pwa workbox-window
```

### Step 2: Update vite.config.js

Add the PWA plugin to your vite config:

```javascript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.png', 'vite.svg'],
        manifest: {
          name: 'Pneuma BookStore',
          short_name: 'Pneuma',
          description: 'Christian literature and audiobooks library',
          theme_color: '#11b53f',
          background_color: '#1f2937',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'icon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icon.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cloudinary-images',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ]
        }
      }),
      // ... your existing better-auth middleware
    ],
    // ... rest of config
  };
});
```

### Step 3: Create Proper Icons

Create icons in `public/` folder:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

Use a tool like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator):

```bash
npx pwa-asset-generator icon.png public/icons --background "#1f2937" --padding "10%"
```

### Step 4: Build and Deploy

```bash
npm run build
```

Deploy to Vercel/Netlify. Users can now install your app:
- **Mobile**: "Add to Home Screen" in browser menu
- **Desktop**: Install icon in address bar

---

## Option 2: Capacitor (iOS & Android Native Apps)

Capacitor wraps your web app in native containers.

### Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Pneuma BookStore" "com.pneuma.bookstore"
```

### Step 2: Add Platforms

```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### Step 3: Configure capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pneuma.bookstore',
  appName: 'Pneuma BookStore',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1f2937",
      showSpinner: false
    }
  }
};

export default config;
```

### Step 4: Build and Sync

```bash
npm run build
npx cap sync
```

### Step 5: Open in Native IDEs

**Android (Android Studio):**
```bash
npx cap open android
```

**iOS (Xcode - Mac only):**
```bash
npx cap open ios
```

### Step 6: Add Native Features (Optional)

```bash
npm install @capacitor/filesystem @capacitor/share @capacitor/app
```

Update your download service to use native file system:

```javascript
import { Filesystem, Directory } from '@capacitor/filesystem';

async function downloadToDevice(url, filename) {
  const response = await fetch(url);
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  
  await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Documents
  });
}
```

---

## Option 3: Electron (Desktop App - Windows, Mac, Linux)

### Step 1: Install Electron

```bash
npm install -D electron electron-builder concurrently wait-on
```

### Step 2: Create electron/main.js

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#1f2937',
    icon: path.join(__dirname, '../public/icon.png')
  });

  // In development
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // In production
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Step 3: Update package.json

```json
{
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.pneuma.bookstore",
    "productName": "Pneuma BookStore",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon.png"
    },
    "mac": {
      "target": "dmg",
      "icon": "public/icon.png"
    },
    "linux": {
      "target": "AppImage",
      "icon": "public/icon.png"
    }
  }
}
```

### Step 4: Run and Build

**Development:**
```bash
npm run electron:dev
```

**Production Build:**
```bash
npm run electron:build
```

---

## Option 4: Tauri (Lightweight Desktop App)

Tauri is lighter than Electron (uses system webview).

### Step 1: Install Tauri

```bash
npm install -D @tauri-apps/cli
npx tauri init
```

### Step 2: Configure tauri.conf.json

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Pneuma BookStore",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "identifier": "com.pneuma.bookstore",
      "icon": [
        "icons/icon.png"
      ]
    },
    "windows": [
      {
        "title": "Pneuma BookStore",
        "width": 1200,
        "height": 800
      }
    ]
  }
}
```

### Step 3: Run and Build

**Development:**
```bash
npm run tauri dev
```

**Production:**
```bash
npm run tauri build
```

---

## Comparison Table

| Feature | PWA | Capacitor | Electron | Tauri |
|---------|-----|-----------|----------|-------|
| **Platforms** | Web, Mobile, Desktop | iOS, Android | Windows, Mac, Linux | Windows, Mac, Linux |
| **App Store** | ❌ | ✅ | ❌ (can sideload) | ❌ (can sideload) |
| **Size** | ~2MB | ~50MB | ~150MB | ~10MB |
| **Native APIs** | Limited | Full | Full | Full |
| **Offline** | ✅ | ✅ | ✅ | ✅ |
| **Setup Time** | 1 hour | 1 day | 4 hours | 4 hours |
| **Best For** | Quick deployment | Mobile apps | Desktop apps | Lightweight desktop |

---

## Recommended Approach

**Phase 1: PWA (Start Here)**
- Quick to implement
- Works on all platforms
- Test user adoption

**Phase 2: Capacitor (If Mobile Needed)**
- Build native mobile apps
- Submit to App Store/Play Store
- Add native features

**Phase 3: Electron/Tauri (If Desktop Needed)**
- Build desktop apps
- Distribute via website
- Add desktop-specific features

---

## Next Steps

1. **Start with PWA** - Run the commands above
2. **Test installation** on your phone and desktop
3. **Gather feedback** from users
4. **Decide on native apps** based on demand

Need help with any specific platform? Let me know!
