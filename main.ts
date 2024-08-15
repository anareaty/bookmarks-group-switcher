import { App, Plugin, PluginSettingTab, SuggestModal, FuzzySuggestModal, TAbstractFile, TFile, setIcon, Setting } from 'obsidian';
import { FolderSuggest} from 'suggesters/suggestor';


// Remember to rename these classes and interfaces!

interface GroupToFolder {
	group: string;
	folder: string;
}

interface MyPluginSettings {
	selectedGroupName: string;
	linkGroupsToFolders: GroupToFolder[];
}



const DEFAULT_SETTINGS: MyPluginSettings = {
	selectedGroupName: '-',
	linkGroupsToFolders: []
}



class SelectFileSuggest extends FuzzySuggestModal<TFile> {

	plugin: MyPlugin;


  constructor(app: App, plugin: MyPlugin) {
    super(app);
	this.plugin = plugin;
  }

	getItems(): TFile[] {
		const abstractFiles = this.app.vault.getAllLoadedFiles();
		const files: TFile[] = [];

		abstractFiles.forEach((file: TAbstractFile) => {
			if (file instanceof TFile) {
				files.push(file);
			}
		});

		return files;
	}

	getItemText(file: TFile) {
		return file.path
	}

	renderSuggestion(match: any, el: HTMLElement) {
		let path = match.item.path.replace(".md", "")
		el.createEl("div", {text: path})
	}

	async onChooseItem(file: TFile, evt: MouseEvent) {
		await this.plugin.addSelectedFile(file)
		
		this.close();
	}

	
}






