package com.vihaangiri.jamai;

import android.app.Application;
import android.webkit.WebView;

public class JamAiApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        WebView.setWebContentsDebuggingEnabled(true);
    }
}
