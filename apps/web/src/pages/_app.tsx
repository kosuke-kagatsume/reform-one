import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Reform One - リフォーム産業新聞社</title>
        <meta name="description" content="統合会員・課金・CMS・研修・建材プラットフォーム" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}