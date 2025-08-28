namespace Views.Library.List
{
    export class PagingElement extends HTMLElement
    {
        constructor ()
        {
            super();
        }

        public currentPage: number = 1;
        public pageSize: number = 50;
        public items: Data.API.Card[] = [];

        public initializePaging(cards: Data.API.Card[])
        {
            this.currentPage = 1;
            this.pageSize = 50;
            this.items = cards;
        }

        public showPage(newPage: number)
        {
            const list = this.closest("my-card-list") as CardListElement;
            const itemsContainer = list.querySelector(".items");
            this.currentPage = newPage;

            itemsContainer.clearChildren();

            const start = (newPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            for (let i = start; i < end; ++i)
                if (this.items[i]) itemsContainer.appendChild(new CardTileElement(this.items[i]));
            list.scroll({ top: 0 });

            this.createPageLinks();
        }

        public createPageLinks()
        {
            const items: Data.API.Card[] = this.items;
            const pageSize: number = this.pageSize;
            const pages = Math.ceil(items.length / pageSize);
            const currentPage: number = this.currentPage;
            const lastPage = pages;

            this.clearChildren();
            if (lastPage <= 1) return;

            if (currentPage > 1) this.append(<a class="page" onclick={ () => this.showPage(currentPage - 1) }>{ "<" }</a>);
            if (currentPage - 2 > 1) this.append(<a class="page" onclick={ () => this.showPage(1) }>{ "1" }</a>);
            for (let p = currentPage - 2; p <= currentPage + 2; ++p)
            {
                const page = p;
                if (page < 1) continue;
                if (page > lastPage) continue;
                this.append(<a class={ ["page", page == currentPage ? "selected" : null] } onclick={ () => this.showPage(page) }>{ page }</a>);
            }
            if (currentPage + 2 < lastPage) this.append(<a class="page" onclick={ () => this.showPage(lastPage) }>{ lastPage }</a>);
            if (currentPage < lastPage) this.append(<a class="page" onclick={ () => this.showPage(currentPage + 1) }>{ ">" }</a>);
        }
    }

    customElements.define("my-paging", PagingElement);
}