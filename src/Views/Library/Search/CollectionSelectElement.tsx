namespace Views.Library.Search
{
    export class CollectionSelectElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());
        }

        private build()
        {
            return <select onfocus={ this.fillSelect.bind(this) }>
                <option selected value="All Cards">All Cards</option>
            </select>;
        }

        private fillSelect()
        {
            const select = this.querySelector("select");
            const options = Object.keys(App.collections).sort(String.localeCompare);

            for (let i = 0; i < options.length; ++i)
            {
                const oldOption = select.children[i + 1] as HTMLOptionElement;
                if (oldOption?.value == options[i]) continue;
                else select.children[i].after(<option value={ options[i] }>{ options[i] }</option>);
            }

            while ((select.children.length - 1) > options.length)
                select.children[select.children.length - 1].remove();

            for (const option of select.querySelectorAll("option"))
                if (option.value != "All Cards")
                    option["collection"] = App.collections[option.value];
        }

        public get collection(): Data.Collection
        {
            const select = this.querySelector("select");
            return select.selectedOptions[0]?.["collection"] as Data.Collection;
        }
    }

    customElements.define("my-collection-select", CollectionSelectElement);
}