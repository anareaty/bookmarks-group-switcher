import { App, Plugin, PluginSettingTab, SuggestModal, FuzzySuggestModal, TAbstractFile, TFile, setIcon, Setting, TFolder, Menu } from 'obsidian';
import { FolderSuggest} from 'suggesters/suggestor';


// Remember to rename these classes and interfaces!

interface GroupToFolder {
	group: string;
	folder: string;
}

interface WorkspaceObject {
	workspace: string;
	activeGroup: string;
	activeFolder: string;
}

interface MyPluginSettings {
	linkGroupsToFolders: GroupToFolder[];
	activeWorkspace: string;
	workspaceSettings: WorkspaceObject[];
<<<<<<< HEAD
=======
	favoriteFolders: string[];
>>>>>>> 1480109 (Added favorite folders)
}



const DEFAULT_SETTINGS: MyPluginSettings = {
	linkGroupsToFolders: [],
	activeWorkspace: "",
<<<<<<< HEAD
	workspaceSettings: []
=======
	workspaceSettings: [],
	favoriteFolders: []
>>>>>>> 1480109 (Added favorite folders)
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



class SelectGroupSuggest extends SuggestModal<string> {
	plugin: MyPlugin;
	groups: string[];
	groupNames: string[];

	constructor(app: App, plugin: MyPlugin, groups: string[], groupNames: string[]) {
	super(app);
	this.plugin = plugin;
	this.groups = groups;
	this.groupNames = groupNames
	}

<<<<<<< HEAD
	getSuggestions(): string[] {
	  return this.groups
=======
	getSuggestions(query: string): string[] {
	  return this.groups.filter((g) => {
		return g.toLowerCase().includes(query.toLowerCase())
	});
>>>>>>> 1480109 (Added favorite folders)
	}
  
	renderSuggestion(item: string, el: HTMLElement) {
	  let itemName = this.groupNames[this.groups.indexOf(item)]
	  el.createEl("div", { text: itemName });
	}
  
	async onChooseSuggestion(item: string) {
	  await this.plugin.saveActiveGroup(item)
	  await this.plugin.focusGroup(item)
	}
  }








<<<<<<< HEAD
=======
  class SelectFolderSuggest extends SuggestModal<string> {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
	super(app);
	this.plugin = plugin;
	}

	getSuggestions(query: string): string[] {
		let favoriteFolders = this.plugin.settings.favoriteFolders
		let allFolders = this.app.vault.getAllFolders()
		favoriteFolders = favoriteFolders.filter(fav => {
			return allFolders.find(fol => fol.path == fav)
		})
		this.plugin.settings.favoriteFolders = favoriteFolders
		this.plugin.saveSettings()


		let folders = favoriteFolders.filter((f) => {
			return f.toLowerCase().includes(query.toLowerCase())
		});
		folders.unshift("")
		return folders;
	}
  
	renderSuggestion(path: string, el: HTMLElement) {
		let name = path.replace(/(.*\/)([^/]+)/, "$2")
		if (name == "") name = "-"
		let wrapper = el.createEl("div", { text: "", cls: "favorite-folder-select" });
		wrapper.createEl("div", { text: name, cls: "select-name" });
		wrapper.createEl("div", { text: path, cls: "select-path" });
	}
  
	async onChooseSuggestion(item: string) {
		await this.plugin.saveActiveFolder(item);
		if (item == "") {
		  await this.plugin.unfocusFolder()
		  let collapseButton = document.querySelector("[data-type='file-explorer'] .nav-buttons-container > div:has(.lucide-chevrons-down-up)")
		  if (collapseButton) {
			//@ts-ignore
			collapseButton.click()
		  }
		} else {
		  await this.plugin.focusFolder(item);
		}
	}
  }








>>>>>>> 1480109 (Added favorite folders)







export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		//@ts-ignore
		this.settings.activeWorkspace = this.app.internalPlugins.plugins.workspaces.instance.activeWorkspace
		this.saveSettings()


		this.app.workspace.onLayoutReady(async () => {
<<<<<<< HEAD
			await this.loadSavedFocusStates()
			await this.addBookmarksButtons()
=======
			setTimeout(async() => {
				await this.loadSavedFocusStates();
			  }, 100)

			await this.addBookmarksButtons()
			await this.addFavoriteFoldersButton();
>>>>>>> 1480109 (Added favorite folders)
		})


		this.registerEvent(this.app.workspace.on("file-menu", (menu: Menu, folder: TAbstractFile) => {
            
			// Check if folder
            if (folder instanceof TFolder) {
				let folderPath = folder.path
				let activeFolder = this.getActiveFolder()

				if (folderPath == activeFolder) {
					menu.addItem((item: any) => {
						item
						.setTitle("Unfocus folder")
						.setIcon("cross")
						.onClick(async () => {
							await this.unfocusFolder()
							await this.saveActiveFolder("")
						})
					}) 
				} else {
					menu.addItem((item: any) => {
						item
						.setTitle("Focus folder")
						.setIcon("focus")
						.onClick(async () => {
							await this.focusFolder(folderPath)
							await this.saveActiveFolder(folderPath)
						})
					})  
<<<<<<< HEAD
				}          
=======
				}
				
				


				if (this.settings.favoriteFolders.find(f => f == folderPath)) {
					menu.addItem((item) => {
					  item.setTitle("Remove from favorite").setIcon("heart-off").onClick(async () => {
						await this.removeFolderFromFavorite(folderPath);
					  });
					});
		  
				  } else {
					menu.addItem((item) => {
					  item.setTitle("Add to favorite").setIcon("heart").onClick(async () => {
						await this.addFolderToFavorite(folderPath);
					  });
					});
		  
				  }

>>>>>>> 1480109 (Added favorite folders)
            }
        }))


		
		// Focus saved folders on workspace change

		this.registerEvent(this.app.workspace.on("layout-change", async () => {
			//@ts-ignore
			let activeWorkspace = this.app.internalPlugins.plugins.workspaces.instance.activeWorkspace
			let savedWorkspace = this.settings.activeWorkspace

			if (activeWorkspace != savedWorkspace) {
				this.settings.activeWorkspace = activeWorkspace
				this.saveSettings()
				await this.loadSavedFocusStates()
				await this.addBookmarksButtons()
<<<<<<< HEAD
=======
				await this.addFavoriteFoldersButton();
>>>>>>> 1480109 (Added favorite folders)
			}
		}));

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", async () => {
				await this.loadSavedFocusStates()
			})
		);

		this.addSettingTab(new SampleSettingTab(this.app, this));



		






		


