package com.vihaangiri.jamai

import android.app.Application
import android.webkit.WebView

/**
 * JAM AI - Application Entry Point in Kotlin
 * Architect: Vihaan Giri
 */
class JamAiApp : Application() {

    override fun onCreate() {
        super.onCreate()
        // Enable WebView debugging in debug builds
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }
    }
}
