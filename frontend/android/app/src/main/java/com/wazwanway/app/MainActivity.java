package com.wazwanway.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        optimizeWebView();
    }

    private void optimizeWebView() {
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();

        // Hardware acceleration for smooth rendering
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

        // Cache — faster repeat visits
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // Fix inflated text size — lock to 100% regardless of system font setting
        settings.setTextZoom(100);

        // Smoother scrolling — remove overscroll glow effect
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        webView.setScrollbarFadingEnabled(true);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
    }
}
