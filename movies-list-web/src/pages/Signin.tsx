import { useState } from "react";
import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { Input } from "components/Input";
import { ROUTES } from "constants/routes";
import { Form, Formik } from "formik";
import { signinSchema } from "schemas/signinSchema";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export const Signin = (): JSX.Element => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: any) => {
    try {
      const userToken = await login(values);

      localStorage.setItem('userToken', userToken);
      if (values.remember) localStorage.setItem('rememberedEmail', values.email);
      else localStorage.removeItem('rememberedEmail');

      navigate(ROUTES.movies);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Formik
        initialValues={{ email: localStorage.getItem("rememberedEmail") || "", password: "" }}
        onSubmit={handleLogin}
        validationSchema={signinSchema}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4 items-center justify-center min-h-[100dvh] w-full max-w-sm px-6">
            <h1 className="mb-6 text-6xl text-white">Sign in</h1>
            <Input name="email" type="email" placeholder="Email" />
            <Input name="password" type="password" placeholder="Password" />
            <Checkbox name="remember" label="Remember email" />
            {error && <div className="text-red-500">{error}</div>}
            <Button disabled={isSubmitting} className="w-full" type="submit">
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
