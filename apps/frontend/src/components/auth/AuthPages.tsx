import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";

type AuthMode = "login" | "signup";

type FieldErrors = Record<string, string>;

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};

    if (!email.includes("@")) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please fix the highlighted fields.");
      return;
    }

    setIsLoading(true);
    setNotice("");
    window.setTimeout(() => {
      setIsLoading(false);
      navigate("/organizations");
    }, 700);
  }

  return (
    <AuthFrame mode="login">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          error={errors.email}
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <Input
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          type="password"
          value={password}
        />
        {notice ? <p className="text-sm text-danger">{notice}</p> : null}
        <Button className="w-full" isLoading={isLoading} type="submit">
          Sign In
        </Button>
      </form>
    </AuthFrame>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.email.includes("@")) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please fix the highlighted fields.");
      return;
    }

    setIsLoading(true);
    setNotice("");
    window.setTimeout(() => {
      setIsLoading(false);
      setNotice("Account created. Redirecting...");
      window.setTimeout(() => navigate("/organizations"), 500);
    }, 700);
  }

  return (
    <AuthFrame mode="signup">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          autoComplete="name"
          error={errors.name}
          label="Name"
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Your name"
          value={form.name}
        />
        <Input
          autoComplete="email"
          error={errors.email}
          label="Email"
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={form.email}
        />
        <Input
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Create a password"
          type="password"
          value={form.password}
        />
        <Input
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Confirm Password"
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          placeholder="Confirm your password"
          type="password"
          value={form.confirmPassword}
        />
        {notice ? (
          <p className={notice.startsWith("Account") ? "text-sm text-success" : "text-sm text-danger"}>
            {notice}
          </p>
        ) : null}
        <Button className="w-full" isLoading={isLoading} type="submit">
          Create Account
        </Button>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({
  children,
  mode,
}: {
  children: ReactNode;
  mode: AuthMode;
}) {
  const isLogin = mode === "login";

  return (
    <main className="auth-wrap">
      <section className="w-full max-w-[420px] rounded-[var(--r-dialog)] border border-line bg-surface px-7 py-7 shadow-[0_1px_2px_rgba(19,18,17,0.04)] sm:px-8">
        <div className="mb-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--r-lg)] bg-accent font-semibold text-accent-fg">
              T
            </span>
            <span className="text-base font-semibold text-ink">TaskForge</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-ink">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-2">
            {isLogin
              ? "Sign in to continue to your workspace."
              : "Start organizing your work with TaskForge."}
          </p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-ink-2">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            className="font-medium text-accent hover:text-[var(--accent-hover)]"
            to={isLogin ? "/signup" : "/login"}
          >
            {isLogin ? "Create one" : "Sign in"}
          </Link>
        </p>
      </section>
    </main>
  );
}
