import { useState } from "react";
import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { Input } from "components/Input";
import { ROUTES } from "constants/routes";
import { Form, Formik } from "formik";
import { signinSchema } from "schemas/signinSchema";
import { Navigate, useNavigate } from "react-router-dom";
import { Credentials, login } from "services/api";
import { getRememberedEmail, getToken, rememberEmail, setToken } from "services/session";

export const Signin = (): JSX.Element => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (getToken()) return <Navigate to={ROUTES.movies} replace />;

  const handleLogin = async (values: Credentials & { remember: boolean }) => {
    setError(null);
    try {
      setToken(await login(values));
      rememberEmail(values.remember ? values.email : null);
      navigate(ROUTES.movies);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-in failed");
    }
  };

  const rememberedEmail = getRememberedEmail();

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Formik
        initialValues={{ email: rememberedEmail, password: "", remember: Boolean(rememberedEmail) }}
        onSubmit={handleLogin}
        validationSchema={signinSchema}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4 justify-center min-h-[100dvh] w-full max-w-sm px-6">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-primary">Movie List</p>
            <h1 className="mb-4 text-5xl sm:text-6xl text-ink">Sign in</h1>
            <Input name="email" type="email" label="Email" autoComplete="email" />
            <Input name="password" type="password" label="Password" autoComplete="current-password" />
            <Checkbox name="remember" label="Remember email" />
            {error && <p role="alert" className="text-error">{error}</p>}
            <Button disabled={isSubmitting} className="w-full mt-2" type="submit">
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
