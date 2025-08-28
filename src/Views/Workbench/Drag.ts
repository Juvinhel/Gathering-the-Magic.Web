namespace Views.Workbench
{
    export function preventDrag(this: EntryElement | SectionElement, event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
    }

    export function dragStart(this: EntryElement | SectionElement, event: DragEvent)
    {
        event.stopPropagation();
        if (this.closest("swipe-container"))
        {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        let data: DragData;
        data = buildDragData(this);
        event.dataTransfer.setData("text", JSON.stringify(data));
        event.dataTransfer.effectAllowed = "all";
    }

    export function dragOver(this: EntryElement | SectionElement, event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
        if (event.getModifierState("Control"))
            event.dataTransfer.dropEffect = "copy";
        else
            event.dataTransfer.dropEffect = "move";
        this.classList.add("drag-over");
    }

    export function dragLeave(this: EntryElement | SectionElement, event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
        this.classList.remove("drag-over");
    }

    function getDragTarget(event: DragEvent): SectionElement | EntryElement
    {
        if ((event.target as Element).tagName === "INPUT") return;

        let target = event.target as Element;
        return target.closest("my-section, my-entry");
    }

    export async function drop(this: EntryElement | SectionElement, event: DragEvent)
    {
        try
        {
            event.preventDefault();
            event.stopPropagation();

            this.classList.remove("drag-over");
            const isSection = this instanceof SectionElement;

            const data = event.dataTransfer.getData("text");
            if (!data) return;

            const draggedData = await parseDragData(data);
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
                this.querySelector(".list").append(...newElements);
            }
            else
            {
                this.after(...newElements);
            }

            newElements.last().scrollIntoView({ behavior: "smooth", block: "center" });
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    export function dragEnd(this: EntryElement | SectionElement, event: DragEvent)
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

    function getDragData(element: HTMLElement): any
    {
        if (element instanceof EntryElement)
            return { quantity: element.quantity, name: element.card.name };
        else if (element instanceof SectionElement)
        {
            const title = element.title;
            const children = [...element.querySelector(".list").children];
            return { title, items: children.map(getDragData) };
        }
        else throw new Error("Cannot get dragdata of Element!");
    }

    export function buildDragData(elements: HTMLElement | HTMLElement[]): DragData
    {
        if (Array.isArray(elements))
        {
            const children: HTMLElement[] = [...elements];
            for (let i = 0; i < children.length; ++i)
            {
                const child = children[i];

                for (let x = i + 1; x < children.length; ++x)
                {
                    if (child.contains(children[x]))
                    {
                        children.removeAt(x);
                        --x;
                    }
                }
            }

            return children.map(getDragData).filter(x => x != null);
        }
        else
            return getDragData(elements as HTMLElement);
    }

    async function parseDragData(data: string): Promise<DragData>
    {
        const progressDialog = await UI.Dialog.progress({ title: "Gathering card info!", displayType: "Absolute" });
        try
        {
            let dragData: DragData;
            if (data.trim().startsWithAny(["[", "{"])) 
            {
                dragData = JSON.parse(data);
            }
            else if (data.startsWith("https://") || data.startsWith("http://"))
            {
                const identifier = await Data.API.getIdentifierFromUrl(data);
                dragData = { ...identifier, quantity: 1 };
            }
            else
            {
                dragData = [];
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

                    dragData.push({ quantity: quantity, name: name.trim() });
                }
            }

            const cards: DragCard[] = [];
            flattenDragData(cards, dragData);

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

            return dragData;
        }
        finally
        {
            progressDialog.close();
        }
    }

    function flattenDragData(result: DragCard[], data: DragData)
    {
        if (Array.isArray(data))
        {
            for (const item of data)
                flattenDragData(result, item);
        }
        else if ("title" in data)
        {
            for (const item of data.items)
                flattenDragData(result, item);
        }
        else if ("name" in data || "id" in data || ("set" in data && "no" in data))
            result.push(data);
        else
            throw new DataError("Unknown DragData", { data });
    }

    export type DragCard = Data.API.Identifier & { quantity: number; };
    export type DragSection = { title: "string", items: (DragCard | DragSection)[]; };
    export type DragData = DragCard | DragSection | (DragCard | DragSection)[];
}