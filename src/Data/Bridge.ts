namespace Data
{
    export declare const Bridge: Bridge;

    export interface Bridge
    {
        SaveDeck(fileName?: string): Promise<SaveResult>;
        LoadDeck(): Promise<LoadResult>;
        LoadCollections(): Promise<LoadResult[]>;
        LoadConfig(): Promise<string>;
        SaveConfig(text: string): Promise<void>;
    }

    export interface SaveResult 
    {
        Name: Promise<string>;
        Type: Promise<string>;
        Save(text: string): Promise<void>;
    }

    export interface LoadResult
    {
        Name: Promise<string>;
        Type: Promise<string>;
        Load(): Promise<string>;
    }
}

Object.defineProperty(Data, "Bridge", {
    get()
    {
        //@ts-ignore
        return window.chrome?.webview?.hostObjects?.bridge;
    },
});