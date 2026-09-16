# JAM AI — Native Android Kotlin Project 🚀

**Architect:** Vihaan Giri  
**Platform:** Android (Pure Kotlin + AndroidX)  
**Package:** `com.vihaangiri.jamai`  
**Target SDK:** 34 | **Min SDK:** 24  

---

## 📱 Features
- **100% Native Kotlin Architecture**: Pure Kotlin (`MainActivity.kt`, `WebAppInterface.kt`, `JamAiApp.kt`).
- **Completely Offline-First**: Contains self-contained, offline-first bundled assets (`file:///android_asset/www/index.html`) with zero external website dependency.
- **Hardware-Accelerated WebView**: Smooth 60fps rendering with modern Chromium engine, local storage, and media permissions.
- **Native Android JavaScript Bridge**: Haptics vibration, native toasts, device status integration.
- **GitHub Actions CI/CD**: Preconfigured `.github/workflows/android-build.yml` to automatically compile signed debug and release APKs upon push.

---

## 🛠️ How to Build & Publish to GitHub

### 1. Open in Android Studio
1. Launch **Android Studio (Hedgehog or newer)**.
2. Select **Open** and select the `android/` directory.
3. Allow Gradle to sync dependencies automatically.
4. Click **Run > Run 'app'** or **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

### 2. Build via Command Line (Terminal)
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```
The generated APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`

For release build:
```bash
./gradlew assembleRelease
```

### 3. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit of JAM AI Kotlin Android Project"
git branch -M main
git remote add origin https://github.com/<your-username>/jam-ai-android.git
git push -u origin main
```
GitHub Actions will automatically trigger, build the APK, and make it available in the **Actions** tab as a downloadable artifact!
