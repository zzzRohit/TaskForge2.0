import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, signup } from "../../lib/api/auth";
import { Icon, TaskForgeLogo } from "../layout/AppShell";

type FieldErrors = Record<string, string>;

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");

  function quickFill() {
    setEmail("sarah@taskforge.dev");
    setPassword("taskforge-demo");
    setErrors({});
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};

    if (!email.includes("@")) {
      nextErrors.email = "Valid email required";
    }

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Invalid email or password combination");
      return;
    }

    setIsLoading(true);
    setNotice("");
    try {
      await login(email, password);
      navigate("/organizations");
    } catch {
      setNotice("Invalid email or password combination");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCanvas>
      <div className="w-full max-w-md">
        <section className="rounded-xl bg-surface p-8 shadow-sm sm:p-10">
          <div className="flex flex-col items-center text-center">
            <TaskForgeLogo />
            <h1 className="mt-5 text-[28px] font-semibold leading-[34px] tracking-normal text-ink">
              Welcome back to TaskForge
            </h1>
            <p className="mt-2 text-[13px] leading-[18px] text-ink-2">
              Sign in to access your organizations and boards.
            </p>
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-low)] px-3 py-1 font-mono text-[10px] font-medium uppercase text-ink hover:bg-[var(--surface-container)]"
              onClick={quickFill}
              type="button"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-ink-2">Quick fill:</span>
              <span>sarah@taskforge.dev</span>
              <Icon className="text-[14px]">arrow_forward</Icon>
            </button>
          </div>

          {notice ? (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--destructive-wash)] p-3 text-left text-sm font-medium text-danger">
              <Icon className="text-[18px]">error</Icon>
              <span>{notice}</span>
            </div>
          ) : null}

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <AuthField
              autoComplete="email"
              error={errors.email}
              label="Email address"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              type="email"
              value={email}
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink" htmlFor="password">
                  Password
                </label>
                <a className="text-[13px] text-ink-2 hover:text-ink" href="#forgot">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className={`h-10 w-full rounded-lg bg-surface px-3.5 pr-10 text-[13px] text-ink shadow-sm outline-none placeholder:text-line-strong focus:bg-surface ${
                    errors.password ? "bg-red-50 text-danger" : ""
                  }`}
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-3 hover:text-ink"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  <Icon className="text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </Icon>
                </button>
              </div>
              {errors.password ? (
                <p className="text-[13px] text-danger">{errors.password}</p>
              ) : null}
            </div>
            <button
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-accent-fg shadow-sm hover:bg-[var(--accent-hover)] disabled:opacity-70"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? <Spinner /> : <><span>Sign in</span><Icon className="text-[16px]">arrow_forward</Icon></>}
            </button>
          </form>

          <div className="-mx-8 -mb-8 mt-6 rounded-b-xl bg-[color-mix(in_srgb,var(--surface-container-low)_55%,transparent)] py-4 text-center text-[13px] sm:-mx-10 sm:-mb-10">
            <span className="text-ink-2">Don't have an account? </span>
            <Link className="font-medium text-ink hover:underline" to="/signup">
              Sign up
            </Link>
          </div>
        </section>
        <SecurityFooter />
      </div>
    </AuthCanvas>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "Sarah Jenkins",
    email: "sarah@taskforge.dev",
    password: "",
    confirmPassword: "",
    terms: true,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};

    if (form.name.trim().length < 2) nextErrors.name = "Full name is required";
    if (!form.email.includes("@")) nextErrors.email = "Work email is required";
    if (form.password.length < 8) nextErrors.password = "Use 8+ characters";
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords must match";
    }
    if (!form.terms) nextErrors.terms = "Terms must be accepted";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    setSuccess("");
    try {
      await signup({
        email: form.email,
        name: form.name,
        password: form.password,
      });
      setSuccess(`Verification link dispatched to ${form.email}. Check your inbox.`);
      window.setTimeout(() => navigate("/login"), 700);
    } catch {
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCanvas>
      <div className="w-full max-w-[440px]">
        <section className="rounded-xl bg-surface p-8 shadow-xl sm:p-10">
          {success ? (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-[var(--surface-container-low)] p-4">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-100 text-success">
                <Icon className="text-[16px]">check</Icon>
              </span>
              <div>
                <h2 className="font-semibold text-ink">Account created successfully</h2>
                <p className="mt-1 text-[13px] text-ink-2">{success}</p>
              </div>
            </div>
          ) : null}
          <div className="mb-8 flex flex-col items-center text-center">
            <TaskForgeLogo />
            <span className="mt-5 rounded bg-[var(--surface-container-low)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-2">
              V2.4 Workspace
            </span>
            <h1 className="mt-2 text-[28px] font-semibold leading-[34px] text-ink">
              Create your account
            </h1>
            <p className="mt-1.5 max-w-xs text-[13px] leading-[18px] text-ink-2">
              Start organizing teams, boards, and workflows with precision.
            </p>
          </div>

          {errors.form ? <p className="mb-4 text-sm text-danger">{errors.form}</p> : null}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <AuthField label="Full name" value={form.name} error={errors.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Jane Doe" />
            <AuthField label="Work email" value={form.email} error={errors.email} onChange={(event) => updateField("email", event.target.value)} placeholder="sarah@taskforge.dev" type="email" />
            <AuthField label="Password" value={form.password} error={errors.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Min. 8 characters" type="password" />
            <AuthField label="Confirm password" value={form.confirmPassword} error={errors.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} placeholder="Repeat password" type="password" />
            <label className="flex cursor-pointer items-start gap-3 text-[13px] text-ink-2">
              <input
                checked={form.terms}
                className="mt-1 accent-black"
                onChange={(event) => updateField("terms", event.target.checked)}
                type="checkbox"
              />
              <span>
                I agree to the <a className="font-medium text-ink hover:underline" href="#terms">Terms of Service</a> and <a className="font-medium text-ink hover:underline" href="#privacy">Privacy Policy</a>.
                {errors.terms ? <span className="block pt-1 text-danger">{errors.terms}</span> : null}
              </span>
            </label>
            <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent-hover)] text-base font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-70" disabled={isLoading} type="submit">
              {isLoading ? <Spinner /> : "Create Account"}
            </button>
          </form>

          <div className="-mx-8 -mb-8 mt-6 rounded-b-xl bg-gradient-to-b from-transparent to-[var(--surface-container-low)]/40 px-8 pb-8 pt-5 sm:-mx-10 sm:-mb-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--surface-container-high)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-2">Or continue with</span>
              <div className="h-px flex-1 bg-[var(--surface-container-high)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SsoButton>Google</SsoButton>
              <SsoButton>GitHub</SsoButton>
            </div>
            <p className="mt-5 text-center text-[13px] text-ink-2">
              Already have an account?{" "}
              <Link className="font-medium text-ink hover:underline" to="/login">
                Log in
              </Link>
            </p>
          </div>
        </section>
        <SecurityFooter includeSla />
      </div>
    </AuthCanvas>
  );
}

