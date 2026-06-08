import styles from "./EditColor.module.css";

interface EditColorProps {
  value: number;
  setValue: (value: number) => void;
}

function rgb888ToRgb565(color: number) {
  let r = (color >> 16) & 0xff;
  let g = (color >> 8) & 0xff;
  let b = color & 0xff;

  console.log("base", r, g, b);

  return ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3); // Convert to RGB565
}

function rgb565ToRgb888(color565: number) {
  let r = ((color565 >> 11) & 0x1f) << 3;
  let g = ((color565 >> 5) & 0x3f) << 2;
  let b = (color565 & 0x1f) << 3;

  console.log("converted", r, g, b);

  return (r << 16) | (g << 8) | b;
}

const EditColor = ({ value, setValue }: EditColorProps) => {
  return (
    <div className={styles.selectColorSection}>
      <label>Color</label>
      <input
        type="color"
        className={styles.colorPicker}
        value={`#${value.toString(16).padStart(6, "0")}`}
        onChange={(e) =>
          setValue(
            rgb565ToRgb888(
              rgb888ToRgb565(parseInt(e.target.value.slice(1), 16))
            )
          )
        }
      />
    </div>
  );
};

export default EditColor;
