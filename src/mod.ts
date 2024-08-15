/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";

import fs from 'fs';
import path from "node:path";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { InstanceManager } from "./InstanceManager";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { IAchievement } from "@spt/models/eft/common/tables/IAchievement";
import { RouteAction } from "@spt/di/Router";

class CustomAchievementLoader implements IPostDBLoadMod, IPreSptLoadMod
{
    private InstanceManager: InstanceManager = new InstanceManager();
    private Database: IDatabaseTables;

    private Rewards: IReward[] = [];

    public preSptLoad(container: DependencyContainer)
    {
        this.InstanceManager.preSptLoad(container, "Custom Achievement Loader");
    }

    public postDBLoad(container: DependencyContainer): void
    {
        this.InstanceManager.postDBLoad(container);
        this.Database = this.InstanceManager.database;
     
        this.InstanceManager.logger.logWithColor("CJCAL: Loading achievement files", LogTextColor.GREEN);

        this.importAchievementData();
        this.loadAchievementLocales();
        this.loadImages();
        this.loadRewards();
        this.registerRoute();
    }

    private importAchievementData(): void
    {
        const dataPath = path.join(path.dirname(__filename), "..", "db", "data");
        const files = fs.readdirSync(dataPath);
        
        const jsonFiles = files
            .filter(file => path.extname(file) === ".json")
            .map(file => path.basename(file, ".json"));

        const achievmentTable = this.Database.templates.achievements;

        for (const file of jsonFiles)
        {   
            const filePath = path.join(path.dirname(__filename), "..", "db", "data", `${file}.json`);
            const data = this.loadAchievementFile(filePath);

            for (const achievement of data)
            {
                achievmentTable.push(achievement);
            }

            this.InstanceManager.logger.logWithColor(`CJCAL: Loaded: ${data.length} achievements from ${file}.json`, LogTextColor.GREEN);
        }    
    }

    private loadAchievementLocales(): void
    {
        const localesPath = path.join(path.dirname(__filename), "..", "db", "locales");
        const subDirs = fs.readdirSync(localesPath);

        for (const lang of subDirs)
        {
            const langDir = path.join(path.dirname(__filename), "..", "db", "locales", lang);
            const localeFiles = fs.readdirSync(langDir);

            for (const file of localeFiles)
            {
                const localeData = this.loadStringDictionary(path.join(langDir, file));

                this.importLocaleData(lang, localeData);
            }
        }
    }

    private importLocaleData(lang: string, localeData: Record<string, string>): void
    {
        const globalLocales = this.Database.locales.global;

        for (const entry in localeData)
        {
            globalLocales[lang][entry] = localeData[entry];
        }
    }

    private loadRewards(): void
    {
        const rewardPath = path.join(path.dirname(__filename), "..", "db", "rewards");
        const files = fs.readdirSync(rewardPath);
        
        const jsonFiles = files
            .filter(file => path.extname(file) === ".json")
            .map(file => path.basename(file, ".json"));


        for (const file of jsonFiles)
        {   
            const filePath = path.join(path.dirname(__filename), "..", "db", "rewards", `${file}.json`);
            const rewards = this.loadRewardFile(filePath);

            for (const reward of rewards)
            {
                this.Rewards.push(reward);
            }

            this.InstanceManager.logger.logWithColor(`CJCAL: Loaded: ${rewards.length} rewards from ${file}.json`, LogTextColor.GREEN);
        }    
    }

    private loadAchievementFile(filePath: string): IAchievement[] 
    {
        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data) as IAchievement[];
        return jsonData;
    }

    private loadStringDictionary(filePath: string): Record<string, string> 
    {
        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data) as Record<string, string>;
        return jsonData;
    }

    private loadRewardFile(filePath: string): IReward[]
    {
        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data) as IReward[];
        return jsonData;
    }

    private loadImages(): void
    {
        const imagesPath = path.join(path.dirname(__filename), "..", "db", "images");
        const images = fs.readdirSync(imagesPath);

        const imageRouter = this.InstanceManager.imageRouter;

        for (const image of images)
        {
            const imagePath = path.join(imagesPath, image);
            const filenameWithoutExtension = path.basename(imagePath, path.extname(imagePath));
            
            imageRouter.addRoute(`/files/achievement/${filenameWithoutExtension}`, imagePath);
        }
    }

    private registerRoute(): void
    {
        this.InstanceManager.staticRouter.registerStaticRouter(
            "CheckAchievements",
            [
                {
                    url: "/CustomAchievementLoader/CheckAchievements", 
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    action: async (url, info, sessionId, output) => 
                    {                     
                        return JSON.stringify({response: "OK"});
                    }
                }
            ],
            ""
        )
    }
}

interface IReward
{
    id: string;
    rewards: Record<string, number>;
}

interface IAchievementCompletePacket
{
    Id: string;
    SessionId: string; 
}

export const mod = new CustomAchievementLoader();
