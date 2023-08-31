import { Html, Head, Main, NextScript } from "next/document";
import React from "react";
import Link from "next/link";
import {
  BaseLinkComponentOverrideContext,
  JSServerStyles,
  Providers,
  darkTheme,
  lightTheme,
} from "aidos-ui/dist";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <JSServerStyles />
      </Head>
      <body>
        <BaseLinkComponentOverrideContext.Provider
          value={(props) => <Link {...props} />}
        >
          <Providers themes={{ light: lightTheme, dark: darkTheme }}>
            <Main />
          </Providers>
        </BaseLinkComponentOverrideContext.Provider>
        <NextScript />
        <style>{`
          #__next {
            height: 100%;
            width: 100%;
          }
        `}</style>
      </body>
    </Html>
  );
}
