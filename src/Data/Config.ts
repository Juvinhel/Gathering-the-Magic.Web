namespace Data
{
    export interface Config
    {
        showMana: boolean;
        showType: boolean;
        cardSize: "Large" | "Small",
        listMode: "Lines" | "Grid";
    }

    const defaultConfig: Config = {
        showMana: false,
        showType: false,
        cardSize: "Small",
        listMode: "Lines",
    };

    export async function loadConfig(): Promise<Config>
    {
        let ret: Config;
        if (Bridge)
        {
            const text = await Bridge.LoadConfig();
            if (!text) return defaultConfig;
            ret = JSON.parse(text);
        }
        else
        {
            ret = localStorage.get("config");
            if (!ret) return defaultConfig;
        }

        for (const entry of Object.entries(defaultConfig))
            if (!(entry[0] in ret))
                ret[entry[0]] = entry[1];

        return ret;
    }

    export async function saveConfig(config: Config): Promise<void>
    {
        if (Bridge)
        {
            const text = JSON.stringify(config);
            await Bridge.SaveConfig(text);
        }
        else
            localStorage.set("config", config);
    }
}