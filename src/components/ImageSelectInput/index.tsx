import Button from "~/components/common/Button";
import Edit from "~/assets/icons/Edit";

type Props = {
  onImageSelected: (file: File) => void;
};

export default function (props: Props) {
  let imageSelectInput: HTMLInputElement = null!;

  return (
    <>
      <Button onClick={() => imageSelectInput.click()}>
        <Edit />
      </Button>
      <input
        ref={imageSelectInput}
        type="file"
        accept="image/png, image/jpeg"
        hidden
        onClick={(e) => (e.currentTarget.value = "")}
        onInput={() => {
          if (!imageSelectInput.files) return;
          if (imageSelectInput.files.length === 0) return;
          if (
            imageSelectInput.files[0].type !== "image/png" &&
            imageSelectInput.files[0].type !== "image/jpeg"
          )
            return;

          props.onImageSelected(imageSelectInput.files[0]);
        }}
      />
    </>
  );
}
