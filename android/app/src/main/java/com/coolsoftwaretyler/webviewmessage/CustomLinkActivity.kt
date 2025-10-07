package com.coolsoftwaretyler.webviewmessage

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.graphics.Color

class CustomLinkActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Create a simple layout programmatically (no XML needed)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 50, 50, 50)
            setBackgroundColor(Color.WHITE)
        }

        // Success button
        val successButton = Button(this).apply {
            text = "Complete Link (Success)"
            setOnClickListener {
                val resultIntent = Intent()
                resultIntent.putExtra("publicToken", "mock_public_token_12345")
                setResult(RESULT_OK, resultIntent)
                finish()
            }
        }

        // Cancel button
        val cancelButton = Button(this).apply {
            text = "Cancel (Exit)"
            setOnClickListener {
                setResult(RESULT_CANCELED)
                finish()
            }
        }

        layout.addView(successButton)
        layout.addView(cancelButton)

        setContentView(layout)
    }
}
