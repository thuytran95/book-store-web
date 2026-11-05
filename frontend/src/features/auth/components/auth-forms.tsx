"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  applyServerErrors,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  useForgotPassword,
  useLogin,
  useRegister,
  useResetPassword,
  type LoginForm as LoginValues,
  type RegisterForm as RegisterValues,
} from "../hooks";
import { z } from "zod";
import { LinkButton } from "@/components/shared/link-button";

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
      <p className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">Quên mật khẩu?</Link>
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

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(forgotPasswordSchema) });

  if (sent) {
    return (
      <>
        <Title>Kiểm tra email của bạn</Title>
        <p className="text-sm text-muted-foreground">
          Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </>
    );
  }
  return (
    <>
      <Title sub="Nhập email để nhận liên kết đặt lại mật khẩu.">Quên mật khẩu</Title>
      <form
        noValidate
        className="grid gap-3"
        // Always show "check your email", whatever the outcome, to avoid account enumeration.
        onSubmit={handleSubmit((v) => forgot.mutate(v.email, { onSettled: () => setSent(true) }))}
      >
        <FormField label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </FormField>
        <Button type="submit" disabled={forgot.isPending}>
          Gửi liên kết
        </Button>
      </form>
    </>
  );
}

const resetFormSchema = resetPasswordSchema.omit({ token: true });

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const reset = useResetPassword();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof resetFormSchema>>({ resolver: zodResolver(resetFormSchema) });

  if (!token) {
    return (
      <>
        <Title>Liên kết không hợp lệ</Title>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Yêu cầu liên kết mới
        </Link>
      </>
    );
  }
  if (done) {
    return (
      <>
        <Title>Đã đặt lại mật khẩu</Title>
        <LinkButton href="/login">Đăng nhập</LinkButton>
      </>
    );
  }
  return (
    <>
      <Title>Đặt lại mật khẩu</Title>
      <form
        noValidate
        className="grid gap-3"
        onSubmit={handleSubmit((v) =>
          reset.mutate(
            { token, new_password: v.new_password },
            { onSuccess: () => setDone(true), onError: (e) => applyServerErrors(e, setError) },
          ),
        )}
      >
        <FormField label="Mật khẩu mới" required hint="Tối thiểu 8 ký tự" error={errors.new_password?.message}>
          <Input type="password" autoComplete="new-password" {...register("new_password")} />
        </FormField>
        <ErrorMessage error={reset.error} />
        <Button type="submit" disabled={reset.isPending}>
          Đặt lại mật khẩu
        </Button>
      </form>
    </>
  );
}
