export type LogType = "info" | "success" | "error" | "event";

export const createLoggerHTML = (title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #fff;
      padding: 16px;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 16px;
      color: ${title.includes("No Bypass") ? "#ef4444" : "#60a5fa"};
    }
    #log-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .log-entry {
      padding: 12px;
      border-radius: 6px;
      border-left: 4px solid;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .log-entry.info {
      background: #1e3a5f;
      border-color: #60a5fa;
    }
    .log-entry.success {
      background: #1e3a2f;
      border-color: #34d399;
    }
    .log-entry.error {
      background: #3a1e1e;
      border-color: #ef4444;
    }
    .log-entry.event {
      background: #2e1e3a;
      border-color: #a78bfa;
    }
    .timestamp {
      font-size: 11px;
      opacity: 0.7;
      margin-bottom: 4px;
    }
    .message {
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div id="log-container"></div>

  <script>
    window.eventHistory = [];

    window.logger = {
      log: function(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 3
        });

        const entry = { timestamp, message, type };
        window.eventHistory.push(entry);

        const container = document.getElementById('log-container');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry ' + type;
        logEntry.innerHTML =
          '<div class="timestamp">' + timestamp + '</div>' +
          '<div class="message">' + message + '</div>';

        container.appendChild(logEntry);

        // Auto-scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
      },

      clear: function() {
        window.eventHistory = [];
        document.getElementById('log-container').innerHTML = '';
      }
    };

    // Initial log
    window.logger.log('Logger initialized${title.includes("No Bypass") ? " (No Bypass)" : ""}', 'success');
  </script>
</body>
</html>
`;

export const formatTimestamp = () =>
  new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });

export const escapeLogMessage = (message: string) =>
  message.replace(/'/g, "\\'").replace(/\n/g, "\\n");

export const createLogScript = (message: string, type: LogType) => {
  const escapedMessage = escapeLogMessage(message);
  return `window.logger.log('${escapedMessage}', '${type}');`;
};
