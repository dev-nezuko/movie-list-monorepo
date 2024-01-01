import { HTMLProps } from "react";
import classnames from "classnames";
import { ErrorMessage, useField } from "formik";

interface Props extends HTMLProps<HTMLInputElement> {
  name: string;
}

export const Input = ({
  name,
  className,
  type = "text",
  ...props
}: Props): JSX.Element => {
  const [field, meta, { setValue }] = useField(name);

  return (
    <div className="w-full">
      <input
        type={type}
        className={classnames(
          "text-white text-sm rounded-lg block w-full p-2.5 bg-inputColor placeholder:text-white",
          className,
          { "border border-error": meta.touched && !!meta.error }
        )}
        {...props}
        {...field}
        onChange={(e) => setValue(e.target.value)}
      />
      <ErrorMessage name={name}>
        {(msg) => (
          <div className="mt-1 text-error" role="alert" aria-label={msg}>
            {msg}
          </div>
        )}
      </ErrorMessage>
    </div>
  );
};
