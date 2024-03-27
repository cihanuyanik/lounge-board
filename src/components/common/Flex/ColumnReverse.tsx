import Flex, { FlexProps } from "./Flex";

type ColumnReverseProps = Omit<FlexProps, "direction">;

export default function ColumnReverse(props: ColumnReverseProps) {
  return <Flex {...props} direction={"column-reverse"} />;
}
