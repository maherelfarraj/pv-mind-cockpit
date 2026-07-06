import { getCurrentWindow } from '@tauri-apps/api/window'

export async function maximizeDesktopShell() {
  const currentWindow = getCurrentWindow()
  await currentWindow.maximize()
}

export const desktopShellConfig = {
  macOSOnly: true,
  wrappedApp: 'apps/web'
} as const
