import Dropdown, { DropdownItem } from "~/components/common/Dropdown";
import { createSignal } from "solid-js";
import Button from "~/components/common/Button";

export default function Test() {
  const [value, setValue] = createSignal("2");
  return (
    <div class={"app-container"}>
      <blockquote class="twitter-tweet">
        <p lang="en" dir="ltr">
          Never search &quot;Klopp&quot; in the GIFs tab. Worst decision of my
          life!
          <br />{" "}
          <a href="https://t.co/s9usRHDRSc">pic.twitter.com/s9usRHDRSc</a>
        </p>
        &mdash; RMA_Thierros (@RMA_Thierros){" "}
        <a href="https://twitter.com/RMA_Thierros/status/1750942557167636986?ref_src=twsrc%5Etfw">
          January 26, 2024
        </a>
      </blockquote>
      <script
        async
        src="https://platform.twitter.com/widgets.js"
        charset="utf-8"
      ></script>
    </div>
  );
}
