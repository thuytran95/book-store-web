"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyServerErrors } from "@/lib/forms";
import { addressSchema, type AddressForm as AddressFormValues } from "@/lib/validation/address";
import { useState } from "react";

type Props = {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => Promise<unknown> | unknown;
  submitLabel?: string;
  onCancel?: () => void;
};

const EMPTY: AddressFormValues = {
  recipient: "",
  phone: "",
  line: "",
  ward: "",
  district: "",
  province: "",
  is_default: false,
};

export function AddressForm({ defaultValues, onSubmit, submitLabel = "Lưu địa chỉ", onCancel }: Props) {
  const [formError, setFormError] = useState<unknown>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (e) {
      if (!applyServerErrors(e, setError)) setFormError(e);
    }
  });

  return (
    <form onSubmit={submit} className="grid gap-3" noValidate>
      <FormField label="Người nhận" required error={errors.recipient?.message}>
        <Input autoComplete="name" {...register("recipient")} />
      </FormField>
      <FormField label="Số điện thoại" required error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" {...register("phone")} />
      </FormField>
      <FormField label="Địa chỉ (số nhà, đường)" required error={errors.line?.message}>
        <Input autoComplete="address-line1" {...register("line")} />
      </FormField>
      <div className="grid gap-3 sm:grid-cols-3">
        <FormField label="Phường/Xã" required error={errors.ward?.message}>
          <Input {...register("ward")} />
        </FormField>
        <FormField label="Quận/Huyện" required error={errors.district?.message}>
          <Input {...register("district")} />
        </FormField>
        <FormField label="Tỉnh/Thành phố" required error={errors.province?.message}>
          <Input {...register("province")} />
        </FormField>
      </div>
      <Controller
        control={control}
        name="is_default"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox id="addr-default" checked={field.value} onCheckedChange={field.onChange} />
            <Label htmlFor="addr-default">Đặt làm địa chỉ mặc định</Label>
          </div>
        )}
      />
      <ErrorMessage error={formError} />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Huỷ
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
