namespace Data
{
    export interface Config
    {
        showMana: boolean;
        showType: boolean;
    }

    const defaultConfig: Config = {
        showMana: false,
        showType: false,
    };

    export async function loadConfig(): Promise<Config>
    {
        if (Bridge)
        {
            const text = await Bridge.LoadConfig();
            if (!text) return defaultConfig;
            const ret = JSON.parse(text);
            for (const entry of Object.entries(defaultConfig))
                if (!(entry[0] in ret))
                    ret[entry[0]] = entry[1];
            return ret;
        }
        else
            return localStorage.get("config") ?? defaultConfig;
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