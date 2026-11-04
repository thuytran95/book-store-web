"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { applyServerErrors } from "@/lib/forms";
import { toast } from "@/lib/toast";
import { profileSchema, type ProfileForm as Values } from "@/lib/validation/profile";
import { useProfile, useUpdateProfile } from "../hooks/use-account";

export function ProfileForm() {
  const { data: user, isLoading } = useProfile();
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(profileSchema), defaultValues: { full_name: "", phone: "" } });

  useEffect(() => {
    if (user) reset({ full_name: user.full_name, phone: user.phone ?? "" });
  }, [user, reset]);

  if (isLoading) return <Skeleton className="h-48 max-w-md" />;
  if (!user) return null;

  return (
    <form
      noValidate
      className="grid max-w-md gap-3"
      onSubmit={handleSubmit((v) =>
        update.mutate(
          { full_name: v.full_name, phone: v.phone || null },
          {
            onSuccess: () => toast.success("Đã lưu hồ sơ"),
            onError: (e) => applyServerErrors(e, setError),
          },
        ),
      )}
    >
      <FormField label="Email">
        <Input value={user.email} disabled readOnly />
      </FormField>
      <FormField label="Họ và tên" required error={errors.full_name?.message}>
        <Input autoComplete="name" {...register("full_name")} />
      </FormField>
      <FormField label="Số điện thoại" error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" {...register("phone")} />
      </FormField>
      <ErrorMessage error={update.error} />
      <Button type="submit" className="justify-self-start" disabled={update.isPending || !isDirty}>
        Lưu thay đổi
      </Button>
    </form>
  );
}
