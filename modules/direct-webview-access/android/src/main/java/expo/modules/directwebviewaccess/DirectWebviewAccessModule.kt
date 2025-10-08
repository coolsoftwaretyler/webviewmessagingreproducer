package expo.modules.directwebviewaccess

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import com.facebook.react.uimanager.util.ReactFindViewUtil
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import java.lang.ref.WeakReference
import java.net.URL
import java.util.WeakHashMap

class DirectWebviewAccessModule : Module() {

  private val webViewCache = WeakHashMap<String, WeakReference<WebView>>()
  private val mainHandler = Handler(Looper.getMainLooper())

  private fun getWebView(nativeId: String): WebView? {
    // First try to get from cache
    webViewCache[nativeId]?.get()?.let { return it }

    // Fall back to searching view hierarchy
    val activity = appContext.currentActivity ?: return null
    val rootView = activity.window?.decorView?.rootView ?: return null
    val view = ReactFindViewUtil.findView(rootView, nativeId) ?: return null
    val webView = findWebViewInHierarchy(view)

    // Cache it for next time
    if (webView != null) {
      webViewCache[nativeId] = WeakReference(webView)
    }

    return webView
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

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('DirectWebviewAccess')` in JavaScript.
    Name("DirectWebviewAccess")

    // Defines constant property on the module.
    Constant("PI") {
      Math.PI
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Register a WebView by nativeId
    AsyncFunction("registerWebView") { nativeId: String ->
      Log.d("DirectWebviewAccessModule", "registerWebView called with nativeId: $nativeId")

      val activity = appContext.currentActivity
        ?: throw Exception("NO_ACTIVITY: Activity doesn't exist")

      val rootView = activity.window.decorView.rootView
      val view = ReactFindViewUtil.findView(rootView, nativeId)
        ?: throw Exception("VIEW_NOT_FOUND: View with nativeID '$nativeId' not found")

      Log.d("DirectWebviewAccessModule", "View found, searching for WebView in hierarchy")
      val webView = findWebViewInHierarchy(view)
        ?: throw Exception("NOT_WEBVIEW: WebView not found in view hierarchy")

      webViewCache[nativeId] = WeakReference(webView)
      Log.d("DirectWebviewAccessModule", "WebView registered successfully")

      "WebView registered successfully"
    }.runOnQueue(Queues.MAIN)

    // Unregister a WebView by nativeId
    AsyncFunction("unregisterWebView") { nativeId: String ->
      Log.d("DirectWebviewAccessModule", "unregisterWebView called with nativeId: $nativeId")

      webViewCache.remove(nativeId)
      Log.d("DirectWebviewAccessModule", "WebView unregistered successfully")

      "WebView unregistered successfully"
    }.runOnQueue(Queues.MAIN)

    // Inject JavaScript into a WebView by nativeId
    AsyncFunction("injectJavaScriptByNativeId") { nativeId: String, script: String, promise: Promise ->
      Log.d("DirectWebviewAccessModule", "injectJavaScriptByNativeId called with nativeId: $nativeId")

      try {
        Log.d("DirectWebviewAccessModule", "Attempting to get WebView from cache or hierarchy")
        val webView = getWebView(nativeId)

        if (webView == null) {
          Log.e("DirectWebviewAccessModule", "WebView with nativeID '$nativeId' not found")
          promise.reject("NOT_FOUND", "WebView with nativeID '$nativeId' not found", null)
          return@AsyncFunction
        }

        Log.d("DirectWebviewAccessModule", "WebView found, injecting JavaScript: ${script.take(50)}...")

        // Inject JavaScript into the WebView
        webView.evaluateJavascript(script) { result ->
          Log.d("DirectWebviewAccessModule", "JavaScript executed successfully, result: $result")
          promise.resolve(result)
        }

      } catch (e: Exception) {
        Log.e("DirectWebviewAccessModule", "Error injecting JavaScript", e)
        promise.reject("ERROR", e.message, e)
      }
    }.runOnQueue(Queues.MAIN)

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(DirectWebviewAccessView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: DirectWebviewAccessView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
}
