import {
  createHandler,
  renderAsync,
  StartServer,
} from "solid-start/entry-server";

// noinspection JSUnusedGlobalSymbols
export default createHandler(
  renderAsync((event) => <StartServer event={event} />),
);
