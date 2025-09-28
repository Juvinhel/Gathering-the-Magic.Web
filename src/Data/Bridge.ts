namespace Data
{
    export declare const Bridge: Bridge;

    export interface Bridge
    {
        ShowSaveDeck(): Promise<string>;
        ShowOpenDeck(): Promise<string>;
        DoSaveDeck(filePath: string, text: string): Promise<void>;
        DoOpenDeck(filePath: string): Promise<string>;

        //TODO: refactor
        LoadCollections(): Promise<LoadResult[]>;
        LoadDefaultCollections(): Promise<LoadResult[]>;
        LoadConfig(): Promise<string>;
        SaveConfig(text: string): Promise<void>;
    }

    export interface FileResult
    {
        get FilePath(): Promise<string>;
        get Name(): Promise<string>;
        get Extension(): Promise<string>;
    }

    export interface SaveResult extends FileResult
    {
        get Exists(): Promise<boolean>;
        Save(text: string): Promise<void>;
    }

    export interface LoadResult extends FileResult
    {
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