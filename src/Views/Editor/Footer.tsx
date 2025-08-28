namespace Views.Editor
{
    export function Footer()
    {
        return <div class="footer">
            <span class={ ["search-running", "none"] }>Search is still running!</span>
            <span class={ ["unsaved-progress", "none"] }><color-icon src="img/icons/save.svg" /><span>Progress not saved!</span></span>
        </div>;
    }
}