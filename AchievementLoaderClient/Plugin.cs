using AchievementLoader.Config;
using AchievementLoader.Patches;
using BepInEx;
using BepInEx.Logging;

#pragma warning disable

namespace AchievementLoader;

[BepInPlugin("com.dirtbikercj.AchievementLoader", "Custom Achievement Loader", "1.0.0")]
public class Plugin : BaseUnityPlugin
{
    public static Plugin Instance { get; private set; }
    public static ManualLogSource Log { get; private set; }
        
    internal void Awake()
    {
        Instance = this;
        DontDestroyOnLoad(this);
            
        Log = Logger;

        AchievementLoaderConfig.InitConfig(Config);
        
        new AchievementControllerClassPatch().Enable();
    }
}