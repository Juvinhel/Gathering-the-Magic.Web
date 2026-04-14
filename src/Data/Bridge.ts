namespace Data
{
    export declare const Bridge: Bridge;

    export interface Bridge extends FileSystem
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

    export interface FileSystem
    {
        GetFolders(path: string): Promise<string[]>;
        GetFiles(path: string): Promise<string[]>;
        ReadFile(path: string): Promise<number[]>;
        WriteFile(path: string, data: number[]): Promise<void>;
        DeleteFile(path: string): Promise<void>;
        CreateFolder(path: string): Promise<void>;
        DeleteFolder(path: string): Promise<void>;
    }
}

Object.defineProperty(Data, "Bridge", {
    get()
    {
        //@ts-ignore
        return window.chrome?.webview?.hostObjects?.bridge;
    },
});