export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			let leaf = this.app.workspace.getLeavesOfType("bookmarks")[0]
			
			let navButtonsContainer = leaf.view.containerEl.firstChild?.firstChild

			if (navButtonsContainer) {
				// @ts-ignore
				let groupSelectButtonNode = Array.from(navButtonsContainer.childNodes).find(n => n.classList.contains("select-group-icon"))

				if (!groupSelectButtonNode) {
					let groupSelectButton = navButtonsContainer?.createEl("div", { text: "", cls: "clickable-icon nav-action-button select-group-icon" })
					setIcon(groupSelectButton, "list")

					this.registerDomEvent(groupSelectButton, 'click', async () => {
						await this.selectBookmarksGroup()
					});
				}



				// @ts-ignore
				let noteSelectButtonNode = Array.from(navButtonsContainer.childNodes).find(n => n.classList.contains("note-select-icon"))

				if (!noteSelectButtonNode) {
					let noteSelectButton = navButtonsContainer?.createEl("div", { text: "", cls: "clickable-icon nav-action-button note-select-icon" })
					setIcon(noteSelectButton, "scan-search")

					this.registerDomEvent(noteSelectButton, 'click', async () => {
						new SelectFileSuggest(this.app, this).open()
					});
				}





				// @ts-ignore
				let plusButtonNode = Array.from(navButtonsContainer.childNodes).find(n => n.classList.contains("bookmark-plus-icon"))

				if (!plusButtonNode) {
					let plusButton = navButtonsContainer?.createEl("div", { text: "", cls: "clickable-icon nav-action-button bookmark-plus-icon" })
					setIcon(plusButton, "plus")

					this.registerDomEvent(plusButton, 'click', async () => {
						await this.addNoteForGroup()
					});
				}
			}

			setTimeout(async() => {
				await this.changeGroup()
			}, 100);




			this.registerEvent(
				this.app.workspace.on("active-leaf-change", async () => {

					setTimeout(async() => {
						await this.changeGroup()
					}, 100);
					
				})
			);
			
		})
	}

	onunload() {}





	async addSelectedFile(file: TFile) {
		await this.loadSettings()
		let selectedGroupName = this.settings.selectedGroupName
		let group = this.getBookmarkGroupByName(selectedGroupName)
		await this.addFileToBoolmarkGroup(file, group)
	}



	async addNoteForGroup() {
		await this.loadSettings()
		let selectedGroupName = this.settings.selectedGroupName
		let linkGroupsToFolders = this.settings.linkGroupsToFolders
		let groupToFolder = linkGroupsToFolders.find(l => l.group == selectedGroupName)

		// @ts-ignore
		let noteFolder = this.app.vault.config.newFileFolderPath
		if (!noteFolder) noteFolder = ""

		if (groupToFolder) {
			noteFolder = groupToFolder.folder
		}

		let noteName = "New note"
		let path = this.checkIfExist(0, noteName, noteFolder)
		let file: TFile = await this.app.vault.create(path, "")
		await app.workspace.getLeaf().openFile(file)
		let group = this.getBookmarkGroupByName(selectedGroupName)
		await this.addFileToBoolmarkGroup(file, group)
	}


	


	getGroupList() {
		const flattenGroups = (arr: any): any => {
			var newArr = [];
				for (let item of arr) {
				  if (item.type == "group") {
					  newArr.push(item)
					  if (item.items) { 
						let items = item.items.map((i: any) => {
						  if (!item.parent) item.parent = ""
						  i.parent = item.parent + item.title + "/"
						  return i
						})
						newArr = newArr.concat(flattenGroups(items))
					  }
				  }
				}
			return newArr;
		}
		// @ts-ignore
		let groups = this.app.internalPlugins.plugins.bookmarks.instance.items

		groups = groups.map((g:any) => {
			g.parent = ""
			return g
		})

		groups = flattenGroups(groups)
		return groups
	}


	getBookmarkGroupByName(selectedGroupName: string) {
		let groups = this.getGroupList()
		let group = groups.find((i: any) => i.parent + i.title == selectedGroupName)
		return group
	}





	async addFileToBoolmarkGroup(file: TFile, group: any) {
		// @ts-ignore
		let instance = this.app.internalPlugins.plugins.bookmarks.instance

		let bookmark

		if (group) {
			bookmark = group.items.find((i: any) => i.path == file.path)
		} else {
			bookmark = instance.items.find((i: any) => i.path == file.path)
		}
		
		if (!bookmark) {
			
			let fileObj = {
				type: "file",
				path: file.path
			}

			if (group) {
				await instance.addItem(fileObj, group)
			} else {
				await instance.addItem(fileObj)
			}
		}
	}






	checkIfExist(num: number, noteName: string, noteFolder: string): any {
		let numString = ""
		if (num > 0) {numString = " " + num}
		let path = noteName + numString + ".md"

		if (noteFolder && noteFolder != "") {
			path = noteFolder + "/" + noteName + numString + ".md"
		}

		// @ts-ignore
		let checkPath = this.app.vault.getAbstractFileByPathInsensitive(path)


		if (checkPath) {
			return this.checkIfExist(num + 1, noteName, noteFolder)
		} else return path
	}





	async selectBookmarksGroup() {


		let groups = this.getGroupList()


		groups = groups.map((g:any) => {
			const getPath = (g:any) => {
				let title = g.parent + g.title
				return title
			}
			return getPath(g)
		})
		
		groups.unshift("-")
	
		let groupNames = groups.map((group: any) => {
			group = group.replaceAll(/(.*?\/)/g, "    ")
			return group
		})

		class ExampleModal extends SuggestModal<string> {
			getSuggestions(query: string): string[] {
			  return groups
			}
		  
			renderSuggestion(item: string, el: HTMLElement) {
			  let itemName = groupNames[groups.indexOf(item)]
			  el.createEl("div", { text: itemName });
			}
		  
			async onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
			  await saveGroupName(item)
			  await changeGroup()
			}
		  }

		  new ExampleModal(this.app).open()

		  const saveGroupName = async (selectedGroupName: string) => {
			this.settings.selectedGroupName = selectedGroupName
			await this.saveSettings();
		  }

		  const changeGroup = async () => {
			await this.changeGroup()
		  }
	}




	







	async changeGroup() {

		await this.loadSettings()
		let selectedGroupName = this.settings.selectedGroupName
		let outerGroups = selectedGroupName.split("/")
		outerGroups.pop()
		let outerGroupsPaths = []
		let path = selectedGroupName
		for (let group of outerGroups) {
		  path = path.replace(/(.*)(\/[^/]+)/, "$1")
		  outerGroupsPaths.push(path)
		}
		outerGroupsPaths.reverse()

		for (let path of outerGroupsPaths) {
			let selector = document.querySelector("[data-path='" + path + "']")
			if (selector && selector.classList.contains("is-collapsed")) {
				let selectorInner = selector.querySelector(".tree-item-self")

				// @ts-ignore
				selectorInner.click()
			}
		}


		let groupSelectors = document.querySelectorAll(".workspace-leaf-content[data-type='bookmarks'] > div > div .tree-item") 


		groupSelectors.forEach(groupSelector => {
		  let groupName: string = groupSelector.getAttribute("data-path") ?? ""
	
		  if (!selectedGroupName.startsWith(groupName) && !groupName.startsWith(selectedGroupName)) {
			groupSelector.classList.add("hide-bookmarks-group")
		  } else {
			groupSelector.classList.remove("hide-bookmarks-group")
		  }
	
		  if (groupName == selectedGroupName) {
	
			groupSelector.classList.add("selected-bookmarks-group")
			groupSelector.classList.remove("hide-bookmarks-group")
			groupSelector.classList.remove("bookmarks-group-outer")
			groupSelector.classList.remove("bookmarks-group-inner")
	
		  } else if (selectedGroupName.startsWith(groupName)) {
	
			groupSelector.classList.add("bookmarks-group-outer")
			groupSelector.classList.remove("hide-bookmarks-group")
			groupSelector.classList.remove("selected-bookmarks-group")
			groupSelector.classList.remove("bookmarks-group-inner")
			
		  } else if (groupName.startsWith(selectedGroupName)) {
	
			groupSelector.classList.add("bookmarks-group-inner")
			groupSelector.classList.remove("hide-bookmarks-group")
			groupSelector.classList.remove("bookmarks-group-outer")
			groupSelector.classList.remove("selected-bookmarks-group")
	
		  } else if (selectedGroupName == "-") {
	
			groupSelector.classList.remove("hide-bookmarks-group")
			groupSelector.classList.remove("bookmarks-group-outer")
			groupSelector.classList.remove("bookmarks-group-inner")
			groupSelector.classList.remove("selected-bookmarks-group")
	
		  } else {
	
			groupSelector.classList.add("hide-bookmarks-group")
			groupSelector.classList.remove("bookmarks-group-outer")
			groupSelector.classList.remove("bookmarks-group-inner")
			groupSelector.classList.remove("selected-bookmarks-group")
	
		  }	
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}












class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
		.setName("Link folders to groups")
		.setDesc("New notes for groups will be added to the folders")

		let groups = this.plugin.getGroupList()

		for (let group of groups) {
			let groupPath = group.parent + group.title
			let linkGroupsToFolders = this.plugin.settings.linkGroupsToFolders
			let groupToFolder = linkGroupsToFolders.find(l => l.group == groupPath)

			if (!groupToFolder) {
				groupToFolder = {group: groupPath, folder: ""}
				linkGroupsToFolders.push(groupToFolder)
			}

			new Setting(containerEl)
			.setName(groupPath)
			.addSearch(search => {
				new FolderSuggest(search.inputEl, this.app);
				search				
				.setPlaceholder('')
				.setValue(groupToFolder!.folder)
				.onChange(async (folderPath) => {
					groupToFolder!.folder = folderPath
					this.plugin.settings.linkGroupsToFolders = linkGroupsToFolders
					await this.plugin.saveSettings();

				})
			});


		}
		


		
			


	}
}

