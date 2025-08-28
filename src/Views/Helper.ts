namespace Views
{
    export function swapElements(a: Element, b: Element)
    {
        var aParent = a.parentNode;
        var bParent = b.parentNode;

        var aHolder = document.createElement("div");
        var bHolder = document.createElement("div");

        aParent.replaceChild(aHolder, a);
        bParent.replaceChild(bHolder, b);

        aParent.replaceChild(b, aHolder);
        bParent.replaceChild(a, bHolder);
    }
}