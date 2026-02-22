using System;
using System.Windows;
using System.Windows.Media;
using System.Windows.Interop;
using DragonCursorCompanion.Core;
using DragonCursorCompanion.Models;

namespace DragonCursorCompanion
{
    public partial class DragonWindow : Window
    {
        private AppSettings _settings;
        private DateTime _lastUpdate;
        private DateTime _lastFullscreenCheck;
        private bool _isHidden;

        // Breathing animation
        private double _breathPhase = 0;

        public DragonWindow(AppSettings settings)
        {
            InitializeComponent();
            _settings = settings;
            ApplySettings();

            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            // Make click-through and tool window (hidden from alt-tab mostly)
            WindowInteropHelper wih = new WindowInteropHelper(this);
            int exStyle = NativeMethods.GetWindowLong(wih.Handle, NativeMethods.GWL_EXSTYLE);
            NativeMethods.SetWindowLong(wih.Handle, NativeMethods.GWL_EXSTYLE, exStyle | NativeMethods.WS_EX_TRANSPARENT | NativeMethods.WS_EX_TOOLWINDOW | NativeMethods.WS_EX_NOACTIVATE);

            // Start loop
            CompositionTarget.Rendering += OnRendering;
            _lastUpdate = DateTime.Now;
            _lastFullscreenCheck = DateTime.Now;
        }

        public void UpdateSettings(AppSettings settings)
        {
            _settings = settings;
            ApplySettings();
        }

        private void ApplySettings()
        {
            // Size
            double size = 100; // Default Medium
            switch (_settings.Size)
            {
                case DragonSize.Small: size = 60; break;
                case DragonSize.Medium: size = 100; break;
                case DragonSize.Large: size = 150; break;
            }

            DragonImage.Width = size;
            DragonImage.Height = size;
        }

        private void OnRendering(object sender, EventArgs e)
        {
            DateTime now = DateTime.Now;
            double dt = (now - _lastUpdate).TotalSeconds;

            // FPS Cap
            int targetFps = _settings.FPSCap > 0 ? _settings.FPSCap : 60;
            if (_settings.LowPowerMode) targetFps = 30; // Force 30 in low power

            if (dt < 1.0 / targetFps) return;

            _lastUpdate = now;

            // Fullscreen check (every 1 second)
            if ((now - _lastFullscreenCheck).TotalSeconds > 1.0)
            {
                bool isFullscreen = SystemHelper.IsFullscreenAppRunning();
                if (isFullscreen && !_isHidden)
                {
                    this.Visibility = Visibility.Collapsed;
                    _isHidden = true;
                }
                else if (!isFullscreen && _isHidden)
                {
                    this.Visibility = Visibility.Visible;
                    _isHidden = false;
                }
                _lastFullscreenCheck = now;
            }

            if (_isHidden) return;

            // Get Mouse Position (Physical)
            NativeMethods.GetCursorPos(out NativeMethods.POINT p);
            Point mousePos = new Point(p.X, p.Y);

            // Convert to Logical (DPI aware)
            PresentationSource source = PresentationSource.FromVisual(this);
            if (source != null && source.CompositionTarget != null)
            {
                mousePos = source.CompositionTarget.TransformFromDevice.Transform(mousePos);
            }

            // Target Position (Centered on cursor)
            // Offset it slightly behind?
            // The prompt says "follow slightly behind with smooth trailing motion".
            // If we just lerp to cursor, it naturally lags behind due to lerp.
            // We want the DRAGON (Image) to be at mousePos.
            // Window is 300x300. Image is centered.
            // So Window TopLeft should be mousePos - (WindowWidth/2, WindowHeight/2).

            double targetX = mousePos.X - (this.ActualWidth / 2);
            double targetY = mousePos.Y - (this.ActualHeight / 2);

            // Add some offset to "follow behind" if moving?
            // Actually simple lerp creates "trailing".

            double currentX = this.Left;
            double currentY = this.Top;

            if (double.IsNaN(currentX)) currentX = targetX;
            if (double.IsNaN(currentY)) currentY = targetY;

            // Lerp Factor
            double lerp = _settings.LowPowerMode ? 0.08 : 0.15; // Lower = more lag/smoothness

            double dx = targetX - currentX;
            double dy = targetY - currentY;

            // Move
            this.Left = currentX + dx * lerp;
            this.Top = currentY + dy * lerp;

            // Rotation (Bank)
            // Bank based on horizontal velocity (dx)
            double targetAngle = dx * 1.5;
            // Clamp
            if (targetAngle > 25) targetAngle = 25;
            if (targetAngle < -25) targetAngle = -25;

            double currentAngle = DragonRotate.Angle;
            DragonRotate.Angle += (targetAngle - currentAngle) * 0.1;

            // Breathing Animation
            if (!_settings.LowPowerMode)
            {
                _breathPhase += dt * 3.0;
                double scaleBase = 1.0;
                double scaleAmp = 0.05;

                double scale = scaleBase + Math.Sin(_breathPhase) * scaleAmp;
                DragonScale.ScaleX = scale;
                DragonScale.ScaleY = scale;
            }
            else
            {
                DragonScale.ScaleX = 1.0;
                DragonScale.ScaleY = 1.0;
            }
        }
    }
}
