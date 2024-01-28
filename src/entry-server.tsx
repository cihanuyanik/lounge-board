import { createHandler } from "@solidjs/start/entry";
import { StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/*<script*/}
          {/*  async*/}
          {/*  defer*/}
          {/*  crossOrigin="anonymous"*/}
          {/*  src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"*/}
          {/*  nonce="0hCatdnV"*/}
          {/*/>*/}
          {/*<script*/}
          {/*  async*/}
          {/*  defer*/}
          {/*  src="https://platform.twitter.com/widgets.js"*/}
          {/*  charset="utf-8"*/}
          {/*></script>*/}

          <link rel="icon" href="/favicon.ico" />

          {assets}
        </head>
        <body>
          <script
            async
            defer
            crossOrigin="anonymous"
            src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"
            nonce="AaQrMFZx"
          ></script>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