/*

		this.registerEvent(
			
			document.oncontextmenu = (e) => {
			
				
				if (e.target!.classList.contains("bookmark")) {
					console.log("bookmark")

					setTimeout(() => {
						
						console.log(e.target!.innerText)
						
					
					let menu = document.querySelector(".menu")
					
					let prevElement = menu!.querySelector(":nth-child(7)")

					let focusLine = document.createElement("div")
					focusLine.className = "menu-item tappable"
					focusLine.setAttribute("data-section", "action")
					focusLine.addEventListener("mouseenter", (e) => {
						focusLine.classList.add("selected")
					})
					focusLine.addEventListener("mouseleave", (e) => {
						focusLine.classList.remove("selected")
					})
					let focusIcon = document.createElement("div")
					focusIcon.className = "menu-item-icon"
					setIcon(focusIcon, "focus")
					let focusCommand = document.createElement("div")
					focusCommand.innerHTML = "Focus group"
					focusLine.append(focusIcon)
					focusLine.append(focusCommand)
					prevElement!.after(focusLine)

				}, 5);
					
				}
			}
			
		);

*/
		
	
	}

	onunload() {}


	async addBookmarksButtons() {
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
	}


<<<<<<< HEAD
=======

	async addFavoriteFoldersButton() {
		let leaf = this.app.workspace.getLeavesOfType("file-explorer")[0];
		let navButtonsContainer = leaf.view.containerEl.firstChild?.firstChild
		if (navButtonsContainer) {
			// @ts-ignore
			let favoriteFoldersButtonNode = Array.from(navButtonsContainer.childNodes).find((n) => n.classList.contains("favorite-folders-icon"));
			if (!favoriteFoldersButtonNode) {

			let favoriteFoldersButton = navButtonsContainer?.createEl("div", { text: "", cls: "clickable-icon nav-action-button favorite-folders-icon" })
			setIcon(favoriteFoldersButton, "folder-heart")
			this.registerDomEvent(favoriteFoldersButton, "click", async () => {
				new SelectFolderSuggest(this.app, this).open();
			});
			}
		}
	}


	async addFolderToFavorite(folderPath: string) {
		let favoriteFolders = this.settings.favoriteFolders
		if (!favoriteFolders.find(f => f == folderPath)) {
		  favoriteFolders.push(folderPath)
		  favoriteFolders.sort()
		}
		this.saveSettings()
	}
	
	
	async removeFolderFromFavorite(folderPath: string) {
		let favoriteFolders = this.settings.favoriteFolders
		this.settings.favoriteFolders = favoriteFolders.filter(f => f != folderPath)
		this.saveSettings()
	}


