namespace Data.Repository
{
    export async function loadRepository(url?: string): Promise<Folder>
    {
        const builder = new Builder(url);
        return await builder.run();
    }

    export class Builder
    {
        constructor (url?: string)
        {
            this.url = url ?? "repository";
            if (!(this.url.startsWith("http://") || this.url.startsWith("https://")))
                this.url = new URL(this.url, location.toString()).toString();
        }

        public url: string;
        public allowedExtensions: string[] = Data.File.deckFileFormats.mapMany(x => x.extensions);

        private repository: Folder;
        private progressDialog: UI.Elements.ProgressDialog;

        public async run(): Promise<Folder>
        {
            this.repository = { parent: null, name: "", url: this.url, folders: [], files: [] };
            this.progressDialog = await UI.Dialog.progress({ title: "Loading Repository", displayType: "Absolute", max: 0, value: 0 });

            try
            {
                const response = await fetch(this.url + "/repository.json");
                if (response.ok)
                {
                    const text = await this.loadFileWithProgress(response);
                    await this.loadFromJSON(text);
                }
                else
                {
                    const response = await fetch(this.url + "/listing.txt");
                    let list: string[];
                    if (response.ok)
                    {
                        const text = await this.loadFileWithProgress(response);
                        list = text.replaceAll(/(?:\r\n|\r|\n)/, "\n").split("\n").filter(p => p && p.trimChar("/").includes("/"));
                    }
                    else
                        list = await this.getFileList();

                    await this.loadFromFileList(list);
                }
            }
            catch (error)
            {
                console.error(error);
            }

            this.progressDialog.close();
            return this.repository;
        }

        private async loadFileWithProgress(response: Response): Promise<string>
        {
            this.progressDialog.title = "Downloading Repository File";
            this.progressDialog.value = 0;
            this.progressDialog.max = parseInt(response.headers.get("content-length"), 10) || 0;
            let received = 0;

            const reader = response.body.getReader();
            const chunks: Uint8Array<ArrayBufferLike>[] = [];
            while (true)
            {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;
                this.progressDialog.value = received;
            }

            // combine chunks
            let chunksAll = new Uint8Array(received);
            let position = 0;
            for (let chunk of chunks)
            {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }

            await delay(0); //allow ui update

            let text = new TextDecoder("utf-8").decode(chunksAll);
            return text;
        }

        private async loadFromJSON(text: string)
        {
            this.progressDialog.title = "Parsing Repository File";
            this.progressDialog.value = 0;
            this.progressDialog.max = 0;

            const start = Date.now();
            const folders: Folder[] = JSON.parse(text);
            const end = Date.now();
            const elapsed = end - start;
            console.log("parsed: ", elapsed / 1000);

            for (const folder of folders)
                this.setParents(folder);
            const end2 = Date.now();
            const elapsed2 = end2 - end;
            console.log("setParents: ", elapsed2 / 1000);

            this.repository.folders.push(...folders);
        }

        private setParents(folder: Folder)
        {
            folder.files ??= [];
            for (const file of folder.files)
                file.parent = folder;

            folder.folders ??= [];
            for (const subFolder of folder.folders)
            {
                subFolder.parent = folder;
                this.setParents(subFolder);
            }
        }

        private async getFileList(): Promise<string[]>
        {
            let list: string[] = [];
            const directoryListing = new DirectoryListing(this.url);
            for await (const file of directoryListing.scan())
            {
                if (file.endsWith("/")) continue; // is folder

                list.push(file);
                this.progressDialog.max = list.length;
            }
            return list;
        }

        private async loadFromFileList(list: string[])
        {
            this.progressDialog.title = "Building Repository";
            this.progressDialog.max = list.length;

            list = list.map(p => new URL(p, this.url).toString());
            let i = 0;
            const updateInterval = calculateUpdateInterval(list.length);
            for (const file of list)
            {
                this.insertFile(file);
                ++i;
                if (i % updateInterval == 0)
                {
                    this.progressDialog.value = i;
                    await delay(0); // allow ui upates
                }
            }
            this.progressDialog.value = i;
        }

        private insertFile(url: string)
        {
            const filePath = decodeURI(url.substring(this.url.length).trimChar("/"));
            if (!filePath.includes("/")) return; // Files in root folder are ignored.

            let [path, fileName] = filePath.splitLast("/");
            const [name, extension] = fileName.splitLast(".");
            if (!extension || !this.allowedExtensions.includes(extension)) return;

            const file: File = { parent: null, name, extension, url, };

            const folder: Folder = this.getOrCreateFolder(this.repository, path, 1);
            folder.files.push(file);
            file.parent = folder;
        }

        private getOrCreateFolder(parent: Folder, path: string, depth: number): Folder
        {
            let current: string;
            let remaining: string;

            [current, remaining] = path.splitFirst("/");

            let folder: Folder = parent.folders.first(x => String.localeCompare(x.name, current) == 0);
            if (!folder)
            {
                folder = { name: current, folders: [], files: [], parent, url: parent.url + "/" + current };
                parent.folders.push(folder);
            }

            if (remaining)
                return this.getOrCreateFolder(folder, remaining, depth + 1);
            return folder;
        }
    }
}