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
      <input
        {...field}
        id={id}
        type="checkbox"
        className={classnames("w-4 h-4 border-gray-300 rounded text-primary bg-primary focus:ring-primary", className)}
      />
      <label htmlFor={id} className="text-sm font-medium text-white ms-2">
        {label}
      </label>
    </div>
  );
};
