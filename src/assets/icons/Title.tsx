import { JSX } from "solid-js";

export default function (props: JSX.HTMLAttributes<SVGSVGElement>) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M5 4v3h5.5v12h3V7H19V4z"></path>
    </svg>
  );
}
