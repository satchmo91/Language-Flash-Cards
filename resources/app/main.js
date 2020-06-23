const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, Menu, ipcMain } = require("electron");

let user;

//set env
process.env.NODE_ENV = "production";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS;

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darin" ? true : false;

let mainWindow;
let aboutWindow;
let newUserWindow;
let selectUserWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Language Flash Cards",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "app/assets/img/icon.png"),
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
  mainWindow.setMenu(mainMenu);

  mainWindow.loadFile(path.join(__dirname, "app", "index.html"));

  mainWindow.on("closed", (event) => {
    win = null;
  });

  mainWindow.maximize();
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About",
    width: 450,
    height: 425,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "app/assets/img/icon.png"),
  });

  aboutWindow.setMenu(null);

  aboutWindow.loadFile(path.join(__dirname, "app", "about.html"));

  aboutWindow.on("closed", (event) => {
    win = null;
  });
}

function createNewUserWindow() {
  //Makes sure there is only one of these windows open at a time to avoid potential problems
  if (newUserWindow && !newUserWindow.isDestroyed()) {
    newUserWindow.close();
  }

  newUserWindow = new BrowserWindow({
    title: "About",
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    resizable: false,
    icon: path.join(__dirname, "app/assets/img/icon.png"),
  });

  const newUserMenu = Menu.buildFromTemplate(createNewUserMenuTemplate);
  newUserWindow.setMenu(newUserMenu);

  newUserWindow.loadFile(path.join(__dirname, "app", "newUser.html"));

  newUserWindow.on("closed", (event) => {
    win = null;
  });

  //Again, declutter things by deleting extra windows
  if (selectUserWindow && !selectUserWindow.isDestroyed()) {
    selectUserWindow.close();
  }
}

function createSelectUserWindow() {
  //Makes sure there is only one of these windows open at a time to avoid potential problems
  if (selectUserWindow && !selectUserWindow.isDestroyed()) {
    selectUserWindow.close();
  }

  selectUserWindow = new BrowserWindow({
    title: "About",
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, "app/assets/img/icon.png"),
  });

  const selectUserMenu = Menu.buildFromTemplate(selectUserMenuTemplate);
  selectUserWindow.setMenu(selectUserMenu);

  selectUserWindow.on("closed", (event) => {
    win = null;
  });

  selectUserWindow.loadFile(path.join(__dirname, "app", "selectUser.html"));

  //Again, declutter things by deleting extra windows
  if (newUserWindow && !newUserWindow.isDestroyed()) {
    newUserWindow.close();
  }
}

function createUserInfoWindow() {
  userInfoWindow = new BrowserWindow({
    title: "User Info",
    width: 550,
    height: 350,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    resizable: true,
    icon: path.join(__dirname, "app/assets/img/icon.png"),
  });

  userInfoWindow.setMenu(null);

  userInfoWindow.on("closed", (event) => {
    win = null;
  });

  userInfoWindow.loadFile(path.join(__dirname, "app", "userInfo.html"));
}

app.on("ready", () => {
  //Find all files in userData
  fs.readdir(path.join(__dirname, "app", "userData"), (error, files) => {
    let totalFiles = files.length; // return the number of files

    //if no files, create a user
    if (totalFiles === 0) {
      createNewUserWindow();
      // if only 1 file, open it
    } else if (totalFiles === 1) {
      let filename = fs.readdirSync(path.join(__dirname, `app/userData`))[0];
      filename = filename.slice(0, filename.length - 4);

      let userData = fs.readFileSync(
        path.join(__dirname, `app/userData/${filename}.txt`)
      );
      user = JSON.parse(userData);

      createMainWindow();
      mainWindow.on("closed", () => (mainwindow = null));
      //There must be multiple users, select one
    } else {
      createSelectUserWindow();
    }
  });
});

//Main menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
    submenu: [
      {
        label: "New User",
        click: createNewUserWindow,
      },
      {
        label: "Switch User",
        click: createSelectUserWindow,
      },
      {
        label: "User Info",
        click: createUserInfoWindow,
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            {
              role: "reload",
            },
            {
              role: "forcereload",
            },
            {
              type: "separator",
            },
            {
              role: "toggledevtools",
            },
          ],
        },
      ]
    : []),
];

const selectUserMenuTemplate = [
  {
    role: "fileMenu",
    submenu: [
      {
        label: "New User",
        click: createNewUserWindow,
      },
    ],
  },
];

const createNewUserMenuTemplate = [
  {
    role: "fileMenu",
    submenu: [
      {
        label: "Switch User",
        click: createSelectUserWindow,
      },
    ],
  },
];

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

//Event Handlers (might need to clean some redundancies, but it works now)
ipcMain.on("toNewPage", (e, { destination, language }) => {
  mainWindow.loadFile(path.join(__dirname, `app/${destination}.html`));
  user.currentLanguage = language;
});

ipcMain.on("getLanguage", () => {
  mainWindow.webContents.send("recieveLanguage", user);
});

ipcMain.on("getUser", () => {
  mainWindow.webContents.send("recieveUser", user);
});

ipcMain.on("getUserInfo", () => {
  userInfoWindow.webContents.send("recieveUser", user);
});

ipcMain.on("checkUserWords", () => {
  mainWindow.webContents.send("recieveUserWords", user);
});

ipcMain.on("updateUser", (e, username) => {
  user = username;
});

ipcMain.on("userSelect", (e, userName) => {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }
  createMainWindow();
  selectUserWindow.close();
  selectUserWindow = null;
  user = userName;
});

ipcMain.on("newUser", (e, thisUser) => {
  user = thisUser;
  if (!mainWindow) {
    createMainWindow();
  } else {
    mainWindow.close();
    mainWindow = null;
    createMainWindow();
  }
  newUserWindow.close();
  newUserWindow = null;
});

ipcMain.handle("editWord", async (e, wordToEdit) => {
  let foreign = user.words[wordToEdit].foreign;
  let native = user.words[wordToEdit].native;

  //Remove Selected word from array
  user.words.splice(wordToEdit, 1);

  //Reset working tags so we don't delete last word from a class of tags
  user.workingTags = [];

  //Write file without word
  fs.writeFileSync(
    path.join(__dirname, `app/userData/${user.name}.txt`),
    JSON.stringify(user),
    (err) => {
      console.log(err);
    }
  );

  await mainWindow.loadFile(
    path.join(__dirname, "app", "addNewWordsPage.html")
  );
  await mainWindow.webContents.send("editWord", { foreign, native });

  return;
});
