namespace Views.Shelve
{
    export class ShelveElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private folderListElement: HTMLDivElement;
        private deckListElement: HTMLDivElement;

        private build()
        {
            return [
                <h1>Shelve</h1>,
                <div>
                    { this.folderListElement = <div class="folder-list" /> as HTMLDivElement }
                    { this.deckListElement = <div class="deck-list" /> as HTMLDivElement }
                </div>
            ];
        }

        public rootFolder: Data.Repository.Folder;
        async connectedCallback()
        {
            this.rootFolder = await Data.Repository.loadRepository("/repository");

            this.loadFolder(this.rootFolder.folders.first(x => x.name.equals("decks", false)) ?? this.rootFolder);
        }

        private async loadFolder(folder: Data.Repository.Folder)
        {
            this.folderListElement.clearChildren();
            this.deckListElement.clearChildren();

            if (folder != this.rootFolder)
                this.folderListElement.append(this.buildFolder("...", this.rootFolder));

            if (folder.parent)
                this.folderListElement.append(this.buildFolder("..", folder.parent));

            for (const subFolder of folder.folders)
                this.folderListElement.append(this.buildFolder(subFolder.name, subFolder));

            for (const file of folder.files)
            {
                const response = await fetch(file.url);
                const text = await response.text();
                const deck = await Data.File.loadDeck(text, file.extension, false);
                const tile = this.buildDeck(file, deck) as HTMLAnchorElement;
                this.deckListElement.append(tile);
            }

            await this.lazyLoad([...this.querySelectorAll("a.deck") as NodeListOf<HTMLAnchorElement>]);
        }

        private async lazyLoad(tiles: HTMLAnchorElement[])
        {
            if (!tiles || tiles.length == 0) return;

            const cards = await Data.API.getCards(tiles.map(t =>
            {
                let deck = t["deck"];
                let card = deck.commanders?.first();
                if (!card) card = Data.collapse(deck)?.[0]?.name;
                if (!card) card = "Plains";
                return { name: card };
            }));

            for (let i = 0; i < tiles.length; ++i)
            {
                const tile = tiles[i];
                const card = cards[i];
                const img = tile.querySelector("img");
                img.src = card.imgCrop;
            }
        }

        private buildFolder(title: string, folder: Data.Repository.Folder)
        {
            return <a class="folder" title={ folder.name } onclick={ () => this.loadFolder(folder) }>
                <img src="img/icons/folder.svg" />
                <span>{ title }</span>
            </a>;
        }

        private buildDeck(file: Data.Repository.File, deck: Data.Deck)
        {
            return <a class="deck" deck={ deck } file={ file } title={ deck.name } onrightclick={ this.showContextMenu.bind(this) }>
                <img />
                <span>{ deck.name }</span>
            </a>;
        }

        private showContextMenu(event: PointerEvent)
        {
            const sender = event.currentTarget as HTMLAnchorElement;
            const deck = sender["deck"] as Data.Deck;
            UI.ContextMenu.show(event,
                <menu-button title="Copy TXT" onclick={ async () =>
                {
                    const file = await Data.File.saveDeck(deck, Data.File.TXTFile);
                    navigator.clipboard.writeText(file.text);
                } }><color-icon src="img/icons/clipboard.svg" /><span>Copy TXT</span></menu-button>
            );
        }
    }

    customElements.define("my-shelve", ShelveElement);
}