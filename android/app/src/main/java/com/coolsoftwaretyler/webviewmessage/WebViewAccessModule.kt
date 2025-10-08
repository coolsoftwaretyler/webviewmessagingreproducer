package com.coolsoftwaretyler.webviewmessage

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.uimanager.util.ReactFindViewUtil
import java.lang.ref.WeakReference
import java.util.WeakHashMap

class WebViewAccessModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val webViewCache = WeakHashMap<String, WeakReference<WebView>>()
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun getName(): String {
        return "WebViewAccess"
    }

    private fun findWebViewInHierarchy(view: View): WebView? {
        if (view is WebView) {
            return view
        }
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                val webView = findWebViewInHierarchy(view.getChildAt(i))
                if (webView != null) {
                    return webView
                }
            }
        }
        return null
    }

    private fun getWebView(nativeId: String): WebView? {
        // First try to get from cache
        webViewCache[nativeId]?.get()?.let { return it }

        // Fall back to searching view hierarchy
        val activity = currentActivity ?: return null
        val rootView = activity.window?.decorView?.rootView ?: return null
        val view = ReactFindViewUtil.findView(rootView, nativeId) ?: return null
        val webView = findWebViewInHierarchy(view)

        // Cache it for next time
        if (webView != null) {
            webViewCache[nativeId] = WeakReference(webView)
        }

        return webView
    }

    @ReactMethod
    fun registerWebView(nativeId: String, promise: Promise) {
        mainHandler.post {
            try {
                val activity = currentActivity
                if (activity == null) {
                    promise.reject("NO_ACTIVITY", "Activity doesn't exist")
                    return@post
                }

                val rootView = activity.window.decorView.rootView
                val view = ReactFindViewUtil.findView(rootView, nativeId)

                if (view == null) {
                    promise.reject("VIEW_NOT_FOUND", "View with nativeID '$nativeId' not found")
                    return@post
                }

                val webView = findWebViewInHierarchy(view)

                if (webView == null) {
                    promise.reject("NOT_WEBVIEW", "WebView not found in view hierarchy")
                    return@post
                }

                webViewCache[nativeId] = WeakReference(webView)
                promise.resolve("WebView registered successfully")

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun unregisterWebView(nativeId: String) {
        webViewCache.remove(nativeId)
    }

    @ReactMethod
    fun getWebViewByNativeId(nativeId: String, promise: Promise) {
        mainHandler.post {
            try {
                val webView = getWebView(nativeId)

                if (webView == null) {
                    promise.reject("NOT_FOUND", "WebView with nativeID '$nativeId' not found")
                    return@post
                }

                val url = webView.url ?: "about:blank"
                promise.resolve(url)

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun injectJavaScriptByNativeId(nativeId: String, script: String, promise: Promise) {
        Log.d("WebViewAccessModule", "injectJavaScriptByNativeId called with nativeId: $nativeId")

        mainHandler.post {
            try {
                Log.d("WebViewAccessModule", "Attempting to get WebView from cache or hierarchy")
                val webView = getWebView(nativeId)

                if (webView == null) {
                    Log.e("WebViewAccessModule", "WebView with nativeID '$nativeId' not found")
                    promise.reject("NOT_FOUND", "WebView with nativeID '$nativeId' not found")
                    return@post
                }

                Log.d("WebViewAccessModule", "WebView found, injecting JavaScript: ${script.take(50)}...")

                // Inject JavaScript into the WebView
                webView.evaluateJavascript(script) { result ->
                    Log.d("WebViewAccessModule", "JavaScript executed successfully, result: $result")
                    promise.resolve(result)
                }

            } catch (e: Exception) {
                Log.e("WebViewAccessModule", "Error injecting JavaScript", e)
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun getWebViewTitle(nativeId: String, promise: Promise) {
        mainHandler.post {
            try {
                val webView = getWebView(nativeId)

                if (webView == null) {
                    promise.reject("NOT_FOUND", "WebView with nativeID '$nativeId' not found")
                    return@post
                }

                val title = webView.title ?: ""
                promise.resolve(title)

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }
}
