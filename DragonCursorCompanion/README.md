# Dragon Cursor Companion

A lightweight Windows desktop application that displays a realistic fantasy dragon following your mouse cursor.

## Features

- **Desktop Companion**: The dragon follows your cursor smoothly on the desktop.
- **Smart Hiding**: Automatically hides when running fullscreen applications (games, videos) to avoid distraction.
- **Customizable**: Adjustable size (Small/Medium/Large) and animation intensity.
- **Performance Focused**:
  - Low RAM usage (< 100MB).
  - Minimal CPU usage (< 3% idle).
  - Hardware accelerated rendering (WPF).
  - Low Power Mode option (caps FPS to 30, disables breathing animation).
- **System Tray Integration**: Quick access to settings and toggle.

## Requirements

- Windows 10 or Windows 11.
- .NET 6.0 Desktop Runtime (included in modern Windows updates or downloadable from Microsoft).

## Customization

You can replace the default dragon image by replacing the file in `Resources/dragon.png` with your own transparent PNG image.
Similarly, you can update the application icon by replacing `Resources/icon.ico`.

## License

MIT License.
