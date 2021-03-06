import { BrowserWindow } from 'electron';
import path from 'path';

/**
 * Create a browser window specifically for overlays
 */
export default class BrowserOverlayWindow {
  private browserWindow?: BrowserWindow;

  private screenSize: { width: number; height: number };

  constructor({
    screenSize,
  }: {
    screenSize: { width: number; height: number };
  }) {
    this.screenSize = screenSize;
  }

  public openWindow() {
    this.createWindow();
  }

  public getBrowserWindow() {
    return this.browserWindow;
  }

  public loadURL(url: string) {
    return this.browserWindow?.loadURL(url, {});
  }

  public send(eventName: string, data: Record<string, unknown>) {
    this.browserWindow?.webContents.send(eventName, data);
  }

  public hide() {
    this.browserWindow?.hide();
  }
  public show() {
    this.browserWindow?.show();
  }
  private createWindow() {
    this.browserWindow = new BrowserWindow({
      width: this.screenSize.width,
      height: this.screenSize.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      show: false,
      movable: false,
      webPreferences:
        (process.env.NODE_ENV === 'production' ||
          process.env.E2E_BUILD === 'true') &&
        process.env.ERB_SECURE !== 'true'
          ? {
              nodeIntegration: true,
              devTools: false,
              enableRemoteModule: true,
            }
          : {
              preload: path.join(__dirname, '../dist/renderer.prod.js'),
              devTools: false,
              enableRemoteModule: true,
            },
    });
    this.browserWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    this.browserWindow.setIgnoreMouseEvents(true);
    this.browserWindow.setAlwaysOnTop(true, 'floating');
    this.browserWindow.maximize();

    this.browserWindow.webContents.on('did-finish-load', () => {
      if (!this.browserWindow) {
        throw new Error('"this.browserWindow" is not defined');
      }

      if (process.env.START_MINIMIZED) {
        this.browserWindow.minimize();
      } else {
        this.browserWindow.show();
        this.browserWindow.showInactive();

        this.browserWindow.focus();
      }
    });
  }

  public closeWindow() {
    if (this.browserWindow?.isClosable) {
      this.browserWindow?.close();
    }
    this.browserWindow = undefined;
  }
}
