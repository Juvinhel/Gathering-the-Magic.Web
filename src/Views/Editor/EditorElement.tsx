namespace Views.Editor
{
    export class EditorElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("sizechanged", this.sizeChanged.bind(this));
            this.addEventListener("cardhovered", this.cardHovered.bind(this));
            this.addEventListener("cardselected", this.cardSelected.bind(this));
            this.addEventListener("deckchanged", this.deckChanged.bind(this));
            this.addEventListener("cardsearchstarted", this.cardSearchStarted.bind(this));
            this.addEventListener("cardsearchfinished", this.cardSearchFinished.bind(this));
        }

        private build()
        {
            return [
                <Menu />,
                <Library.LibraryElement />,
                <Info.CardInfoElement />,
                <Workbench.WorkbenchElement />,
                <Footer />
            ];
        }

        private selectedCard: Data.API.Card;
        private hoveredCard: Data.API.Card;

        private oldMode = null;
        private sizeChanged(event: UI.Events.SizeChangedEvent)
        {   // gets called once oninsert anyway
            const isSmall = event.newSize.width < 1024;
            if (this.oldMode !== isSmall)
            {
                this.oldMode = isSmall;
                const library = this.querySelector("my-library") as Library.LibraryElement;
                const cardInfo = this.querySelector("my-card-info") as Info.CardInfoElement;
                const workbench = this.querySelector("my-workbench") as Workbench.WorkbenchElement;
                library.remove();
                cardInfo.remove();
                workbench.remove();

                for (const child of [...this.children])
                {
                    if (child.classList.contains("menu")) continue;
                    if (child.classList.contains("footer")) continue;
                    child.remove();
                }

                if (isSmall)
                    this.appendChild(<swipe-container class="container" index={ 1 }>{ library }{ workbench }{ cardInfo }</swipe-container>);
                else
                    this.appendChild(<pane-container class="container"><div>{ library }</div><div>{ cardInfo }</div><div>{ workbench }</div></pane-container>);
            }
        }

        private async cardHovered(event: CustomEvent) 
        {
            this.hoveredCard = event.detail.card as Data.API.Card;

            const cardInfo = this.querySelector("my-card-info") as Info.CardInfoElement;
            cardInfo.loadData(this.hoveredCard ?? this.selectedCard);
        }

        private async cardSelected(event: CustomEvent) 
        {
            const cardElement = event.target as HTMLElement;
            this.selectedCard = event.detail.card as Data.API.Card;

            for (const element of this.querySelectorAll(".card-container.selected"))
                if (element != cardElement)
                    element.classList.remove("selected");

            const cardInfo = this.querySelector("my-card-info") as Info.CardInfoElement;
            cardInfo.loadData(this.hoveredCard ?? this.selectedCard);
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
    }

    customElements.define("my-editor", EditorElement);
}