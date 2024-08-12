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

class CustomAchievementLoader implements IPostDBLoadMod, IPreSptLoadMod
{
    private InstanceManager: InstanceManager = new InstanceManager();
    private Database: IDatabaseTables;

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

    private loadRewards(): void
    {
        const rewardsPath = path.join(path.dirname(__filename), "..", "db", "images");
        const rewards = fs.readdirSync(rewardsPath);


    }
}

interface IReward
{
    id: string;
    rewards: string[];
}

export const mod = new CustomAchievementLoader();
