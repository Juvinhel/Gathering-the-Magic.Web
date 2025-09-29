namespace Data.File
{
    export const JSONFile = new class JSONFile implements File<Deck>
    {
        public name = "JSON";
        public extensions = ["json"];
        public mimeTypes = ["application/json", "text/json"];

        public async save(deck: Deck): Promise<string>
        {
            deck = this.removeExtendData(deck);
            return JSON.stringify(deck);
        }

        public async load(text: string): Promise<Deck>
        {
            text = text.replaceAll(/(?:\r\n|\r|\n)/, "");
            const deck = JSON.parse(text);
            await populateEntriesFromIdentifiers(deck);
            return deck;
        }

        public removeExtendData(deck: Deck): any
        {
            deck = JSON.clone(deck);
            this.traverse(deck, (entry: Entry) => { return { quantity: entry.quantity, name: entry.name } as Entry; });
            return deck;
        }

        private traverse(deck: Deck, func: (entry: Entry) => Entry)
        {
            for (const section of deck.sections)
                this.traverseSection(section, func);
        }

        private traverseSection(section: Section, func: (entry: Entry) => Entry)
        {
            for (let i = 0; i < section.items.length; ++i)
            {
                const item = section.items[i];
                if ("name" in item)
                    section.items[i] = func(item);
                else
                    this.traverseSection(item, func);
            }
        }
    }();

    deckFileFormats.push(JSONFile);
}