function AuthCanvas({ children }: { children: ReactNode }) {
  return (
    <main className="auth-wrap">
      <div className="relative z-10 flex w-full flex-col items-center justify-center">
        {children}
      </div>
    </main>
  );
}

function AuthField(props: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const { error, label, ...inputProps } = props;
  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
          {label}
        </label>
        {error ? <span className="text-[13px] text-danger">{error}</span> : null}
      </div>
      <input
        className={`h-10 w-full rounded-lg bg-surface px-3.5 text-[13px] text-ink shadow-sm outline-none placeholder:text-line-strong focus:bg-surface ${
          error ? "bg-red-50 text-danger" : ""
        }`}
        {...inputProps}
      />
    </div>
  );
}

function SecurityFooter({ includeSla = false }: { includeSla?: boolean }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] font-medium uppercase text-ink-3">
      <span className="flex items-center gap-1.5"><Icon className="text-[13px]">lock</Icon>256-bit encryption</span>
      <span>•</span>
      <span className="flex items-center gap-1.5"><Icon className="text-[13px]">verified_user</Icon>SOC-2 certified</span>
      {includeSla ? <><span>•</span><span className="flex items-center gap-1.5"><Icon className="text-[13px]">bolt</Icon>99.99% SLA</span></> : null}
    </div>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

function SsoButton({ children }: { children: ReactNode }) {
  return (
    <button className="h-9 rounded-md bg-surface text-sm font-medium text-ink shadow-sm hover:bg-surface-raised" type="button">
      {children}
    </button>
  );
}
