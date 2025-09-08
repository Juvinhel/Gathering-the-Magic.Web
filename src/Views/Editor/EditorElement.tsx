namespace Views.Editor
{
    export class EditorElement extends HTMLElement
    {
        constructor (useLibrary: boolean = true, useWorkbench: boolean = true)
        {
            super();

            this.useLibrary = useLibrary;
            this.useWorkbench = useWorkbench;

            this.append(...this.build());

            this.addEventListener("sizechanged", this.sizeChanged.bind(this));
            this.addEventListener("cardhovered", this.cardHovered.bind(this));
            this.addEventListener("cardselected", this.cardSelected.bind(this));
            this.addEventListener("deckchanged", this.deckChanged.bind(this));
            this.addEventListener("cardsearchstarted", this.cardSearchStarted.bind(this));
            this.addEventListener("cardsearchfinished", this.cardSearchFinished.bind(this));
        }

        public readonly useLibrary: boolean;
        public readonly useWorkbench: boolean;

        private build()
        {
            return [
                Menu(this.useLibrary, this.useWorkbench),
                this.useLibrary ? <Library.LibraryElement /> : null,
                <Info.CardInfoElement />,
                this.useWorkbench ? <Workbench.WorkbenchElement /> : null,
                <Footer />
            ].filter(x => x);
        }

        private selectedCard: Data.API.Card;
        private hoveredCard: Data.API.Card;

        private layout: "Panes" | "Swipe" = null;
        private sizeChanged(event: UI.Events.SizeChangedEvent)
        {   // gets called once oninsert anyway
            const newLayout = event.newSize.width < 1024 ? "Swipe" : "Panes";
            if (this.layout !== newLayout)
            {
                this.layout = newLayout;
                this.refreshLayout();
            }
        }

        private refreshLayout()
        {
            const library = this.querySelector("my-library") as Library.LibraryElement;
            const cardInfo = this.querySelector("my-card-info") as Info.CardInfoElement;
            const workbench = this.querySelector("my-workbench") as Workbench.WorkbenchElement;
            library?.remove();
            cardInfo?.remove();
            workbench?.remove();

            for (const child of [...this.children])
            {
                if (child.classList.contains("menu")) continue;
                if (child.classList.contains("footer")) continue;
                child.remove();
            }

            if (this.layout == "Swipe")
                this.appendChild(<swipe-container class="container" index={ 1 }>{ [library, workbench, cardInfo].filter(e => e).map(e => <div>{ e }</div>) }</swipe-container>);
            else
                this.appendChild(<pane-container class="container">{ [library, cardInfo, workbench].filter(e => e).map(e => <div>{ e }</div>) }</pane-container>);
        }

        private async cardHovered(event: CustomEvent) 
        {
            this.hoveredCard = event.detail.card as Data.API.Card;

            const cardInfo = this.querySelector("my-card-info") as Info.CardInfoElement;
            cardInfo.loadData(this.hoveredCard ?? this.selectedCard);
        }

        private async cardSelected(event: CustomEvent) 
        {
            this.selectedCard = event.detail.card as Data.API.Card;

            const cardInfo = this.querySelector("my-card-info") as Info.CardInfoElement;
            cardInfo.loadData(this.hoveredCard ?? this.selectedCard);

            if (!App.ctrl)
                for (const cardContainer of this.querySelectorAll(".card-container.selected, my-section.selected"))
                    if (cardContainer != event.target)
                        cardContainer.classList.toggle("selected", false);
        }

        private deckChanged(event: Event)
        {
            const unsavedProgress = this.querySelector(".unsaved-progress") as HTMLElement;
            unsavedProgress.classList.toggle("none", false);
        }

        private cardSearchStarted(event: Event)
        {
            const searchRunning = this.querySelector(".search-running") as HTMLElement;
            searchRunning.classList.toggle("none", false);
        }

        private cardSearchFinished(event: Event)
        {
            const searchRunning = this.querySelector(".search-running") as HTMLElement;
            searchRunning.classList.toggle("none", true);
        }

        public hasLibrary;
        public hasWorkbench;

        private popup: Window;
        public unDock(): "Docked" | "Undocked"
        {
            let library = this.querySelector("my-library") as Library.LibraryElement;

            if (library)
            {   // docked => undocked

                library.remove();

                this.refreshLayout();

                //this.popup = window.open("popup.html", "Library", "status=no,location=no,toolbar=no,menubar=no");
                //this.popup.document.body.append(library);
                return "Undocked";
            }
            else
            {   // undocked => docked
                library = this.popup?.document.body.querySelector("my-library") as Library.LibraryElement;
                if (!library)
                    // popup got closed unexpectedly
                    library = new Library.LibraryElement();
                this.popup?.close();

                this.append(library);
                this.refreshLayout();
                return "Docked";
            }
        }
    }

    customElements.define("my-editor", EditorElement);
}