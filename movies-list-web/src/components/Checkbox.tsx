import classnames from "classnames";
import { useField } from "formik";

interface Props {
  name: string;
  label: string;
  className?: string;
}

export const Checkbox = ({ name, label, className }: Props) => {
  const [field] = useField({ name, type: "checkbox" });
  const id = `${name}-checkbox`;

  return (
    <div className="flex items-center">
      <input {...field} id={id} type="checkbox" className={classnames("w-4 h-4 rounded accent-primary", className)} />
      <label htmlFor={id} className="text-sm text-ink ms-2">
        {label}
      </label>
    </div>
  );
};
