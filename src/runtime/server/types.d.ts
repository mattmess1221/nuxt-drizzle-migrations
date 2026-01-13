declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'drizzle:migrations:after': () => void
  }
}

declare module 'nitropack/types' {
  interface NitroAppPluginHooks {
    'drizzle:migrations:after': () => void
  }
}

export {}
