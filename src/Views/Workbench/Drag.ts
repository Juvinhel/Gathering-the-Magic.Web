namespace Views.Workbench
{
    export function preventDrag(this: EntryElement | SectionHeaderElement, event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
    }

    export function dragStart(this: EntryElement | SectionHeaderElement, event: DragEvent)
    {
        event.stopPropagation();
        if (this.closest("swipe-container"))
        {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        const data: TransferData = serializeElements(this);
        event.dataTransfer.setData("text", JSON.stringify(data));
        event.dataTransfer.effectAllowed = "all";
    }

    export function dragOver(this: EntryElement | SectionHeaderElement, event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
        if (event.getModifierState("Control"))
            event.dataTransfer.dropEffect = "copy";
        else
            event.dataTransfer.dropEffect = "move";
        this.classList.add("drag-over");
    }

    export function dragLeave(this: EntryElement | SectionHeaderElement, event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
        this.classList.remove("drag-over");
    }

    export async function drop(this: EntryElement | SectionHeaderElement, event: DragEvent)
    {
        try
        {
            event.preventDefault();
            event.stopPropagation();

            this.classList.remove("drag-over");
            const dragTarget = this instanceof SectionHeaderElement ? this.section : this;
            const isSection = dragTarget instanceof SectionElement;

            const data = event.dataTransfer.getData("text");
            if (!data) return;

            const draggedData = await parseTransferData(data);
            const newElements: HTMLElement[] = [];
            if (Array.isArray(draggedData))
            {
                for (const dragItem of draggedData)
                {
                    if ("name" in dragItem)
                    {
                        const newEntry = new EntryElement(dragItem as Data.Entry);
                        newElements.push(newEntry);
                    }
                    else
                    {
                        const newSection = new SectionElement(dragItem as Data.Section, false);
                        newElements.push(newSection);
                    }
                }
            }
            else if ("name" in draggedData)
            {
                const newEntry = new EntryElement(draggedData as Data.Entry);
                newElements.push(newEntry);
            } else
            {
                const newSection = new SectionElement(draggedData as Data.Section, false);
                newElements.push(newSection);
            }

            if (isSection)
            {
                dragTarget.querySelector(".list").append(...newElements);
            }
            else
            {
                dragTarget.after(...newElements);
            }

            newElements.last().scrollIntoView({ behavior: "smooth", block: "center" });
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    export function dragEnd(this: EntryElement | SectionHeaderElement, event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
        this.classList.remove("drag-over");

        // clear all selections after drag'n'drop
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        for (const element of workbench.querySelectorAll(".card-container.selected"))
            element.classList.remove("selected");

        if (event.dataTransfer.dropEffect === "move")
        {
            if (this.classList.contains("top-level"))
            {
                const list = this.querySelector(".list");
                list.clearChildren();
            }
            else
                this.remove();
        }
    }

    async function parseTransferData(data: string): Promise<TransferData>
    {
        const progressDialog = await UI.Dialog.progress({ title: "Gathering card info!", displayType: "Absolute" });
        try
        {
            let TransferData: TransferData;
            if (data.trim().startsWithAny(["[", "{"])) 
            {
                TransferData = JSON.parse(data);
            }
            else if (data.startsWith("https://") || data.startsWith("http://"))
            {
                const identifier = await Data.API.getIdentifierFromUrl(data);
                TransferData = { ...identifier, quantity: 1 };
            }
            else
            {
                TransferData = [];
                const lines = data.splitLines().map(x => x.trim());
                for (const line of lines)
                {
                    if (!line) continue; // remove empty lines
                    if (line.startsWith("//")) continue; // remove comments

                    let quantity: number = 1;
                    let name: string;
                    const match = line.match(/^(?<quantity>\d+)\s+(?<name>.*)$/);
                    if (match)
                    {
                        quantity = parseInt(match.groups["quantity"]);
                        name = match.groups["name"];
                    }
                    else
                        name = line;

                    TransferData.push({ quantity: quantity, name: name.trim() });
                }
            }

            const cards: TransferCard[] = [];
            flattenTransferData(cards, TransferData);

            progressDialog.max = cards.length;
            progressDialog.value = 0;
            let i = 0;
            for await (const apiCard of Data.API.getCards(cards))
            {
                const card = cards[i];
                for (const key of Object.keys(card))
                    if (key != "quantity")
                        delete card[key];

                Object.assign(card, apiCard);
                if (card.quantity == null) card.quantity = 1;

                ++i;
                progressDialog.value = i;
            }

            return TransferData;
        }
        finally
        {
            progressDialog.close();
        }
    }

    function flattenTransferData(result: TransferCard[], data: TransferData)
    {
        if (Array.isArray(data))
        {
            for (const item of data)
                flattenTransferData(result, item);
        }
        else if ("title" in data)
        {
            for (const item of data.items)
                flattenTransferData(result, item);
        }
        else if ("name" in data || "id" in data || ("set" in data && "no" in data))
            result.push(data);
        else
            throw new DataError("Unknown TransferData", { data });
    }
}