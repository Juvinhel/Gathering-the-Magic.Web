namespace Views.Library.Search
{
    export class AllowedModesElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <toggle-button class="allow-standard">Standard</toggle-button>,
                <toggle-button class="allow-modern">Modern</toggle-button>,
                <toggle-button class="allow-vintage">Vintage</toggle-button>,
                <toggle-button class="allow-commander">Commander</toggle-button>,
                <toggle-button class="allow-pauper">Pauper</toggle-button>,
                <toggle-button class="allow-penny">Penny</toggle-button>,
            ];
        }

        public get modes(): string[]
        {
            const ret = [];
            for (const toggleButton of this.querySelectorAll(":scope > toggle-button") as NodeListOf<HTMLToggleButton>)
            {
                const checked = toggleButton.checked;
                if (checked) ret.push(toggleButton.innerText.toLowerCase());
            }
            return ret;
        }
    }

    customElements.define("my-allowed-modes", AllowedModesElement);
}