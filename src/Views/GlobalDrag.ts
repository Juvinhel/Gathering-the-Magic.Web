namespace Views
{
    export function initGlobalDrag()
    {
        document.addEventListener("dragstart", beginDrag, { capture: true });
        document.addEventListener("dragenter", beginDrag, { capture: true });

        document.addEventListener("dragend", endDrag, { capture: true });
        document.addEventListener("dragleave", (event: DragEvent) =>
        {
            const draggedOffScreen: boolean = event.screenX === 0 && event.screenY === 0;
            if (draggedOffScreen) endDrag();
        }, { capture: true });
        document.addEventListener("visibilitychange", () => { if (document.visibilityState == "hidden") endDrag(); }, { capture: true });
    }

    function beginDrag()
    {
        document.body.style.touchAction = "none";
        beginEdgeScroll();
    }

    function endDrag()
    {
        document.body.style.touchAction = "auto";
        endEdgeScroll();
    }

    let container: HTMLElement;
    let interval: number;
    function beginEdgeScroll()
    {
        if (interval) return;

        container = document.querySelector("my-workbench");
        interval = setInterval(edgeScroll, 50);
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("dragover", mouseMove);
    }

    const mousePosition: { clientX: number; clientY: number; } = { clientX: -1, clientY: -1, };
    function mouseMove(event: MouseEvent | DragEvent)
    {
        mousePosition.clientX = event.clientX;
        mousePosition.clientY = event.clientY;
    }

    function edgeScroll()
    {
        const y = mousePosition.clientY;
        const x = mousePosition.clientX;
        const containerBounds = container.getBoundingClientRect();
        const top = containerBounds.top;
        const bottom = containerBounds.bottom;
        const left = containerBounds.left;
        const right = containerBounds.right;
        if (x < left || x > right) return;

        const distanceTop = y - (top + 10);
        const distanceBottom = y - (bottom - 10);
        if (distanceTop < 0) container.scrollBy({ top: distanceTop });
        if (distanceBottom > 0) container.scrollBy({ top: distanceBottom });
    }

    function endEdgeScroll()
    {
        container = null;
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("dragover", mouseMove);
        clearInterval(interval);
        interval = null;
    }

}