import { JSX, splitProps } from "solid-js";

type ResizeIconProps = {
  rotate?: number;
  style?: JSX.CSSProperties;
} & Omit<JSX.HTMLAttributes<SVGSVGElement>, "style">;

export default function ResizeIcon(props: ResizeIconProps) {
  const [local, rest] = splitProps(props, ["rotate", "style"]);
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 448 512"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `rotate(${local.rotate ?? 0}deg)`,
        ...local.style,
      }}
      // class={css({
      //   pointerEvents: "none",
      //   margin: "2",
      // }).concat(local.class ?? "")}
      {...rest}
    >
      <rect color="white" x="50" y="120" width="350" height="300"></rect>
      <path d="M0 432V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48zm355.515-140.485l-123.03-123.03c-4.686-4.686-12.284-4.686-16.971 0L92.485 291.515c-7.56 7.56-2.206 20.485 8.485 20.485h246.059c10.691 0 16.045-12.926 8.486-20.485z"></path>
    </svg>
  );
}
