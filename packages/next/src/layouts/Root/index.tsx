import type { AcceptedLanguages } from '@payloadcms/translations'
import type { SanitizedConfig } from 'payload/types'

import { rtlLanguages } from '@payloadcms/translations'
import { initI18n } from '@payloadcms/translations'
import { RootProvider } from '@payloadcms/ui/providers/Root'
import '@payloadcms/ui/scss/app.scss'
import { buildComponentMap } from '@payloadcms/ui/utilities/buildComponentMap'
import { Merriweather } from 'next/font/google'
import { headers as getHeaders, cookies as nextCookies } from 'next/headers.js'
import { parseCookies } from 'payload/auth'
import { createClientConfig } from 'payload/config'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css'

import { getPayloadHMR } from '../../utilities/getPayloadHMR.js'
import { getRequestLanguage } from '../../utilities/getRequestLanguage.js'
import { DefaultEditView } from '../../views/Edit/Default/index.js'
import { DefaultListView } from '../../views/List/Default/index.js'

const merriweather = Merriweather({
  display: 'swap',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '900'],
})

export const RootLayout = async ({
  children,
  config: configPromise,
}: {
  children: React.ReactNode
  config: Promise<SanitizedConfig>
}) => {
  const config = await configPromise

  const headers = getHeaders()
  const cookies = parseCookies(headers)

  const languageCode = getRequestLanguage({
    config,
    cookies,
    headers,
  })

  const payload = await getPayloadHMR({ config })
  const i18n = await initI18n({ config: config.i18n, context: 'client', language: languageCode })
  const clientConfig = await createClientConfig({ config, t: i18n.t })

  const dir = (rtlLanguages as unknown as AcceptedLanguages[]).includes(languageCode)
    ? 'RTL'
    : 'LTR'

  const languageOptions = Object.entries(config.i18n.supportedLanguages || {}).reduce(
    (acc, [language, languageConfig]) => {
      if (Object.keys(config.i18n.supportedLanguages).includes(language)) {
        acc.push({
          label: languageConfig.translations.general.thisLanguage,
          value: language,
        })
      }

      return acc
    },
    [],
  )

  // eslint-disable-next-line @typescript-eslint/require-await
  async function switchLanguageServerAction(lang: string): Promise<void> {
    'use server'
    nextCookies().set({
      name: `${config.cookiePrefix || 'payload'}-lng`,
      path: '/',
      value: lang,
    })
  }

  const { componentMap, wrappedChildren } = buildComponentMap({
    DefaultEditView,
    DefaultListView,
    children,
    config,
    i18n,
    payload,
  })

  return (
    <html className={merriweather.variable} dir={dir} lang={languageCode}>
      <body>
        <RootProvider
          componentMap={componentMap}
          config={clientConfig}
          dateFNSKey={i18n.dateFNSKey}
          fallbackLang={clientConfig.i18n.fallbackLanguage}
          languageCode={languageCode}
          languageOptions={languageOptions}
          // eslint-disable-next-line react/jsx-no-bind
          switchLanguageServerAction={switchLanguageServerAction}
          translations={i18n.translations}
        >
          {wrappedChildren}
        </RootProvider>
        <div id="portal" />
      </body>
    </html>
  )
}
