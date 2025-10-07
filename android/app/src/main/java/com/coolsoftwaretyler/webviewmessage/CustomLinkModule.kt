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

    private var onInjectCallback: Callback? = null

    companion object {
        const val REQUEST_CODE = 12345
        const val NAME = "CustomLink"
        private var instance: CustomLinkModule? = null
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun open(onInjectCallback: Callback) {
        val activity = currentActivity ?: throw IllegalStateException("Current activity is null")

        this.onInjectCallback = onInjectCallback

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
        if (requestCode == REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            val result = Arguments.createMap()
            result.putString("kotlinTimestamp", data?.getStringExtra("timestamp") ?: "")
            result.putDouble("kotlinTimestampMillis", data?.getLongExtra("timestampMillis", 0L)?.toDouble() ?: 0.0)
            result.putDouble("jsTimestampMillis", System.currentTimeMillis().toDouble())
            onInjectCallback?.invoke(result)

            // Clear callback
            onInjectCallback = null
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // Do nothing
    }
}
