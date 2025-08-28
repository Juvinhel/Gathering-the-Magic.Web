namespace Views.Library
{
    export class LibraryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <Search.SearchElement />,
                <List.CardListElement />
            ];
        }
    }

    customElements.define("my-library", LibraryElement);
}