/**
 * KILLERS VIP - Advanced Source Protection & Security Script
 * This script prevents right-clicks, keyboard shortcuts for DevTools, 
 * and text selection to protect the platform's intellectual property.
 */

(function () {
    // 1. Disable Right Click Context Menu
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // 2. Disable Keyboard Shortcuts
    document.onkeydown = function (e) {
        // Disable F12
        if (e.keyCode == 123) {
            return false;
        }

        // Disable Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
            return false;
        }

        // Disable Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
            return false;
        }

        // Disable Ctrl+Shift+C (Element Selector)
        if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
            return false;
        }

        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
            return false;
        }

        // Disable Ctrl+S (Save Page)
        if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
            return false;
        }
    };

    // 3. Prevent Drag & Drop
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
    });

    // 4. Anti-Debugger (Optional: Makes devtools laggy if opened)
    /*
    setInterval(function() {
      debugger;
    }, 100);
    */

    console.log("%c⚠️ SECURITY ALERT ⚠️", "color: red; font-size: 30px; font-weight: bold;");
    console.log("%cThis area is restricted to authorized personnel only. Attempts to access the source code are logged and monitored.", "font-size: 16px;");
})();
