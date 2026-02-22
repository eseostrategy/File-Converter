using System;
using System.Windows;
using System.Windows.Controls;
using DragonCursorCompanion.Models;
using DragonCursorCompanion.Core;

namespace DragonCursorCompanion
{
    public partial class SettingsWindow : Window
    {
        private AppSettings _settings;
        private Action<AppSettings> _onSave;

        public SettingsWindow(AppSettings settings, Action<AppSettings> onSave)
        {
            InitializeComponent();
            _settings = settings;
            _onSave = onSave;

            LoadUI();
        }

        private void LoadUI()
        {
            ComboSize.ItemsSource = Enum.GetValues(typeof(DragonSize));
            ComboSize.SelectedItem = _settings.Size;

            ComboIntensity.ItemsSource = Enum.GetValues(typeof(AnimationIntensity));
            ComboIntensity.SelectedItem = _settings.Intensity;

            CheckLowPower.IsChecked = _settings.LowPowerMode;

            // Check actual registry state for AutoStart
            CheckAutoStart.IsChecked = AutoStartHelper.IsAutoStartEnabled();

            foreach (ComboBoxItem item in ComboFPS.Items)
            {
                if (item.Content != null && int.TryParse(item.Content.ToString(), out int fps))
                {
                     if (fps == _settings.FPSCap)
                     {
                         ComboFPS.SelectedItem = item;
                         break;
                     }
                }
            }

            // Default selection if not found
            if (ComboFPS.SelectedItem == null) ComboFPS.SelectedIndex = 1; // 60
        }

        private void BtnSave_Click(object sender, RoutedEventArgs e)
        {
            if (ComboSize.SelectedItem != null)
                _settings.Size = (DragonSize)ComboSize.SelectedItem;

            if (ComboIntensity.SelectedItem != null)
                _settings.Intensity = (AnimationIntensity)ComboIntensity.SelectedItem;

            _settings.LowPowerMode = CheckLowPower.IsChecked == true;

            if (ComboFPS.SelectedItem is ComboBoxItem item && item.Content != null)
            {
                if (int.TryParse(item.Content.ToString(), out int fps))
                {
                    _settings.FPSCap = fps;
                }
            }

            bool autoStart = CheckAutoStart.IsChecked == true;
            _settings.AutoStart = autoStart;
            AutoStartHelper.SetAutoStart(autoStart);

            _onSave?.Invoke(_settings);
            Close();
        }

        private void BtnCancel_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}
