import type { Configuration } from '@azure/msal-browser'
import { LogLevel } from '@azure/msal-browser'

export const scopes = [
  'openid','profile', 'api://f20cc733-eebf-463a-ab96-563ba859f21e/Cadets.AccessAll'
]

export const config: Configuration = {
  // required
  auth: {
    // must match info in dashboard
    clientId: "f20cc733-eebf-463a-ab96-563ba859f21e",
    authority: 'https://login.microsoftonline.com/bdfee2d1-e1a2-48f9-bc73-f52ffee2db1d/',
    knownAuthorities: [
      'https://login.microsoftonline.com/bdfee2d1-e1a2-48f9-bc73-f52ffee2db1d',
    ],

    // login redirect; must match path in dashboard
    redirectUri: `${window.location.origin}/callback.html`,
  },

  // optional
  system: {
    loggerOptions: {
      logLevel: LogLevel.Error,
      loggerCallback,
    }
  }
}
console.log(config)
function loggerCallback (level: LogLevel, message: string, containsPii: boolean) {
  if (!containsPii) {
    const parts = message.split(' : ')
    const text = parts.pop()
    switch (level) {
      case LogLevel.Error:
        return console.error(text)

      case LogLevel.Warning:
        return console.warn(text)

      case LogLevel.Info:
        return console.info(text)

      case LogLevel.Verbose:
        return console.debug(text)
    }
  }
}
