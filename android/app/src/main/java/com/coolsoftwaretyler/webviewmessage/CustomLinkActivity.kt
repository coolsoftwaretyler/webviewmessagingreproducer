package com.coolsoftwaretyler.webviewmessage

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.graphics.Color
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CustomLinkActivity : Activity() {

    private lateinit var timestampText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Create a simple layout programmatically (no XML needed)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 50, 50, 50)
            setBackgroundColor(Color.WHITE)
        }

        // Timestamp display
        timestampText = TextView(this).apply {
            text = "No callback triggered yet"
            textSize = 16f
            setPadding(0, 0, 0, 30)
        }

        // Inject button
        val injectButton = Button(this).apply {
            text = "Inject JS to WebView"
            setOnClickListener {
                // Get timestamp
                val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.getDefault())
                val currentTime = dateFormat.format(Date())

                val resultIntent = Intent()
                resultIntent.putExtra("timestamp", currentTime)
                resultIntent.putExtra("timestampMillis", System.currentTimeMillis())
                setResult(RESULT_OK, resultIntent)

                // Update timestamp display
                timestampText.text = "Inject triggered at: $currentTime"

                // Don't call finish() - activity stays open
            }
        }

        // Close button
        val closeButton = Button(this).apply {
            text = "Close Activity"
            setOnClickListener {
                finish()
            }
        }

        layout.addView(timestampText)
        layout.addView(injectButton)
        layout.addView(closeButton)

        setContentView(layout)
    }
}
