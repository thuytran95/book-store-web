"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  applyServerErrors,
  loginSchema,
  registerSchema,
  useLogin,
  useRegister,
  type LoginForm as LoginValues,
  type RegisterForm as RegisterValues,
} from "../hooks";

function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <header className="mb-4 grid gap-1">
      <h1 className="text-xl font-bold">{children}</h1>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </header>
  );
}

export function LoginForm() {
  const next = useSearchParams().get("next");
  const login = useLogin(next);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <>
      <Title>Đăng nhập</Title>
      <form
        noValidate
        className="grid gap-3"
        onSubmit={handleSubmit((v) => login.mutate(v, { onError: (e) => applyServerErrors(e, setError) }))}
      >
        <FormField label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </FormField>
        <FormField label="Mật khẩu" required error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register("password")} />
        </FormField>
        <ErrorMessage error={login.error} />
        <Button type="submit" disabled={login.isPending}>
          Đăng nhập
        </Button>
      </form>
      <p className="mt-4 flex justify-end text-sm">
        <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-primary hover:underline">
          Tạo tài khoản
        </Link>
      </p>
    </>
  );
}

export function RegisterForm() {
  const next = useSearchParams().get("next");
  const registerM = useRegister();
  const login = useLogin(next);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const pending = registerM.isPending || login.isPending;
  return (
    <>
      <Title sub="Mua sách cũ nhanh hơn với tài khoản của bạn.">Đăng ký</Title>
      <form
        noValidate
        className="grid gap-3"
        onSubmit={handleSubmit((v) =>
          registerM.mutate(v, {
            onSuccess: () => login.mutate({ email: v.email, password: v.password }),
            onError: (e) => applyServerErrors(e, setError),
          }),
        )}
      >
        <FormField label="Họ và tên" required error={errors.full_name?.message}>
          <Input autoComplete="name" {...register("full_name")} />
        </FormField>
        <FormField label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </FormField>
        <FormField label="Số điện thoại" error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...register("phone")} />
        </FormField>
        <FormField label="Mật khẩu" required hint="Tối thiểu 8 ký tự" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...register("password")} />
        </FormField>
        <ErrorMessage error={registerM.error ?? login.error} />
        <Button type="submit" disabled={pending}>
          Tạo tài khoản
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link>
      </p>
    </>
  );
}