>>>>>>> 1480109 (Added favorite folders)
	async loadSavedFocusStates() {
		let activeGroup = this.getActiveGroup()
		let activeFolder = this.getActiveFolder()

		setTimeout(async() => {
			await this.focusFolder(activeFolder)
			await this.focusGroup(activeGroup)
		}, 100);
	}

	getActiveGroup() {
		//@ts-ignore
		let activeWorkspace = this.app.internalPlugins.plugins.workspaces.instance.activeWorkspace
		let activeWorkspaceSetting = this.settings.workspaceSettings.find(w => w.workspace == activeWorkspace)
		return activeWorkspaceSetting?.activeGroup ?? ""
	}

	getActiveFolder() {
		//@ts-ignore
		let activeWorkspace = this.app.internalPlugins.plugins.workspaces.instance.activeWorkspace
		let activeWorkspaceSetting = this.settings.workspaceSettings.find(w => w.workspace == activeWorkspace)
		return activeWorkspaceSetting?.activeFolder ?? ""
	}


    async saveActiveFolder(activeFolder: string) {
		let workspaceSettings = this.settings.workspaceSettings
		let activeWorkspace = this.settings.activeWorkspace
		let activeWorkspaceSetting = workspaceSettings.find(w => w.workspace == activeWorkspace)
		if (activeWorkspaceSetting) {
			activeWorkspaceSetting.activeFolder = activeFolder
		} else {
			activeWorkspaceSetting = {
				workspace: activeWorkspace,
				activeFolder: activeFolder,
				activeGroup: ""
			}
			workspaceSettings.push(activeWorkspaceSetting)
		}

		this.saveSettings()
	}


	async saveActiveGroup(activeGroup: string) {
		let workspaceSettings = this.settings.workspaceSettings
		let activeWorkspace = this.settings.activeWorkspace
		let activeWorkspaceSetting = workspaceSettings.find(w => w.workspace == activeWorkspace)
		if (activeWorkspaceSetting) {
			activeWorkspaceSetting.activeGroup = activeGroup
		} else {
			activeWorkspaceSetting = {
				workspace: activeWorkspace,
				activeFolder: "",
				activeGroup: activeGroup
			}
			workspaceSettings.push(activeWorkspaceSetting)
		}

		this.saveSettings()
	}





	async addSelectedFile(file: TFile) {
		await this.loadSettings()
		let selectedGroupName = this.getActiveGroup()
		let group = this.getBookmarkGroupByName(selectedGroupName)
		await this.addFileToBoolmarkGroup(file, group)
	}






	async focusFolder(selectedPath: string) {

<<<<<<< HEAD
=======


		/*Expand closed outer folders*/

		let outerFolders = selectedPath.split("/");
		outerFolders.pop();
		let outerFoldersPaths = [];
		let path = selectedPath;
		for (let group of outerFolders) {
		  path = path.replace(/(.*)(\/[^/]+)/, "$1");
		  outerFoldersPaths.push(path);
		}
		outerFoldersPaths.reverse().push(selectedPath);
	
		for (let path of outerFoldersPaths) {
		  let selector = document.querySelector("[data-path='" + path + "']:has(> .tree-item-icon.is-collapsed)");
		  if (selector) {
			//@ts-ignore
			selector.click();
		  }
		}





>>>>>>> 1480109 (Added favorite folders)
		let folderSelectors = document.querySelectorAll(".workspace-leaf-content[data-type='file-explorer'] > div > div .tree-item")
    

    for (let folderSelector of folderSelectors) {

        let folderSelf = folderSelector.querySelector(".tree-item-self")

        let folderPath:string = folderSelf!.getAttribute("data-path") ?? ""

        if (!selectedPath.startsWith(folderPath) && !folderPath.startsWith(selectedPath)) {
        folderSelector.classList.add("hide-bookmarks-group")
      } else {
        folderSelector.classList.remove("hide-bookmarks-group")
      }


	  

        

      if (!selectedPath.startsWith(folderPath) && !folderPath.startsWith(selectedPath)) {
        folderSelector.classList.add("hide-bookmarks-group")
      } else {
        folderSelector.classList.remove("hide-bookmarks-group")
      }


      if (folderPath == selectedPath) {

        folderSelector.classList.add("selected-bookmarks-group")
        folderSelector.classList.remove("hide-bookmarks-group")
        folderSelector.classList.remove("bookmarks-group-outer")
        folderSelector.classList.remove("bookmarks-group-inner")

      } else if (selectedPath.startsWith(folderPath)) {

        folderSelector.classList.add("bookmarks-group-outer")
        folderSelector.classList.remove("hide-bookmarks-group")
        folderSelector.classList.remove("selected-bookmarks-group")
        folderSelector.classList.remove("bookmarks-group-inner")
        
      } else if (folderPath.startsWith(selectedPath)) {

        folderSelector.classList.add("bookmarks-group-inner")
        folderSelector.classList.remove("hide-bookmarks-group")
        folderSelector.classList.remove("bookmarks-group-outer")
        folderSelector.classList.remove("selected-bookmarks-group")

      } else if (selectedPath == "-") {

        folderSelector.classList.remove("hide-bookmarks-group")
        folderSelector.classList.remove("bookmarks-group-outer")
        folderSelector.classList.remove("bookmarks-group-inner")
        folderSelector.classList.remove("selected-bookmarks-group")

      } else {

        folderSelector.classList.add("hide-bookmarks-group")
        folderSelector.classList.remove("bookmarks-group-outer")
        folderSelector.classList.remove("bookmarks-group-inner")
        folderSelector.classList.remove("selected-bookmarks-group")

      }

      
    }

	}


	async focusGroup(selectedGroupName: string) {
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








	async unfocusFolder() {

		let folderSelectors = document.querySelectorAll(".workspace-leaf-content[data-type='file-explorer'] > div > div .tree-item")

    for (let folderSelector of folderSelectors) {
        folderSelector.classList.remove("hide-bookmarks-group")
        folderSelector.classList.remove("bookmarks-group-outer")
        folderSelector.classList.remove("bookmarks-group-inner")
        folderSelector.classList.remove("selected-bookmarks-group")

    }


	}



	async addNoteForGroup() {
		await this.loadSettings()
		let selectedGroupName = this.getActiveGroup()
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
		await this.app.workspace.getLeaf().openFile(file)
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

		new SelectGroupSuggest(this.app, this, groups, groupNames).open()
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

