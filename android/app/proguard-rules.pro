# Proguard rules for JAM AI Native Android Application
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.vihaangiri.jamai.** { *; }
-dontwarn androidx.webkit.**
