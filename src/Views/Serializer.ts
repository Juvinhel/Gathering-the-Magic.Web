namespace Views
{
    export function serializeElements(...elements: HTMLElement[]): TransferData
    {
        if (elements.length > 1)
        {
            const children: HTMLElement[] = [...elements].distinct();
            return children.map(getTransferData);
        }
        else
            return getTransferData(elements[0]);
    }

    function getTransferData(element: HTMLElement): TransferCard | TransferSection
    {
        if (element instanceof Workbench.EntryElement)
        {
            const ret: TransferCard = { quantity: element.quantity, name: element.title };
            if (element.comment) ret.comment = element.comment;
            return ret;
        }
        else if (element instanceof Workbench.SectionElement || element instanceof Workbench.SectionHeaderElement)
        {
            const e = (element instanceof Workbench.SectionHeaderElement ? element.parentElement : element) as Workbench.SectionElement;
            const children = [...e.querySelector(".list").children];
            const ret: TransferSection = { title: e.title, items: children.map(getTransferData) };
            if (e.comment) ret.comment = e.comment;
            return ret;
        }
        else if (element instanceof Library.List.CardTileElement)
        {
            const ret: TransferCard = { name: element.card.name };
            return ret;
        }
        else
            throw new Error("Cannot get tranferData of Element!", { cause: { element } });
    }

    export type TransferCard = Data.API.Identifier & { quantity?: number; comment?: string; };
    export type TransferSection = { title: string, items: (TransferCard | TransferSection)[]; comment?: string; };
    export type TransferData = TransferCard | TransferSection | (TransferCard | TransferSection)[];
}