import Flex, { FlexProps } from "./Flex";

type ColumnProps = Omit<FlexProps, "direction">;

export default function Column(props: ColumnProps) {
  return <Flex {...props} direction={"column"} />;
}
