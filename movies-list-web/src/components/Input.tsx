import { HTMLProps } from "react";
import classnames from "classnames";
import { ErrorMessage, useField } from "formik";

interface Props extends HTMLProps<HTMLInputElement> {
  name: string;
  label: string;
}

export const Input = ({ name, label, className, type = "text", ...props }: Props): JSX.Element => {
  const [field, meta, { setValue }] = useField(name);
  const id = `${name}-input`;
  const errorId = `${name}-error`;
  const invalid = meta.touched && !!meta.error;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block mb-1.5 text-sm font-semibold text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        className={classnames(
          "text-ink rounded-lg block w-full p-2.5 bg-inputColor border placeholder:text-muted",
          invalid ? "border-error" : "border-line",
          className
        )}
        {...props}
        {...field}
        onChange={(e) => setValue(e.target.value)}
      />
      <ErrorMessage name={name}>
        {(msg) => (
          <p id={errorId} className="mt-1 text-sm text-error">
            {msg}
          </p>
        )}
      </ErrorMessage>
    </div>
  );
};
