using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace DragonCursorCompanion.Core
{
    public static class SystemHelper
    {
        public static bool IsFullscreenAppRunning()
        {
            IntPtr hWnd = NativeMethods.GetForegroundWindow();
            if (hWnd == IntPtr.Zero) return false;

            // If the foreground window is the desktop (Shell), we are "on the desktop", so return false (not a fullscreen app)
            if (hWnd == NativeMethods.GetShellWindow()) return false;

            // Get window bounds
            if (!NativeMethods.GetWindowRect(hWnd, out NativeMethods.RECT rect))
                return false;

            // Get the screen where the window is located
            Screen screen = Screen.FromHandle(hWnd);
            if (screen == null) return false;

            // Check if the window covers the entire screen (including taskbar area)
            // A maximized window usually covers WorkingArea, a Fullscreen app covers Bounds.
            bool coversScreen = rect.Left <= screen.Bounds.Left &&
                                rect.Top <= screen.Bounds.Top &&
                                rect.Right >= screen.Bounds.Right &&
                                rect.Bottom >= screen.Bounds.Bottom;

            return coversScreen;
        }
    }
}
