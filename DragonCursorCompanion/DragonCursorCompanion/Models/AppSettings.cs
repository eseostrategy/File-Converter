using System;

namespace DragonCursorCompanion.Models
{
    public enum DragonSize
    {
        Small = 0,
        Medium = 1,
        Large = 2
    }

    public enum AnimationIntensity
    {
        Low = 0,
        Medium = 1,
        High = 2
    }

    public class AppSettings
    {
        public DragonSize Size { get; set; } = DragonSize.Medium;
        public AnimationIntensity Intensity { get; set; } = AnimationIntensity.Medium;
        public int FPSCap { get; set; } = 60;
        public bool LowPowerMode { get; set; } = false;
        public bool AutoStart { get; set; } = false;
    }
}
