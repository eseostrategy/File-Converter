using Microsoft.Win32;
using System.Diagnostics;
using System.Reflection;
using System.IO;

namespace DragonCursorCompanion.Core
{
    public static class AutoStartHelper
    {
        private const string AppName = "DragonCursorCompanion";

        public static void SetAutoStart(bool enable)
        {
            try
            {
                using (RegistryKey? key = Registry.CurrentUser.OpenSubKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", true))
                {
                    if (key == null) return;

                    if (enable)
                    {
                        string? appPath = Process.GetCurrentProcess().MainModule?.FileName;
                        if (!string.IsNullOrEmpty(appPath))
                        {
                            key.SetValue(AppName, "\"" + appPath + "\"");
                        }
                    }
                    else
                    {
                        key.DeleteValue(AppName, false);
                    }
                }
            }
            catch
            {
                // Silently fail or log if needed (e.g. permissions)
            }
        }

        public static bool IsAutoStartEnabled()
        {
            try
            {
                using (RegistryKey? key = Registry.CurrentUser.OpenSubKey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", false))
                {
                    if (key == null) return false;
                    return key.GetValue(AppName) != null;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
