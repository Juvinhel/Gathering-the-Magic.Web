namespace Data
{
    export interface SaveLoadDeck
    {
        create(): Promise<Deck>;
        open(): Promise<Deck>;
        save?(deck: Deck): Promise<boolean>;
        saveAs(deck: Deck): Promise<boolean>;
    }

    class SaveLoadDeckLocal implements SaveLoadDeck
    {
        private get currentFilePath(): string { return localStorage.get("current-deck-file-path"); }
        private set currentFilePath(value: string) { localStorage.set("current-deck-file-path", value); }

        public async create(): Promise<Deck>
        {
            const ret: Deck = { name: "New Deck", description: "My new deck", sections: [{ title: "main", items: [] }, { title: "side", items: [] }, { title: "maybe", items: [] }] };

            this.currentFilePath = null;

            return ret;
        }

        public async open(): Promise<Deck>
        {
            const filePath = await Bridge.ShowOpenDeck();
            if (!filePath) return null;
            console.log("open", filePath);

            const { name, extension } = this.splitFilePath(filePath);
            const format = File.deckFileFormats.first(x => x.extensions.some(e => e.equals(extension, false)));

            const text = await Bridge.DoOpenDeck(filePath);

            const deck = await File.loadDeck(text, format);
            deck.name ??= name;

            this.currentFilePath = filePath;

            return deck;
        }

        public async save(deck: Deck): Promise<boolean>
        {
            const filePath = this.currentFilePath ?? await Bridge.ShowSaveDeck();
            if (!filePath) return false;

            const { name, extension } = this.splitFilePath(filePath);
            const format = File.deckFileFormats.first(x => x.extensions.some(e => e.equals(extension, false)));

            deck.name ??= name;
            const file = await Data.File.saveDeck(deck, format);

            await Bridge.DoSaveDeck(filePath, file.text);

            this.currentFilePath = filePath;

            return true;
        }

        public async saveAs(deck: Deck): Promise<boolean>
        {
            const filePath = await Bridge.ShowSaveDeck();
            if (!filePath) return false;

            const { name, extension } = this.splitFilePath(filePath);
            const format = File.deckFileFormats.first(x => x.extensions.some(e => e.equals(extension, false)));

            deck.name ??= name;
            const text = (await Data.File.saveDeck(deck, format)).text;

            await Bridge.DoSaveDeck(filePath, text);

            this.currentFilePath = filePath;

            return true;
        }

        private splitFilePath(filePath: string): { path: string, name: string, extension: string; }
        {
            let [path, fileName] = filePath.splitLast("/");
            if (!fileName)
            {
                fileName = path;
                path = "";
            }

            const [name, extension] = filePath.splitLast(".");
            return { path, name, extension };
        }
    }

    class SaveLoadDeckWeb implements SaveLoadDeck
    {
        public async create(): Promise<Deck>
        {
            const ret: Deck = { name: "New Deck", description: "My new deck", sections: [{ title: "main", items: [] }, { title: "side", items: [] }, { title: "maybe", items: [] }] };

            return ret;
        }

        public async open(): Promise<Deck>
        {
            const accept = File.deckFileFormats.map(x => x.extensions.map(e => "." + e).join(", ")).join(", ");
            const uploadedFile = (await UI.Dialog.upload({ title: "Upload Deck File", accept: accept }))?.[0];
            if (!uploadedFile) return null;

            const [name, extension] = uploadedFile.name.splitLast(".");
            const text = (await uploadedFile.text());
            const format = File.deckFileFormats.first(x => x.extensions.some(e => e.equals(extension, false)));
            const deck = await File.loadDeck(text, format);
            deck.name ??= name;

            return deck;
        }

        public async saveAs(deck: Deck): Promise<boolean>
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

    export const SaveLoadDeck: SaveLoadDeck = Bridge ? new SaveLoadDeckLocal() : new SaveLoadDeckWeb();
}