using System.Reflection;
using EFT.Quests;
using HarmonyLib;
using SPT.Reflection.Patching;

namespace AchievementLoader.Patches;

public class AchievementControllerClassPatch : ModulePatch
{
    protected override MethodBase GetTargetMethod()
    {
        return AccessTools.Method(
            typeof(GClass3232), 
            nameof(GClass3232.method_4));
    }

    [PatchPostfix]
    static void Postfix(GClass3280 template)
    {
        Logger.LogWarning($"Finished {template.Id.LocalizedName()}");
        
        
    }
}