import { app, BrowserWindow, desktopCapturer, ipcMain, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let studio: BrowserWindow | null
let floatingWebCam: BrowserWindow | null
let latestSources: any = null

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 600,
    minHeight: 600,
    minWidth: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      devTools: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  studio = new BrowserWindow({
    width: 300,
    height: 180,
    minHeight: 70,
    maxHeight: 300,
    minWidth: 250,
    maxWidth: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      devTools: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  floatingWebCam = new BrowserWindow({
    width: 200,
    height: 150,
    minHeight: 70,
    maxHeight: 200,
    minWidth: 150,
    maxWidth: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      devTools: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  win.setAlwaysOnTop(true, 'screen-saver', 1)
  studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  studio.setAlwaysOnTop(true, 'screen-saver', 1)
  floatingWebCam.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  floatingWebCam.setAlwaysOnTop(true, 'screen-saver', 1)


  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  studio.webContents.on('did-finish-load', () => {
    studio?.webContents.send('main-process-message', (new Date).toLocaleString())
    if (latestSources) {
      studio?.webContents.send('profile-recieved', latestSources)
    }
  })

  // Debug: log what we're loading
  studio.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[studio] failed to load: ${url} — ${code} ${desc}`)
  })
  floatingWebCam.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[webcam] failed to load: ${url} — ${code} ${desc}`)
  })
  studio.webContents.on('render-process-gone', (_e, details) => {
    console.error('[studio] render process gone:', details)
  })
  floatingWebCam.webContents.on('render-process-gone', (_e, details) => {
    console.error('[webcam] render process gone:', details)
  })

  if (VITE_DEV_SERVER_URL) {
    console.log('[main] VITE_DEV_SERVER_URL:', VITE_DEV_SERVER_URL)
    console.log('[main] studio URL:', `${VITE_DEV_SERVER_URL}src/studio.html`)
    console.log('[main] webcam URL:', `${VITE_DEV_SERVER_URL}src/webcam.html`)
    win.loadURL(VITE_DEV_SERVER_URL)
    studio.loadURL(`${import.meta.env.VITE_APP_URL}/src/studio.html`)
    floatingWebCam.loadURL(`${import.meta.env.VITE_APP_URL}/src/webcam.html`)
  } else {
    const serverApp = express()
    serverApp.use(express.static(RENDERER_DIST))
    const server = serverApp.listen(0, 'localhost', () => {
      const port = (server.address() as any).port
      win?.loadURL(`http://localhost:${port}/`)
      studio?.loadURL(`http://localhost:${port}/src/studio.html`)
      floatingWebCam?.loadURL(`http://localhost:${port}/src/webcam.html`)
    })
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
    studio = null
    floatingWebCam = null
  }
})

ipcMain.on('closeApp', () => {
  if (process.platform !== 'darwin')
    app.quit()
  win = null
  studio = null
  floatingWebCam = null
})

ipcMain.handle('getSources', async () => {
  return await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: {
      width: 100,
      height: 150
    }
  })
})

ipcMain.on('media-sources', (_event, payload) => {
  latestSources = payload
  studio?.webContents.send('profile-recieved', payload)
})

ipcMain.on('resize-studio', (_event, payload) => {
  console.log(payload)
  if (payload.shrink) {
    studio?.setSize(300, 70)
  }
  if (!payload.shrink) {
    studio?.setSize(300, 180)
  }
})

ipcMain.on('hide-plugin', (_event, payload) => {
  win?.webContents.send('hide-plugin', payload)
  win?.setIgnoreMouseEvents(payload.state)
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  const customUserAgent = session.defaultSession.getUserAgent().replace(/Electron\/\S*\s/, "")
  session.defaultSession.setUserAgent(customUserAgent)
  createWindow()
})
