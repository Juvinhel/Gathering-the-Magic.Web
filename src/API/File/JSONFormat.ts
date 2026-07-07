namespace API.File
{
    export const JSONFormat = new class JSONFormat implements Format<Deck>
    {
        public name = "Javascript Object";
        public extensions = ["json"];
        public mimeTypes = ["application/json", "text/json"];

        public async save(deck: Deck): Promise<string>
        {
            deck = this.removeExtendData(deck);
            return JSON.stringify(deck);
        }

        public async load(text: string): Promise<Deck>
        {
            const deck = JSON.parse(text);
            return deck;
        }

        public removeExtendData(deck: Deck, removeSet?: boolean): any
        {
            deck = JSON.clone(deck);
            this.traverse(deck, (entry: Entry) =>
            {
                const ret = { quantity: entry.quantity, name: entry.name } as Entry;
                if (!removeSet && entry.set)
                {
                    ret.set = entry.set;
                    ret.no = entry.no;
                }
                if (entry.comment) ret.comment = entry.comment;
                return ret;
            });
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

    deckFormats.push(JSONFormat);
}