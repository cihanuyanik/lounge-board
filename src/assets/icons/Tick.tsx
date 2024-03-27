import { JSX } from "solid-js";

export default function Tick(props: JSX.HTMLAttributes<SVGSVGElement>) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      version="1.1"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M13.5 2l-7.5 7.5-3.5-3.5-2.5 2.5 6 6 10-10z"></path>
    </svg>
  );
}
