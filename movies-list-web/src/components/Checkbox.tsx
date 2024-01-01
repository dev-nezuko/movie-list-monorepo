import { HTMLProps } from "react";
import classnames from "classnames";

interface Props extends HTMLProps<HTMLInputElement> {
  label: string;
}

export const Checkbox = ({ label, className, ...props }: Props) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={classnames(
          "w-4 h-4 border-gray-300 rounded text-primary bg-primary focus:ring-primary",
          className
        )}
        {...props}
      />
      <label
        html-for="default-checkbox"
        className="text-sm font-medium text-white ms-2"
      >
        {label}
      </label>
    </div>
  );
};
