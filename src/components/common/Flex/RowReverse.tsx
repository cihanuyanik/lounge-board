import Flex, { FlexProps } from "./Flex";

type RowReverseProps = Omit<FlexProps, "direction">;

export default function RowReverse(props: RowReverseProps) {
  return <Flex {...props} direction={"row-reverse"} />;
}
