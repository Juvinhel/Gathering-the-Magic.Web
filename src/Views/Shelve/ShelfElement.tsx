namespace Views.Shelf
{
    export class ShelfElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.root = new URL("/repository", location.toString()).toString();

            this.append(...this.build());
        }

        private folderListElement: HTMLDivElement;
        private fileListElement: HTMLDivElement;

        private build()
        {
            return [
                <h1>Shelf</h1>,
                <div>
                    { this.folderListElement = <div class="folder-list" /> as HTMLDivElement }
                    { this.fileListElement = <div class="file-list" /> as HTMLDivElement }
                </div>
            ];
        }

        public root: string;
        async connectedCallback()
        {
            this.loadFolder(this.root);

            const folders = await Data.Bridge.GetFolders("");

            const file = await Data.Bridge.ReadFile("/Decks/Multicolor Lands.idec") as number[];
            const buff = new Uint8Array(file);

            await Data.Bridge.WriteFile("", Array.from(buff));
        }

        private deckExtensions: string[] = Data.File.deckFileFormats.mapMany(x => x.extensions);
        private collectionsExtensions: string[] = Data.File.collectionFileFormats.mapMany(x => x.extensions);

        private async loadFolder(url: string)
        {
            url = new URL(url, location.toString()).toString();
            this.folderListElement.clearChildren();
            this.fileListElement.clearChildren();
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
                            this.fileListElement.append(tile);
                        } catch { /* file might be malformed */ }
                    else if (this.collectionsExtensions.includes(extension.toLowerCase()))
                        try
                        {
                            this.fileListElement.append(this.buildCollection(href));
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
            return <a class="folder" title={ title } ondblclick={ () => this.loadFolder(url) }>
                <img src="img/icons/folder.svg" />
                <span>{ title }</span>
            </a>;
        }

        private buildDeck(url: string, deck: Data.Deck)
        {
            const fileName = url.splitLast("/")[1];
            const name = decodeURIComponent(fileName.splitLast(".")[0]);

            return <a class="deck" deck={ deck } url={ url } title={ deck.name ?? name }
                onrightclick={ this.showContextMenu.bind(this) }
                ondblclick={ async () =>
                {
                    const response = await fetch(url);
                    const text = await response.text();
                    const fileName = url.splitLast("/")[1];
                    const extension = fileName.splitLast(".")[1];
                    const deck = await Data.File.loadDeck(text, extension);

                    const editor = new Editor.EditorElement(false, true);
                    // show over top bar and border
                    editor.style.margin = "-4em -2em -2em -2em";
                    editor.style.height = "calc(100% + 2em)";

                    const workbench = editor.querySelector("my-workbench") as Views.Workbench.WorkbenchElement;
                    await workbench.loadData(deck);

                    const unsavedProgress = editor.querySelector(".unsaved-progress") as HTMLElement;
                    unsavedProgress.classList.toggle("none", true);

                    UI.Dialog.show(editor, { title: "", mode: "fill", allowClose: true });
                } }>
                <img />
                <span>{ deck.name ?? name }</span>
            </a>;
        }

        private buildCollection(url: string)
        {
            const fileName = url.splitLast("/")[1];
            const name = decodeURIComponent(fileName.splitLast(".")[0]);
            return <a class="collection" url={ url } title={ name }
                ondblclick={ async () =>
                {
                    for (const key in App.collections) delete App.collections[key];

                    const response = await fetch(url);
                    const text = await response.text();
                    const collection = await Data.File.CSVFile.load(text);
                    collection.name = name;
                    for (const key in App.collections)
                        delete App.collections[key];
                    App.collections[name] = collection;

                    const editor = new Editor.EditorElement(true, false);
                    // show over top bar and border
                    editor.style.margin = "-4em -2em -2em -2em";
                    editor.style.height = "calc(100% + 2em)";

                    UI.Dialog.show(editor, { title: "", mode: "fill", allowClose: true });
                } }>
                <img src="img/icons/binder.svg" />
                <span>{ name }</span>
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

    customElements.define("my-shelf", ShelfElement);
}