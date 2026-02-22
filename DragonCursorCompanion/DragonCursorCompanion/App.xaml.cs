using System;
using System.IO;
using System.Windows;
using Forms = System.Windows.Forms;
using Drawing = System.Drawing;
using DragonCursorCompanion.Models;
using DragonCursorCompanion.Services;

namespace DragonCursorCompanion
{
    public partial class App : Application
    {
        private Forms.NotifyIcon? _notifyIcon;
        private DragonWindow? _dragonWindow;
        private SettingsService? _settingsService;
        private AppSettings _settings = new AppSettings();

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            _settingsService = new SettingsService();
            _settings = _settingsService.Load();

            // Initialize Dragon Window
            _dragonWindow = new DragonWindow(_settings);
            _dragonWindow.Show();

            // Initialize Tray Icon
            _notifyIcon = new Forms.NotifyIcon();
            _notifyIcon.Text = "Dragon Cursor Companion";
            _notifyIcon.Visible = true;

            // Load Icon
            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Resources", "icon.ico");
            if (File.Exists(iconPath))
            {
                try
                {
                    _notifyIcon.Icon = new Drawing.Icon(iconPath);
                }
                catch
                {
                    _notifyIcon.Icon = Drawing.SystemIcons.Application;
                }
            }
            else
            {
                _notifyIcon.Icon = Drawing.SystemIcons.Application;
            }

            // Context Menu
            var contextMenu = new Forms.ContextMenuStrip();
            contextMenu.Items.Add("Settings", null, (s, args) => OpenSettings());

            var lowPowerItem = new Forms.ToolStripMenuItem("Low Power Mode");
            lowPowerItem.CheckOnClick = true;
            lowPowerItem.Checked = _settings.LowPowerMode;
            lowPowerItem.Click += (s, args) => ToggleLowPower(lowPowerItem.Checked);
            contextMenu.Items.Add(lowPowerItem);

            contextMenu.Items.Add(new Forms.ToolStripSeparator());
            contextMenu.Items.Add("Exit", null, (s, args) => Shutdown());

            _notifyIcon.ContextMenuStrip = contextMenu;
            _notifyIcon.DoubleClick += (s, args) => OpenSettings();
        }

        private void OpenSettings()
        {
            foreach (Window win in Application.Current.Windows)
            {
                if (win is SettingsWindow)
                {
                    win.Activate();
                    if (win.WindowState == WindowState.Minimized) win.WindowState = WindowState.Normal;
                    return;
                }
            }

            SettingsWindow settingsWindow = new SettingsWindow(_settings, (newSettings) => {
                _settings = newSettings;
                _settingsService?.Save(_settings);
                _dragonWindow?.UpdateSettings(_settings);

                // Update context menu item state
                 if (_notifyIcon?.ContextMenuStrip?.Items[1] is Forms.ToolStripMenuItem item)
                 {
                     item.Checked = _settings.LowPowerMode;
                 }
            });
            settingsWindow.Show();
        }

        private void ToggleLowPower(bool enabled)
        {
            _settings.LowPowerMode = enabled;
            _settingsService?.Save(_settings);
            _dragonWindow?.UpdateSettings(_settings);
        }

        protected override void OnExit(ExitEventArgs e)
        {
            if (_notifyIcon != null)
            {
                _notifyIcon.Visible = false;
                _notifyIcon.Dispose();
            }
            base.OnExit(e);
        }
    }
}
