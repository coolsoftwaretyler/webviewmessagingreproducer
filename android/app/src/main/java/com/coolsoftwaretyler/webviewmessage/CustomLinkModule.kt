package com.coolsoftwaretyler.webviewmessage

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class CustomLinkModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var onSuccessCallback: Callback? = null
    private var onExitCallback: Callback? = null

    companion object {
        const val REQUEST_CODE = 12345
        const val NAME = "CustomLink"
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun open(onSuccessCallback: Callback, onExitCallback: Callback) {
        val activity = currentActivity ?: throw IllegalStateException("Current activity is null")

        this.onSuccessCallback = onSuccessCallback
        this.onExitCallback = onExitCallback

        // Launch the custom activity
        val intent = Intent(activity, CustomLinkActivity::class.java)
        activity.startActivityForResult(intent, REQUEST_CODE)
    }

    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                val result = Arguments.createMap()
                result.putString("status", "success")
                result.putString("publicToken", data?.getStringExtra("publicToken") ?: "mock_public_token")
                result.putString("message", "Link completed successfully")
                onSuccessCallback?.invoke(result)
            } else {
                val result = Arguments.createMap()
                result.putString("status", "exit")
                result.putString("message", "User exited the flow")
                onExitCallback?.invoke(result)
            }

            // Clear callbacks
            onSuccessCallback = null
            onExitCallback = null
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // Do nothing
    }
}
