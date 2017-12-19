const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var win;

app.on('ready', () => {
  win = new BrowserWindow( { width: 800, height: 600, title: "Makemake", backgroundColor: '#000000', icon: "particle/makemake.png"} );

  win.loadURL(`file://${__dirname}/particle/particle.html`);
  //win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
