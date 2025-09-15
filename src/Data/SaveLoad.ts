namespace Data
{
    export const SaveLoad = new class
    {
        public async saveDeck(deck: Deck): Promise<boolean>
        {
            if (Bridge)
            {
                let saveResult = await Bridge.SaveDeck();
                if (!saveResult) return false;

                const extension = await saveResult.Extension;

                const format = File.deckFileFormats.first(x => x.extensions.some(e => e.equals(extension, false)));

                deck.name ??= await saveResult.Name;
                const file = await Data.File.saveDeck(deck, format);

                saveResult.Save(file.text);
                return true;
            }
            else
            {
                const formatName = await UI.Dialog.options({ options: File.deckFileFormats.map(x => x.name), title: "Select File Format!", allowEmpty: true });
                if (!formatName) return false;
                const format = File.deckFileFormats.first(x => x.name == formatName);
                const fileName = deck.name + "." + format.extensions[0];

                const file = await Data.File.saveDeck(deck, format);
                DownloadHelper.downloadData(fileName, file.text, format.mimeTypes[0]);
                return true;
            }
        }

        public async loadDeck(): Promise<Deck>
        {
            let file: { name: string; extension: string; text: string; };
            if (Bridge)
            {
                const fileResult = await Bridge.LoadDeck();
                if (!fileResult) return;
                const extension = (await fileResult.Extension).toLowerCase();
                const text = await fileResult.Load();
                const name = await fileResult.Name;
                if (!extension || !text) return null;

                file = { name, extension, text };
            }
            else
            {
                const accept = File.deckFileFormats.map(x => x.extensions.map(e => "." + e).join(", ")).join(", ");
                const uploadedFile = (await UI.Dialog.upload({ title: "Upload Deck File", accept: accept }))?.[0];
                if (!uploadedFile) return null;

                const [name, extension] = uploadedFile.name.splitLast(".");
                const text = await uploadedFile.text();
                file = { name, extension: extension.toLowerCase(), text };
            }


            const text = file.text.replaceAll(/(?:\\r\\n|\\r|\\n)/, "\n");
            const format = File.deckFileFormats.first(x => x.extensions.some(e => e.equals(file.extension, false)));
            const deck = await File.loadDeck(text, format);
            deck.name ??= file.name;
            return deck;
        }

        public async loadCollections(): Promise<Collection[]>
        {
            let files: { name: string; extension: string; text: string; lastModified?: Date; }[];
            if (Bridge)
            {
                const fileResults = await Bridge.LoadCollections();
                if (!fileResults) return null;
                files = [];
                for (const fileResult of fileResults)
                    files.push({ name: await fileResult.Name, extension: (await fileResult.Extension).toLowerCase(), text: await fileResult.Load(), lastModified: new Date(await fileResult.LastModified) });
            }
            else
            {
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

        public async loadDefaultCollections(): Promise<Collection[]>
        {
            let files: { name: string; extension: string; text: string; lastModified?: Date; }[];
            if (Bridge)
            {
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
            else
                return null;
        }
    }();
}