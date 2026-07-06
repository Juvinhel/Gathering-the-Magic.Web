namespace API.File
{
    export interface Format<T>
    {
        name: string;
        extensions: string[];
        mimeTypes: string[];

        save(data: T): Promise<string>;
        load(text: string): Promise<T>;
    }
}