namespace Views.Workbench
{
    export function preventDrag(event: DragEvent)
    {
        event.preventDefault();
        event.stopPropagation();
    }

    export function dragStart(event: DragEvent)
    {
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement;
        if (target.closest("swipe-container"))
        {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        let data: DragData;
        data = buildDragData(target);
        event.dataTransfer.setData("text", JSON.stringify(data));
        event.dataTransfer.effectAllowed = "all";
    }

    export function dragOver(event: DragEvent)
    {
        const target = getDragTarget(event);
        if (!target) return;

        event.preventDefault();
        event.stopPropagation();
        if (event.getModifierState("Control"))
            event.dataTransfer.dropEffect = "copy";
        else
            event.dataTransfer.dropEffect = "move";
        target.classList.add("drag-over");
    }

    export function dragLeave(event: DragEvent)
    {
        const target = getDragTarget(event);
        if (!target) return;

        event.preventDefault();
        event.stopPropagation();
        target.classList.remove("drag-over");
    }

    function getDragTarget(event: DragEvent): HTMLElement
    {
        if ((event.target as Element).tagName === "INPUT") return;

        let target = event.target as Element;
        if (!target.hasAttribute("draggable"))
            target = target.closest("[draggable]");
        return target as HTMLElement;
    }

    export async function drop(event: DragEvent)
    {
        try
        {
            const target = getDragTarget(event);
            if (!target) return;

            event.preventDefault();
            event.stopPropagation();

            target.classList.remove("drag-over");
            const isSection = target.classList.contains("section");

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
                        const newEntry = new EntryElement(dragItem as Data.Entry) as HTMLElement;
                        newElements.push(newEntry);
                    }
                    else
                    {
                        const newSection = new SectionElement(dragItem as Data.Section, false) as HTMLElement;
                        newElements.push(newSection);
                    }
                }
            }
            else if ("name" in draggedData)
            {
                const newEntry = new EntryElement(draggedData as Data.Entry) as HTMLElement;
                newElements.push(newEntry);
            } else
            {
                const newSection = new SectionElement(draggedData as Data.Section, false) as HTMLElement;
                newElements.push(newSection);
            }

            if (isSection)
            {
                target.querySelector(".list").append(...newElements);
            }
            else
            {
                target.after(...newElements);
            }

            newElements.last().scrollIntoView({ behavior: "smooth", block: "center" });
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    export function dragEnd(event: DragEvent)
    {
        const target = getDragTarget(event);
        if (!target) return;

        event.preventDefault();
        event.stopPropagation();
        target.classList.remove("drag-over");

        if (event.dataTransfer.dropEffect === "move")
        {
            if (target.classList.contains("top-level"))
            {
                const list = target.querySelector(".list");
                list.clearChildren();
            }
            else
                target.remove();
        }
    }

    function getDragData(element: HTMLElement): any
    {
        if (element.classList.contains("entry"))
        {
            const entry = element as HTMLDivElement;
            const quantity = parseInt((entry.querySelector(".quantity") as HTMLInputElement)?.value);
            const name = entry.querySelector(".name")?.textContent || "";
            return { quantity, name };
        }
        else if (element.classList.contains("section"))
        {
            const section = element as HTMLDivElement;
            const title = section.querySelector(".title")?.textContent || "";
            const list = section.querySelector(".list");
            return { title, items: [...list.children].map(getDragData).filter(x => x != null) };
        }
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