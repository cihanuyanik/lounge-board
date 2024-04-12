// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import("./style/app.css");

mount(() => <StartClient />, document.getElementById("app")!);
