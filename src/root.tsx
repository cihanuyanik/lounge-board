// @refresh reload
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "./app.scss";

import { AppContextProvider } from "~/AppContext";

// noinspection JSUnusedGlobalSymbols
export default function Root() {
  return (
    <AppContextProvider>
      <Html lang="en">
        <Head>
          <Title>Lounge Board</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Body>
          <Suspense>
            <ErrorBoundary>
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </Body>
      </Html>
    </AppContextProvider>
  );
}
