[Setup]
AppName=Dragon Cursor Companion
AppVersion=1.0
DefaultDirName={autopf}\Dragon Cursor Companion
DefaultGroupName=Dragon Cursor Companion
OutputDir=.
OutputBaseFilename=DragonCursorCompanion_Setup
Compression=lzma
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64

[Files]
; IMPORTANT: Build the project in Release mode first!
Source: "DragonCursorCompanion\bin\Release\net6.0-windows\DragonCursorCompanion.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "DragonCursorCompanion\bin\Release\net6.0-windows\DragonCursorCompanion.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "DragonCursorCompanion\bin\Release\net6.0-windows\DragonCursorCompanion.runtimeconfig.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "DragonCursorCompanion\bin\Release\net6.0-windows\DragonCursorCompanion.deps.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "DragonCursorCompanion\bin\Release\net6.0-windows\Resources\*"; DestDir: "{app}\Resources"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Dragon Cursor Companion"; Filename: "{app}\DragonCursorCompanion.exe"
Name: "{autodesktop}\Dragon Cursor Companion"; Filename: "{app}\DragonCursorCompanion.exe"

[Run]
Filename: "{app}\DragonCursorCompanion.exe"; Description: "Launch Dragon Cursor Companion"; Flags: nowait postinstall skipifsilent
