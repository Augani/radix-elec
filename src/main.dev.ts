import "core-js/stable";
import "regenerator-runtime/runtime";
import path from "path";
const CryptoJS = require("crypto-js");
import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { autoUpdater } from "electron-updater";
const Store = require("./saveData");
import log from "electron-log";
import MenuBuilder from "./menu";
const Keytar  = require("keytar");

interface IContact {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

async function getPassword(): Promise<string> {
  let password = await Keytar.getPassword("Contact", "UserPass");
  if (!password) password = "";
  return password;
}

async function encryptContacts(key: string, contacts: string) {
  let ciphertext = CryptoJS.AES.encrypt(contacts, key).toString();
  let store = new Store(ciphertext);
  store.save();
}

async function decryptContacts(): Promise<IContact[]> {
  const password = await getPassword();
  const contacts = new Store().getContacts();
  const bytes = CryptoJS.AES.decrypt(contacts, password);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
  if (!decryptedData) return [];
  return JSON.parse(decryptedData);
}

ipcMain.on("getContactList", async (event, args) => {
  const contacts = await decryptContacts();
  event.returnValue = contacts;
});

ipcMain.on("saveContacts", async (event, args) => {
  const password = await getPassword();
  encryptContacts(password, JSON.stringify(args));
  event.returnValue = true;
});

ipcMain.on("requestDelete", async (event, args) => {
  const options = {
    type: "info",
    title: "Confirm data deletion",
    message:
      "Are you sure you want to erase all your data? You will lose all your contacts.",
    buttons: ["Yes", "No"],
  };
  dialog.showMessageBox(options).then((index) => {
    event.returnValue = index.response;
  });
});

ipcMain.on("deleteUserData", (event, args) => {
  Keytar.deletePassword("Contact", "UserPass");
  new Store().clearData();
  const options = {
    type: "info",
    title: "Success",
    message: "Data has been deleted successfully",
    buttons: ["Ok"],
  };
  dialog.showMessageBox(options);
});

ipcMain.on("createPassword", (event, args) => {
  Keytar.setPassword("Contact", "UserPass", args);
  event.sender.send("passwordCreated", true);
});

ipcMain.on("wrongPassword", (event, args) => {
  dialog.showErrorBox(
    "Wrong password",
    "Please check your password and type again"
  );
});

ipcMain.on("retrievePassword", async (event, args) => {
  let value: string | null = "";
  try {
    value = await getPassword();
  } catch (e) {
  }
  event.returnValue = value;
});

export default class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS"];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(__dirname, "../assets");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    maxHeight: 728,
    maxWidth: 1024,
    minHeight: 728,
    minWidth: 1024,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
