import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

// MARK: - CustomLink Module

@objc(CustomLink)
class CustomLinkModule: NSObject, RCTBridgeModule {
  private var onInjectCallback: RCTResponseSenderBlock?

  static func moduleName() -> String! {
    return "CustomLink"
  }

  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  func open(_ onInject: @escaping RCTResponseSenderBlock) {
    DispatchQueue.main.async {
      self.onInjectCallback = onInject

      let viewController = CustomLinkViewController()
      viewController.onInjectCallback = { [weak self] timestamp, timestampMillis in
        guard let self = self, let callback = self.onInjectCallback else { return }

        let jsTimestampMillis = Date().timeIntervalSince1970 * 1000
        let result: [String: Any] = [
          "nativeTimestamp": timestamp,
          "nativeTimestampMillis": timestampMillis,
          "jsTimestampMillis": jsTimestampMillis
        ]

        callback([result])
        self.onInjectCallback = nil
      }

      guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
            let window = windowScene.windows.first,
            let rootViewController = window.rootViewController else {
        print("CustomLink: Could not find root view controller")
        return
      }

      var topViewController = rootViewController
      while let presented = topViewController.presentedViewController {
        topViewController = presented
      }

      topViewController.present(viewController, animated: true, completion: nil)
    }
  }
}

class CustomLinkViewController: UIViewController {
  var onInjectCallback: ((String, Double) -> Void)?

  private let timestampLabel: UILabel = {
    let label = UILabel()
    label.text = "No callback triggered yet"
    label.font = UIFont.systemFont(ofSize: 16)
    label.numberOfLines = 0
    label.textAlignment = .center
    label.translatesAutoresizingMaskIntoConstraints = false
    return label
  }()

  private let injectButton: UIButton = {
    let button = UIButton(type: .system)
    button.setTitle("Inject JS to WebView", for: .normal)
    button.titleLabel?.font = UIFont.systemFont(ofSize: 17)
    button.translatesAutoresizingMaskIntoConstraints = false
    return button
  }()

  private let closeButton: UIButton = {
    let button = UIButton(type: .system)
    button.setTitle("Close Activity", for: .normal)
    button.titleLabel?.font = UIFont.systemFont(ofSize: 17)
    button.translatesAutoresizingMaskIntoConstraints = false
    return button
  }()

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .white

    view.addSubview(timestampLabel)
    view.addSubview(injectButton)
    view.addSubview(closeButton)

    NSLayoutConstraint.activate([
      timestampLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 50),
      timestampLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
      timestampLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),

      injectButton.topAnchor.constraint(equalTo: timestampLabel.bottomAnchor, constant: 30),
      injectButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      injectButton.heightAnchor.constraint(equalToConstant: 44),

      closeButton.topAnchor.constraint(equalTo: injectButton.bottomAnchor, constant: 20),
      closeButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      closeButton.heightAnchor.constraint(equalToConstant: 44)
    ])

    injectButton.addTarget(self, action: #selector(didTapInjectButton), for: .touchUpInside)
    closeButton.addTarget(self, action: #selector(didTapCloseButton), for: .touchUpInside)
  }

  @objc private func didTapInjectButton() {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
    let timestamp = dateFormatter.string(from: Date())
    let timestampMillis = Date().timeIntervalSince1970 * 1000

    timestampLabel.text = "Inject triggered at: \(timestamp)"
    onInjectCallback?(timestamp, timestampMillis)
  }

  @objc private func didTapCloseButton() {
    dismiss(animated: true, completion: nil)
  }
}
