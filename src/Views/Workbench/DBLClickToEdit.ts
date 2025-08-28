namespace Views.Workbench
{
    export function doubleClickToEdit(event: MouseEvent)
    {
        const originalElement = event.currentTarget as HTMLElement;

        const input = document.createElement("input");
        input.type = "text";
        input.value = originalElement.textContent || "";
        input.classList.add(...originalElement.classList);
        input.addEventListener("focusout", () =>
        {
            const newText = input.value.trim();
            const oldText = originalElement.textContent;
            originalElement.textContent = newText;
            input.replaceWith(originalElement);
            if (newText != oldText)
                originalElement.dispatchEvent(new Event("change", { bubbles: true }));
        });
        input.addEventListener("keyup", (e: KeyboardEvent) =>
        {
            if (e.key === "Enter")
            {
                originalElement.textContent = input.value.trim();
                input.blur();
            }
            if (e.key === "Escape")
            {
                input.value = originalElement.textContent;
                input.blur();
            }
        });
        originalElement.replaceWith(input);
        input.focus();
    }
}