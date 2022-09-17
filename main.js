// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Require Engine Services
const indexStats = require("./engine/analysers/index.analyser");
const queryAnalysis = require("./engine/analysers/query.analyser");
const writeLoadAnalysis = require("./engine/analysers/write_load.analyser");
const connectionAnalysis = require("./engine/analysers/connections.analysis");
const shardAnalysis = require("./engine/analysers/shard.analysis");


function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../build/index.html')}`
  )

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Register Index Stats IPC 
  ipcMain.handle('engine:indexStats', indexStats.get_index_stats);
  ipcMain.handle('engine:queryAnalysis', queryAnalysis.analyse_queries);
  ipcMain.handle('engine:writeLoadAnalysis', writeLoadAnalysis.get_write_load_analysis);
  ipcMain.handle('engine:connectionRealTimeAnalysis', connectionAnalysis.get_current_conn_analysis);
  ipcMain.handle('engine:shardAnalysis', shardAnalysis.get_shard_analysis);

  createWindow();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
