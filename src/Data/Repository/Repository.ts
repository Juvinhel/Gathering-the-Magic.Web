namespace Data.Repository
{
    export type Folder = {
        parent?: Folder;
        url: string;
        name: string;
        folders: Folder[];
        files: File[];
    };

    export type File = {
        parent: Folder;
        url: string;
        name: string;
        extension: string;
    };

    export function* findFiles(folder: Folder): IterableIterator<File>
    {
        for (const file of folder.files)
        {
            file.parent = folder;
            yield file;
        }
        for (const subfolder of folder.folders)
            for (const file of findFiles(subfolder))
                yield file;
    }

    export function findRoot(folderOrFile: Folder | File): Folder
    {
        let current = "folders" in folderOrFile ? folderOrFile : folderOrFile.parent;
        while (current.parent) current = current.parent;
        return current;
    }
}