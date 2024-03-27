import Flex, { FlexProps } from "./Flex";

type RowProps = Omit<FlexProps, "direction">;

export default function Row(props: RowProps) {
  return <Flex {...props} direction={"row"} />;
}
