#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    JAM AI - Automated Android APK Builder        "
echo "    Architect: Vihaan Giri                        "
echo "=================================================="

# Directories
BUILD_DIR="/tmp/jam_ai_build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/gen" "$BUILD_DIR/obj"

SDK_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
if [ ! -f "$SDK_JAR" ]; then
  # Try to find android.jar
  SDK_JAR=$(find / -name "android.jar" 2>/dev/null | head -n 1)
fi

if [ -z "$SDK_JAR" ] || [ ! -f "$SDK_JAR" ]; then
  echo "Error: android.jar not found! Please install android-sdk-platform-23 or set ANDROID_HOME."
  exit 1
fi

echo "[1/6] Generating R.java with aapt..."
aapt package -f -m \
  -J "$BUILD_DIR/gen" \
  -M android/app/src/main/AndroidManifest.xml \
  -S android/app/src/main/res \
  -I "$SDK_JAR"

echo "[2/6] Compiling Java classes with javac..."
javac -source 1.8 -target 1.8 \
  -d "$BUILD_DIR/obj" \
  -cp "$SDK_JAR" \
  "$BUILD_DIR/gen/com/vihaangiri/jamai/R.java" \
  android/app/src/main/java/com/vihaangiri/jamai/*.java

echo "[3/6] Converting bytecode to classes.dex with dx..."
dx --dex --output="$BUILD_DIR/classes.dex" "$BUILD_DIR/obj"

echo "[4/6] Packaging APK resources with aapt..."
aapt package -f \
  -M android/app/src/main/AndroidManifest.xml \
  -S android/app/src/main/res \
  -A android/app/src/main/assets \
  -I "$SDK_JAR" \
  -F "$BUILD_DIR/unaligned.apk"

cd "$BUILD_DIR"
aapt add -f unaligned.apk classes.dex
cd - > /dev/null

echo "[5/6] Aligning APK with zipalign..."
zipalign -p -f -v 4 "$BUILD_DIR/unaligned.apk" "$BUILD_DIR/aligned.apk"

echo "[6/6] Signing APK with apksigner..."
if [ ! -f /tmp/debug.keystore ]; then
  keytool -genkey -v -keystore /tmp/debug.keystore \
    -alias androiddebugkey -storepass android -keypass android \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=VihaanGiri, OU=JAMAI, O=JamAI, L=Delhi, ST=Delhi, C=IN"
fi

mkdir -p public android/app/build/outputs/apk/debug android/app/build/outputs/apk/release
apksigner sign --ks /tmp/debug.keystore --ks-pass pass:android \
  --ks-key-alias androiddebugkey --key-pass pass:android \
  --out "$BUILD_DIR/jam-ai-signed.apk" "$BUILD_DIR/aligned.apk"

apksigner verify --verbose "$BUILD_DIR/jam-ai-signed.apk"

cp "$BUILD_DIR/jam-ai-signed.apk" public/jam-ai.apk
cp "$BUILD_DIR/jam-ai-signed.apk" public/jam-ai-v3.8.apk
cp "$BUILD_DIR/jam-ai-signed.apk" android/app/build/outputs/apk/debug/app-debug.apk
cp "$BUILD_DIR/jam-ai-signed.apk" android/app/build/outputs/apk/release/app-release.apk

APK_SIZE=$(du -h "$BUILD_DIR/jam-ai-signed.apk" | cut -f1)
echo "=================================================="
echo " SUCCESS! Real signed APK generated successfully: "
echo " -> public/jam-ai.apk ($APK_SIZE)"
echo " -> android/app/build/outputs/apk/debug/app-debug.apk"
echo "=================================================="
