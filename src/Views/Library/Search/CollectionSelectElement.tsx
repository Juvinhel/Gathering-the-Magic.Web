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
                <option selected value="All Collections">All Collections</option>
            </select>;
        }

        private fillSelect()
        {
            const select = this.querySelector("select");
            const options = Object.keys(App.collections).sort(String.localeCompare);

            for (let i = 0; i < options.length; ++i)
            {
                const newOptionValue = options[i];
                const oldOption = select.children[i + 2] as HTMLOptionElement;

                if (oldOption?.value == newOptionValue) continue;
                else 
                {
                    const previousSibling = oldOption?.previousElementSibling;
                    oldOption?.remove();
                    const newOption = <option value={ newOptionValue }>{ newOptionValue }</option>;
                    if (previousSibling) previousSibling.after(newOption);
                    else select.append(newOption);
                }
            }

            while (select.children.length > options.length - 2)
                select.children[select.children.length - 1].remove();

            const allCollectionsOption = select.children[1] as HTMLOptionElement;
            allCollectionsOption["collection"] = Data.combineCollections("All Collection", Object.values(App.collections));

            for (let i = 2; i < options.length; ++i)
            {
                const option = select.children[i] as HTMLOptionElement;
                option["collection"] = App.collections[option.value];
            }
        }

        public get collection(): Data.Collection
        {
            const select = this.querySelector("select");
            return select.selectedOptions[0]?.["collection"] as Data.Collection;
        }
    }

    customElements.define("my-collection-select", CollectionSelectElement);
}