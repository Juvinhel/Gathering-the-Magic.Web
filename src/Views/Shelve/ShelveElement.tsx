namespace Views.Shelve
{
    export class ShelveElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.root = new URL("/repository", location.toString()).toString();

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

        public root: string;
        async connectedCallback()
        {
            this.loadFolder(this.root);
        }

        private deckExtensions: string[] = Data.File.deckFileFormats.mapMany(x => x.extensions);
        private collectionsExtensions: string[] = Data.File.collectionFileFormats.mapMany(x => x.extensions);

        private async loadFolder(url: string)
        {
            url = new URL(url, location.toString()).toString();
            this.folderListElement.clearChildren();
            this.deckListElement.clearChildren();
            const currentDepth = url.split("/").length - 1;

            for (let href of (await DirectoryListing.scan(url)).orderBy(x => x))
            {
                if (href.endsWith("/"))
                {   // is folder
                    href = href.trimRight("/");
                    const depth = href.split("/").length - 1;
                    const name = decodeURIComponent(href.splitLast("/")[1]);
                    if (depth < currentDepth)
                        // one level up
                        this.folderListElement.prepend(this.buildFolder("...", href));
                    else
                        this.folderListElement.append(this.buildFolder(name, href));
                }
                else
                {
                    const response = await fetch(href);
                    const text = await response.text();
                    const fileName = href.splitLast("/")[1];
                    const extension = fileName.splitLast(".")[1];

                    if (this.deckExtensions.includes(extension.toLowerCase()))
                        try
                        {
                            const deck = await Data.File.loadDeck(text, extension, false);
                            const tile = this.buildDeck(href, deck) as HTMLAnchorElement;
                            this.deckListElement.append(tile);
                        } catch { /* file might be malformed */ }
                    else if (this.collectionsExtensions.includes(extension.toLowerCase()))
                        try
                        {

                        } catch { /* file might be malformed */ }
                }
            }

            if (url != this.root)
                this.folderListElement.prepend(this.buildFolder("~", this.root));

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

        private buildFolder(title: string, url: string)
        {
            return <a class="folder" title={ title } onclick={ () => this.loadFolder(url) }>
                <img src="img/icons/folder.svg" />
                <span>{ title }</span>
            </a>;
        }

        private buildDeck(url: string, deck: Data.Deck)
        {
            return <a class="deck" deck={ deck } url={ url } title={ deck.name } onrightclick={ this.showContextMenu.bind(this) }>
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