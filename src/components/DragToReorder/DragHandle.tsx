export default function DragHandle(props: any) {
  return (
    // @ts-ignore
    <drag-handle classList={{ "drag-handle": true }} {...props}>
      <svg viewBox="0 0 32 32" fill="currentColor">
        <polygon points="4 20 15 20 15 26.17 12.41 23.59 11 25 16 30 21 25 19.59 23.59 17 26.17 17 20 28 20 28 18 4 18 4 20" />
        <polygon points="11 7 12.41 8.41 15 5.83 15 12 4 12 4 14 28 14 28 12 17 12 17 5.83 19.59 8.41 21 7 16 2 11 7" />
      </svg>
      {/*@ts-ignore*/}
    </drag-handle>
  );
}
