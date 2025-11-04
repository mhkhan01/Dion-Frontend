import UIKit
import Capacitor

class ViewController: CAPBridgeViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        print("✅ Custom ViewController loaded")
        
        // Configure status bar immediately
        configureStatusBar()
        
        // Also configure it after a delay to ensure it's applied
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.configureStatusBar()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        print("✅ ViewController will appear - configuring status bar")
        configureStatusBar()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        print("✅ ViewController did appear - configuring status bar")
        configureStatusBar()
    }
    
    private func configureStatusBar() {
        print("🔧 Configuring status bar...")
        
        // Ensure status bar is not hidden
        UIApplication.shared.isStatusBarHidden = false
        
        // Set the interface style to light (which makes status bar dark)
        if #available(iOS 13.0, *) {
            overrideUserInterfaceStyle = .light
            print("✓ Set interface style to light")
        }
        
        // Force status bar update
        setNeedsStatusBarAppearanceUpdate()
        
        print("✅ Status bar configuration complete")
    }
    
    // Return dark content style (dark icons on light background)
    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    
    // Ensure status bar is never hidden
    override var prefersStatusBarHidden: Bool {
        return false
    }
    
    // Ensure status bar updates are animated
    override var preferredStatusBarUpdateAnimation: UIStatusBarAnimation {
        return .fade
    }
}
