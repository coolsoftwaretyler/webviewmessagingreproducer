#import "CustomLinkModule.h"
#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

@interface CustomLinkViewController : UIViewController
@property (nonatomic, copy) void (^onInjectCallback)(NSString *timestamp, double timestampMillis);
@end

@implementation CustomLinkViewController {
    UILabel *_timestampLabel;
    UIButton *_injectButton;
    UIButton *_closeButton;
}

- (void)viewDidLoad {
    [super viewDidLoad];

    self.view.backgroundColor = [UIColor whiteColor];

    // Timestamp label
    _timestampLabel = [[UILabel alloc] init];
    _timestampLabel.text = @"No callback triggered yet";
    _timestampLabel.font = [UIFont systemFontOfSize:16];
    _timestampLabel.numberOfLines = 0;
    _timestampLabel.textAlignment = NSTextAlignmentCenter;
    _timestampLabel.translatesAutoresizingMaskIntoConstraints = NO;
    [self.view addSubview:_timestampLabel];

    // Inject button
    _injectButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [_injectButton setTitle:@"Inject JS to WebView" forState:UIControlStateNormal];
    _injectButton.titleLabel.font = [UIFont systemFontOfSize:17];
    _injectButton.translatesAutoresizingMaskIntoConstraints = NO;
    [_injectButton addTarget:self action:@selector(didTapInjectButton) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_injectButton];

    // Close button
    _closeButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [_closeButton setTitle:@"Close Activity" forState:UIControlStateNormal];
    _closeButton.titleLabel.font = [UIFont systemFontOfSize:17];
    _closeButton.translatesAutoresizingMaskIntoConstraints = NO;
    [_closeButton addTarget:self action:@selector(didTapCloseButton) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_closeButton];

    // Constraints
    [NSLayoutConstraint activateConstraints:@[
        [_timestampLabel.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor constant:50],
        [_timestampLabel.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor constant:20],
        [_timestampLabel.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor constant:-20],

        [_injectButton.topAnchor constraintEqualToAnchor:_timestampLabel.bottomAnchor constant:30],
        [_injectButton.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor],
        [_injectButton.heightAnchor constraintEqualToConstant:44],

        [_closeButton.topAnchor constraintEqualToAnchor:_injectButton.bottomAnchor constant:20],
        [_closeButton.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor],
        [_closeButton.heightAnchor constraintEqualToConstant:44]
    ]];
}

- (void)didTapInjectButton {
    // Get current timestamp
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss.SSS"];
    NSString *timestamp = [dateFormatter stringFromDate:[NSDate date]];
    double timestampMillis = [[NSDate date] timeIntervalSince1970] * 1000;

    // Update UI
    _timestampLabel.text = [NSString stringWithFormat:@"Inject triggered at: %@", timestamp];

    // Call callback
    if (self.onInjectCallback) {
        self.onInjectCallback(timestamp, timestampMillis);
    }
}

- (void)didTapCloseButton {
    [self dismissViewControllerAnimated:YES completion:nil];
}

@end

@implementation CustomLinkModule {
    RCTResponseSenderBlock _onInjectCallback;
}

RCT_EXPORT_MODULE(CustomLink);

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(open:(RCTResponseSenderBlock)onInject) {
    _onInjectCallback = onInject;

    CustomLinkViewController *viewController = [[CustomLinkViewController alloc] init];

    __weak CustomLinkModule *weakSelf = self;
    viewController.onInjectCallback = ^(NSString *timestamp, double timestampMillis) {
        CustomLinkModule *strongSelf = weakSelf;
        if (strongSelf && strongSelf->_onInjectCallback) {
            double jsTimestampMillis = [[NSDate date] timeIntervalSince1970] * 1000;

            NSDictionary *result = @{
                @"nativeTimestamp": timestamp,
                @"nativeTimestampMillis": @(timestampMillis),
                @"jsTimestampMillis": @(jsTimestampMillis)
            };

            strongSelf->_onInjectCallback(@[result]);
            strongSelf->_onInjectCallback = nil;
        }
    };

    // Get the current presenting view controller
    UIViewController *rootViewController = RCTPresentedViewController();
    if (rootViewController) {
        [rootViewController presentViewController:viewController animated:YES completion:nil];
    } else {
        NSLog(@"CustomLink: Could not find root view controller");
    }
}

@end
