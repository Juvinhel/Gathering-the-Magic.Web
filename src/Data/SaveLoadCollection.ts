namespace Data
{
    export interface SaveLoadCollection
    {
        load(): Promise<Collection[]>;
        default?(): Promise<Collection[]>;
    }

    class SaveLoadCollectionLocal implements SaveLoadCollection
    {
        public async load(): Promise<Collection[]>
        {
            let files: { name: string; extension: string; text: string; lastModified?: Date; }[];
            const fileResults = await Bridge.LoadCollections();
            if (!fileResults) return null;
            files = [];
            for (const fileResult of fileResults)
                files.push({ name: await fileResult.Name, extension: (await fileResult.Extension).toLowerCase(), text: await fileResult.Load(), lastModified: new Date(await fileResult.LastModified) });

            const collections: Collection[] = [];
            for (const file of files)
            {
                const collection = await File.CSVFile.load(file.text);
                collection.name = file.name;
                if (file.lastModified) collection.importDate = file.lastModified;
                collections.push(collection);
            }
            return collections;
        }

        public async default(): Promise<Collection[]>
        {
            let files: { name: string; extension: string; text: string; lastModified?: Date; }[];
            const fileResults = await Bridge.LoadDefaultCollections();
            if (!fileResults) return null;
            files = [];
            for (const fileResult of fileResults)
                files.push({ name: await fileResult.Name, extension: (await fileResult.Extension).toLowerCase(), text: await fileResult.Load(), lastModified: new Date(await fileResult.LastModified) });

            const collections: Collection[] = [];
            for (const file of files)
            {
                const collection = await File.CSVFile.load(file.text);
                collection.name = file.name;
                if (file.lastModified) collection.importDate = file.lastModified;
                collections.push(collection);
            }
            return collections;
        }
    }

    class SaveLoadCollectionWeb implements SaveLoadCollection
    {
        public async load(): Promise<Collection[]>
        {
            let files: { name: string; extension: string; text: string; lastModified?: Date; }[];
            const uploadedFiles = await UI.Dialog.upload({ title: "Upload Collection Files", accept: ".csv", multiple: true });
            if (!uploadedFiles || !uploadedFiles.length) return null;

            files = [];
            for (const uploadedFile of uploadedFiles)
            {
                const [name, extension] = uploadedFile.name.splitLast(".");
                files.push({
                    name: name,
                    extension: extension.toLowerCase(),
                    text: await uploadedFile.text(),
                    lastModified: uploadedFile.lastModified != 0 ? new Date(uploadedFile.lastModified) : null
                });
            }

            const collections: Collection[] = [];
            for (const file of files)
            {
                const collection = await File.CSVFile.load(file.text);
                collection.name = file.name;
                if (file.lastModified) collection.importDate = file.lastModified;
                collections.push(collection);
            }
            return collections;
        }
    }

    export const SaveLoadCollection: SaveLoadCollection = Bridge ? new SaveLoadCollectionLocal() : new SaveLoadCollectionWeb();
}