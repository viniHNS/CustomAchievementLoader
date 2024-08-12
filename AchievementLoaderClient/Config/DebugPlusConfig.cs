using BepInEx.Configuration;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

namespace AchievementLoader.Config;

internal static class AchievementLoaderConfig
{
    public static ConfigEntry<bool> Debug { get; private set; }
    
    public static void InitConfig(ConfigFile config)
    {
        Debug = config.Bind(
            "Debug",
            "Enable Debug Logging",
            false,
            new ConfigDescription("Enable info output")
        );
    }
}