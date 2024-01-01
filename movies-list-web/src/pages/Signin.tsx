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

      navigate(ROUTES.movies);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={handleLogin}
        validationSchema={signinSchema}
      >
        {() => (
          <Form className="flex flex-col gap-4 items-center justify-center h-[100vh] md:w-1/5">
            <h1 className="mb-6 text-6xl text-white">Sign in</h1>
            <Input name="email" type="email" placeholder="Email" />
            <Input name="password" type="password" placeholder="Password" />
            <Checkbox name="remember" label="Remember me" />
            {error && <div className="text-red-500">{error}</div>}
            <Button className="w-full" type="submit">
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
