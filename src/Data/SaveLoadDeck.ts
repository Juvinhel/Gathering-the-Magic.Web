namespace Data
{
    export interface SaveLoadDeck
    {
        create(): Promise<API.Deck>;
        open(): Promise<API.Deck>;
        save?(deck: API.Deck): Promise<boolean>;
        saveAs(deck: API.Deck): Promise<boolean>;
    }

    class SaveLoadDeckLocal implements SaveLoadDeck
    {
        constructor ()
        {
            this.internal_currentFilePath = localStorage.get("current-deck-file-path");
        }

        private internal_currentFilePath; // prevent multiple open instances from interfering with another
        private get currentFilePath(): string { return this.internal_currentFilePath; }
        private set currentFilePath(value: string)
        {
            this.internal_currentFilePath = value;
            localStorage.set("current-deck-file-path", value);
        }

        public async create(): Promise<API.Deck>
        {
            const ret: API.Deck = { name: "New Deck", description: "My new deck", commanders: [], tags: [], sections: [{ title: "main", items: [] }, { title: "side", items: [] }, { title: "maybe", items: [] }] };

            this.currentFilePath = null;

            return ret;
        }

        public async open(): Promise<API.Deck>
        {
            const filePath = await Bridge.ShowOpenDeck();
            if (!filePath) return null;

            const { name, extension } = this.splitFilePath(filePath);
            const format = API.File.deckFormats.first(x => x.extensions.some(e => e.equals(extension, false)));

            const text = await Bridge.DoOpenDeck(filePath);

            const deck = await API.File.loadDeck(text, format);
            deck.name ??= name;

            this.currentFilePath = filePath;

            return deck;
        }

        public async save(deck: API.Deck): Promise<boolean>
        {
            const filePath = this.currentFilePath ?? await Bridge.ShowSaveDeck();
            if (!filePath) return false;

            const { name, extension } = this.splitFilePath(filePath);
            const format = API.File.deckFormats.first(x => x.extensions.some(e => e.equals(extension, false)));

            deck.name ??= name;
            const file = await API.File.saveDeck(deck, format);

            await Bridge.DoSaveDeck(filePath, file.text);

            this.currentFilePath = filePath;

            return true;
        }

        public async saveAs(deck: API.Deck): Promise<boolean>
        {
            const filePath = await Bridge.ShowSaveDeck();
            if (!filePath) return false;

            const { name, extension } = this.splitFilePath(filePath);
            const format = API.File.deckFormats.first(x => x.extensions.some(e => e.equals(extension, false)));

            deck.name ??= name;
            const text = (await API.File.saveDeck(deck, format)).text;

            await Bridge.DoSaveDeck(filePath, text);

            this.currentFilePath = filePath;

            return true;
        }

        private splitFilePath(filePath: string): { path: string, name: string, extension: string; }
        {
            let [path, fileName] = filePath.trimChar("/").splitLast("/");
            if (!fileName)
            {
                fileName = path;
                path = "";
            }

            const [name, extension] = fileName.splitLast(".");
            return { path, name, extension };
        }
    }

    class SaveLoadDeckWeb implements SaveLoadDeck
    {
        public async create(): Promise<API.Deck>
        {
            const ret: API.Deck = { name: "New Deck", description: "My new deck", commanders: [], tags: [], sections: [{ title: "main", items: [] }, { title: "side", items: [] }, { title: "maybe", items: [] }] };

            return ret;
        }

        public async open(): Promise<API.Deck>
        {
            const accept = API.File.deckFormats.mapMany(x => x.extensions).distinct().map(e => "." + e).join(", ");
            const uploadedFile = (await UI.Dialog.upload({ title: "Upload Deck File", accept: accept }))?.[0];
            if (!uploadedFile) return null;

            const [name, extension] = uploadedFile.name.splitLast(".");
            const text = (await uploadedFile.text());
            const format = API.File.deckFormats.first(x => x.extensions.some(e => e.equals(extension, false)));
            const deck = await API.File.loadDeck(text, format);
            deck.name ??= name;

            return deck;
        }

        public async saveAs(deck: API.Deck): Promise<boolean>
        {
            const formatName = await UI.Dialog.options({ options: API.File.deckFormats.map(x => x.name), title: "Select File Format!", allowEmpty: true });
            if (!formatName) return false;
            const format = API.File.deckFormats.first(x => x.name == formatName);
            const fileName = deck.name + "." + format.extensions[0];

            const file = await API.File.saveDeck(deck, format);
            DownloadHelper.downloadData(fileName, file.text, format.mimeTypes[0]);
            return true;
        }
    }

    export const SaveLoadDeck: SaveLoadDeck = Bridge ? new SaveLoadDeckLocal() : new SaveLoadDeckWeb();
}