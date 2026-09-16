package com.vihaangiri.jamai

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.webkit.JavascriptInterface
import android.widget.Toast

/**
 * Native JavaScript Bridge in Kotlin for JAM AI.
 * Provides haptic feedback, native toasts, device telemetry, and system integration.
 */
class WebAppInterface(private val context: Context) {

    private val vibrator: Vibrator? = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator

    @JavascriptInterface
    fun showToast(message: String?) {
        if (!message.isNullOrBlank()) {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun vibrate(milliseconds: Long) {
        try {
            vibrator?.let { v ->
                val duration = if (milliseconds in 1..2000) milliseconds else 50L
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    v.vibrate(duration)
                }
            }
        } catch (e: Exception) {
            // Safe fallback
        }
    }

    @JavascriptInterface
    fun isNativeApp(): Boolean = true

    @JavascriptInterface
    fun getAppVersion(): String = "3.8.0-KOTLIN"

    @JavascriptInterface
    fun getAppCreator(): String = "Vihaan Giri"
}
