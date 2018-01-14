import { app, BrowserWindow, electron, ipcMain  } from 'electron'

//const ipcMain = electron.ipcMain || electron.remote.ipcMain;
import promptUtil from './prompt'
import progressUtil from './progress'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
 let dev = process.env.NODE_ENV === 'development';
if (!dev) {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = dev
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  });

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  var promptResponse;
  ipcMain.on('prompt', function(eventRet, arg) {
    promptResponse = null;
    var promptWindow = new BrowserWindow({
        width: 400,
        height: 200 + (25 * arg.inputs.length) ,
        show: false,
        resizable: false,
        movable: false,
        alwaysOnTop: false,
        parent: mainWindow,
        modal: !dev,
        frame: false
    });

    promptWindow.once('ready-to-show', () => {
      promptWindow.show()
    });
    arg.val = arg.val || '';

    promptWindow.loadURL('data:text/html,' + promptUtil.getHTMLTemplate(arg));
    promptWindow.on('closed', function() {
      eventRet.returnValue = promptResponse
      promptWindow = null
    });
  });

  ipcMain.on('prompt-response', function(event, arg) {
    if (arg === ''){ arg = null }
    promptResponse = arg
  });
  let progressWindow = null;
  ipcMain.on('progress-show', function(event, arg){
    progressWindow = new BrowserWindow({
        width: 640,
        height: 430,
        show: false,
        resizable: dev,
        movable: false,
        alwaysOnTop: false,
        parent: mainWindow,
        modal: !dev,
        frame: false
    });
    progressWindow.once('ready-to-show', () => {
      progressWindow.show();
    });
    progressWindow.on('close', function () { progressWindow = null })
    progressWindow.loadURL('data:text/html,' + progressUtil.getHTMLTemplate());
  });

  ipcMain.on('progress-done-main', function(event, arg){
    if(progressWindow){
      progressWindow.webContents.send('progress-done');
    }
  });

  ipcMain.on('progress-update-main', function(event, arg){
    if(progressWindow){
      progressWindow.webContents.send('progress-update', arg);
    }
  });
}


app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
