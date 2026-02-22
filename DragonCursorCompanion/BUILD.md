# How to Build

## Requirements

- Visual Studio 2022 (with .NET Desktop Development workload)
- OR .NET 6.0 SDK (or newer)

## Building from Source

1.  Open the `DragonCursorCompanion` folder.
2.  Open `DragonCursorCompanion.sln` in Visual Studio.
3.  Right-click the `DragonCursorCompanion` project in Solution Explorer and select `Build` or `Publish`.
4.  Alternatively, use the .NET CLI:
    ```bash
    dotnet build DragonCursorCompanion.sln -c Release
    ```
5.  The compiled executable will be found in `DragonCursorCompanion/bin/Release/net6.0-windows/`.

## Important Note on Assets

This repository includes minimal placeholder assets to ensure the project structure is complete, but they are not the final intended graphics.

- **Dragon Image**: `Resources/dragon.png` is currently a 1x1 pixel placeholder. **Replace this file** with a high-quality transparent PNG of a fantasy dragon (e.g., 100x100 or larger) before running the application for the best experience.
- **Application Icon**: `Resources/icon.ico` is a dummy file. **Replace this file** with a valid `.ico` file to see a custom icon in the taskbar and system tray. If not replaced, the application will use a default system icon.

## Troubleshooting

- If you encounter build errors related to `icon.ico`, ensure you have replaced the dummy file with a valid icon file, or remove the reference in the code if you prefer no custom icon.
- If the application crashes on startup, check that .NET 6.0 Desktop Runtime is installed.

## Creating an Installer

An Inno Setup script (`setup.iss`) is included in the project root directory.
To create an installer:
1.  Build the project in **Release** mode as described above.
2.  Install [Inno Setup](https://jrsoftware.org/isinfo.php).
3.  Open `setup.iss` with Inno Setup Compiler.
4.  Compile the script.
5.  The installer `DragonCursorCompanion_Setup.exe` will be generated in the project root folder.
