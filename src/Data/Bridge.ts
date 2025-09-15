namespace Data
{
    export declare const Bridge: Bridge;

    export interface Bridge
    {
        SaveDeck(fileName?: string): Promise<SaveResult>;
        LoadDeck(): Promise<LoadResult>;
        LoadCollections(): Promise<LoadResult[]>;
        LoadDefaultCollections(): Promise<LoadResult[]>;
        LoadConfig(): Promise<string>;
        SaveConfig(text: string): Promise<void>;
    }

    export interface SaveResult 
    {
        get Name(): Promise<string>;
        get Extension(): Promise<string>;
        get Exists(): Promise<boolean>;
        Save(text: string): Promise<void>;
    }

    export interface LoadResult
    {
        get Name(): Promise<string>;
        get Extension(): Promise<string>;
        get LastModified(): Promise<string>;
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