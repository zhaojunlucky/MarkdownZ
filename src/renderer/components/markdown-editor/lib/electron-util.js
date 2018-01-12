const electron = require('electron');
const shell = electron.shell;
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote;

export default class ElectronUtil{
    static hackLinks(){
        const links = document.querySelectorAll('a[href]');

        Array.prototype.forEach.call(links, function (link) {
          const url = link.getAttribute('href')
          if (url.indexOf('http') === 0) {
            link.addEventListener('click', function (e) {
              e.preventDefault()
              shell.openExternal(url)
            })
          }
        });
    }

    static confirm(title, message){
        var dialog = remote.dialog;
        var choice = dialog.showMessageBox(
                remote.getCurrentWindow(),
                {
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: title,
                    message: message
                });
        return choice == 0;
      }

    static errorAlert(title, message){
        var dialog = remote.dialog;
        dialog.showMessageBox(
                remote.getCurrentWindow(),
                {
                    type: 'error',
                    buttons: ['OK'],
                    title: title,
                    message: message
                });
    }

    static inputPrompt(metadata){
        let ret = ipcRenderer.sendSync('prompt', metadata);
        return ret == null? null : JSON.parse(ret);
    }

    static showProgressDialog(){
        ipcRenderer.sendSync('progress-show');
    }

    static updateProgress(message){
        ipcRenderer.send('progress-update-main', message);
    }

    static finishProgress(){
        ipcRenderer.send('progress-done-main');
    }
}