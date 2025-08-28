namespace Views.Info
{
    export class CardInfoElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <a class="card-link" target="_blank">
                    <h1 class="card-name">Card Name</h1>
                    <h2 class="card-mana-cost"></h2>
                </a>,
                <a class={ ["card-image", "empty"] } onclick={ this.imageClick.bind(this) }>
                    <img class="card-face" />
                </a>,
                <a class={ ["transform-card", "none"] } onclick={ this.swapFace.bind(this) }><color-icon src="img/icons/arrow-turn-arround.svg" /></a>,
                <span class="card-types" />,
                <p class="card-text" />,
                <div class="legalities" />,
                <ul class="links" />
            ];
        }

        private currentCard: Data.API.Card;
        public loadData(card: Data.API.Card)
        {
            this.currentCard = card;

            const primaryLink = card?.links.Scryfall;
            const cardLink = this.querySelector(".card-link") as HTMLAnchorElement;
            cardLink.href = primaryLink;
            const cardImage = this.querySelector(".card-image") as HTMLAnchorElement;
            cardImage.classList.toggle("empty", card == null);

            this.showCard(card?.isTransform ? card.faces[0] : card);

            const legalities = this.querySelector(".legalities") as HTMLElement;
            legalities.clearChildren();
            legalities.append(LegalBadge("standard", card?.legalities?.["standard"]));
            legalities.append(LegalBadge("modern", card?.legalities?.["modern"]));
            legalities.append(LegalBadge("vintage", card?.legalities?.["vintage"]));
            legalities.append(LegalBadge("commander", card?.legalities?.["commander"]));
            legalities.append(LegalBadge("pauper", card?.legalities?.["pauper"]));
            legalities.append(LegalBadge("penny", card?.legalities?.["penny"]));

            const links = this.querySelector(".links") as HTMLUListElement;
            links.clearChildren();
            if (card)
                for (const link of Object.entries(card.links))
                    links.append(<li><a href={ link[1] } target="_blank"><img src={ "img/icons/" + link[0].toLowerCase() + ".svg" } /><span>{ link[0] }</span></a></li>);

            const transformCardButton = this.querySelector(".transform-card");
            transformCardButton.classList.toggle("transformed", false);
            transformCardButton.classList.toggle("none", !(card?.isFlip || card?.isTransform));
        }

        private swapFace(event: Event)
        {
            event.preventDefault();
            if (!this.currentCard) return;

            const transformCardButton = this.querySelector(".transform-card");

            const isTransformed = transformCardButton.classList.toggle("transformed");

            if (isTransformed)
            {
                const backside = this.currentCard.faces[1];
                this.showCard(backside);
            }
            else
            {
                const frontside = this.currentCard.faces[0];
                this.showCard(frontside);
            }

        }

        private showCard(card?: { name: string; manaCost: string; img: string; text: string; typeLine: string; })
        {
            const cardName = this.querySelector(".card-name") as HTMLHeadElement;
            const cardManaCost = this.querySelector(".card-mana-cost") as HTMLHeadElement;

            const cardFace = this.querySelector(".card-face") as HTMLImageElement;

            const cardText = this.querySelector(".card-text") as HTMLParagraphElement;
            const cardTypes = this.querySelector(".card-types") as HTMLSpanElement;

            cardName.textContent = card?.name ?? "Card Name";
            cardName.title = card?.name;

            cardManaCost.innerHTML = parseSymbolText(card?.manaCost);
            cardManaCost.title = card?.manaCost;

            if (this.currentCard == null)
            {
                cardFace.removeAttribute("src");
            }
            else if (this.currentCard?.isFlip)
            {
                cardFace.src = this.currentCard?.img;
                const isFlipped = this.currentCard.faces[1] == card;
                cardFace.classList.toggle("rot180", isFlipped);
            }
            else
            {
                cardFace.src = card?.img;
                const isSideways = card != null ? (this.currentCard.layout == "split" || card.typeLine.match(/(?:^|\W)battle(?:$|\W)/i)) != null : false;
                cardFace.classList.toggle("rot90", isSideways);
            }

            cardText.innerHTML = parseSymbolText(card?.text);
            cardText.title = card?.text;

            cardTypes.textContent = card?.typeLine;
            cardTypes.title = card?.typeLine;
        }

        private imageClick(event: Event)
        {
            const target = event.currentTarget as HTMLElement;
            const src = target.querySelector("img").src;
            if (src) UI.Dialog.lightBox({ pages: [{ content: src }] });
        }
    }

    customElements.define("my-card-info", CardInfoElement);
}