package com.coolsoftwaretyler.webviewmessage

import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.uimanager.util.ReactFindViewUtil

class WebViewAccessModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

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

    @ReactMethod
    fun getWebViewByNativeId(nativeId: String, promise: Promise) {
        val activity = currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        activity.runOnUiThread {
            try {
                val rootView = activity.window.decorView.rootView
                val view = ReactFindViewUtil.findView(rootView, nativeId)

                if (view == null) {
                    promise.reject("VIEW_NOT_FOUND", "View with nativeID '$nativeId' not found")
                    return@runOnUiThread
                }

                // React Native WebView wraps the native WebView, so search in the hierarchy
                val webView = findWebViewInHierarchy(view)

                if (webView == null) {
                    promise.reject("NOT_WEBVIEW", "WebView not found in view hierarchy")
                    return@runOnUiThread
                }

                // Successfully found the WebView
                val url = webView.url ?: "about:blank"
                promise.resolve(url)

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun injectJavaScriptByNativeId(nativeId: String, script: String, promise: Promise) {
        val activity = currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        activity.runOnUiThread {
            try {
                val rootView = activity.window.decorView.rootView
                val view = ReactFindViewUtil.findView(rootView, nativeId)

                if (view == null) {
                    promise.reject("VIEW_NOT_FOUND", "View with nativeID '$nativeId' not found")
                    return@runOnUiThread
                }

                val webView = findWebViewInHierarchy(view)

                if (webView == null) {
                    promise.reject("NOT_WEBVIEW", "WebView not found in view hierarchy")
                    return@runOnUiThread
                }

                // Inject JavaScript into the WebView
                webView.evaluateJavascript(script) { result ->
                    promise.resolve(result)
                }

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun getWebViewTitle(nativeId: String, promise: Promise) {
        val activity = currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        activity.runOnUiThread {
            try {
                val rootView = activity.window.decorView.rootView
                val view = ReactFindViewUtil.findView(rootView, nativeId)

                if (view == null) {
                    promise.reject("VIEW_NOT_FOUND", "View with nativeID '$nativeId' not found")
                    return@runOnUiThread
                }

                if (view !is WebView) {
                    promise.reject("NOT_WEBVIEW", "View found but it's not a WebView")
                    return@runOnUiThread
                }

                val title = view.title ?: ""
                promise.resolve(title)

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }
}
