import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, SuggestModal, setIcon, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	selectedGroupName: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	selectedGroupName: '-'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

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
				let plusButtonNode = Array.from(navButtonsContainer.childNodes).find(n => n.classList.contains("bookmark-plus-icon"))

				if (!plusButtonNode) {
					let groupSelectButton = navButtonsContainer?.createEl("div", { text: "", cls: "clickable-icon nav-action-button bookmark-plus-icon" })
					setIcon(groupSelectButton, "plus")

					this.registerDomEvent(groupSelectButton, 'click', async () => {
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



	async addNoteForGroup() {
		await this.loadSettings()
		let selectedGroupName = this.settings.selectedGroupName

		// @ts-ignore
		let noteFolder = this.app.vault.config.newFileFolderPath
		if (!noteFolder) noteFolder = ""
		let noteName = "New note"

		const checkIfExist: any = (num: number) => {
			let numString = ""
			if (num > 0) {numString = " " + num}
			let path = noteName + numString + ".md"
	
			if (noteFolder && noteFolder != "") {
				path = noteFolder + "/" + noteName + numString + ".md"
			}
	
			// @ts-ignore
			let checkPath = this.app.vault.getAbstractFileByPathInsensitive(path)

	
			if (checkPath) {
				return checkIfExist(num + 1)
			} else return path
		}

		let path = checkIfExist(0)





		await this.app.vault.create(path, "")

		let fileObj = {
			type: "file",
			path: path
		}

		// @ts-ignore
		let instance = this.app.internalPlugins.plugins.bookmarks.instance

		

		

		let groups = this.flattenGroups(instance.items)

		
		

		let group = groups.find((i: any) => i.parent + i.title == selectedGroupName)


		let bookmark

		if (group) {
			bookmark = group.items.find((i: any) => i.path == path)
		} else {
			bookmark = instance.items.find((i: any) => i.path == path)
		}
		

		


		

		if (!bookmark) {
			if (group) {
				await instance.addItem(fileObj, group)
			} else {
				await instance.addItem(fileObj)
			}

		}





	}


	flattenGroups(arr: any): any {
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
					newArr = newArr.concat(this.flattenGroups(items))
				  }
			  }
			}
			return newArr;
	}


	async selectBookmarksGroup() {


		// @ts-ignore
		let groups = this.app.internalPlugins.plugins.bookmarks.instance.items

		groups = this.flattenGroups(groups)
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









