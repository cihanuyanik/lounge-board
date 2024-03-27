import { JSX } from "solid-js";

export default function Clock(props: JSX.HTMLAttributes<SVGSVGElement>) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="13" r="8"></circle>
      <path d="M12 9v4l2 2"></path>
      <path d="M5 3 2 6"></path>
      <path d="m22 6-3-3"></path>
      <path d="M6.38 18.7 4 21"></path>
      <path d="M17.64 18.67 20 21"></path>
    </svg>
  );
}
