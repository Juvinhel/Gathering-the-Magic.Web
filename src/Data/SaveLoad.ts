namespace Data
{
    export const SaveLoad = new class
    {
        public async SaveDeck(deck: Deck): Promise<boolean>
        {
            if (Bridge)
            {
                let saveResult = await Bridge.SaveDeck();
                if (!saveResult) return false;

                const type = await saveResult.Type;

                let format = type.toUpperCase();
                if (format == "yml") format = "YAML";

                deck.name ??= await saveResult.Name;
                const file = await Data.File.saveDeck(deck, format as Data.File.Format);

                saveResult.Save(file.text);
                return true;
            }
            else
            {
                let format: Data.File.Format;
                format = await UI.Dialog.options({ options: ["YAML", "JSON", "XML", "DEC", "TXT"], title: "Select File Format!", allowEmpty: true });
                if (!format) return false;
                const fileName = deck.name + "." + format.toLowerCase();

                const file = await Data.File.saveDeck(deck, format);
                const mimetype = file.format == "TXT" ? "text/plain" : "text/" + file.format.toLowerCase();
                DownloadHelper.downloadData(fileName, file.text, mimetype);
                return true;
            }
        }

        public async LoadDeck(): Promise<Deck>
        {
            let file: { name: string; type: string; text: string; };
            if (Bridge)
            {
                const fileResult = await Bridge.LoadDeck();
                if (!fileResult) return;
                const type = await fileResult.Type;
                const text = await fileResult.Load();
                const name = await fileResult.Name;
                if (!type || !text) return null;

                file = { name, type, text };
            }
            else
            {
                const uploadedFile = (await UI.Dialog.upload({ title: "Upload Deck File", accept: ".yaml, .yml, .json, .xml, .dec, .txt" }))?.[0];
                if (!uploadedFile) return null;

                const name = uploadedFile.name.splitLast(".")[0];
                const text = await uploadedFile.text();
                const type = uploadedFile.type?.trimLeft(".") || uploadedFile.name.splitLast(".")[1];
                file = { name, type, text };
            }

            file.text = file.text.replaceAll(/(?:\\r\\n|\\r|\\n)/, "\n");
            let deck: Data.Deck;
            switch (file.type.toLowerCase())
            {
                case "yaml":
                case "yml":
                case "application/yaml":
                    deck = await Data.File.loadDeck(file.text, "YAML");
                    break;

                case "json":
                case "application/json":
                case "text/json":
                    deck = await Data.File.loadDeck(file.text, "JSON");
                    break;

                case "xml":
                case "application/xml":
                case "text/xml":
                    deck = await Data.File.loadDeck(file.text, "XML");
                    break;

                case "dec":
                case "application/dec":
                    deck = await Data.File.loadDeck(file.text, "DEC");
                    break;

                case "txt":
                case "text/plain":
                    deck = await Data.File.loadDeck(file.text, "TXT");
                    break;
            }
            deck.name ??= file.name;

            return deck;
        }

        public async LoadCollections(): Promise<Collection[]>
        {
            let files: { name: string; type: string; text: string; }[];
            if (Bridge)
            {
                const fileResults = await Bridge.LoadCollections();
                if (!fileResults) return null;
                files = [];
                for (const fileResult of fileResults)
                    files.push({ name: await fileResult.Name, type: await fileResult.Type, text: await fileResult.Load() });
            }
            else
            {
                const uploadedFiles = await UI.Dialog.upload({ title: "Upload Collection Files", accept: ".csv", multiple: true });
                if (!uploadedFiles || !uploadedFiles.length) return null;

                files = [];
                for (const uploadedFile of uploadedFiles)
                {
                    files.push({
                        name: uploadedFile.name.splitLast(".")[0],
                        type: uploadedFile.type?.trimLeft(".") || uploadedFile.name.splitLast(".")[1],
                        text: await uploadedFile.text()
                    });
                }
            }

            const collections: Collection[] = [];
            for (const file of files)
            {
                const collection = await File.CSVFile.load(file.text);
                collection.name = file.name;
                collections.push(collection);
            }
            return collections;
        }
    }();
}