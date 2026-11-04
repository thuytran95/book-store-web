"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { homeContent } from "@/config/home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { MaterialIcon } from "./material-icon";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type FormValues = z.infer<typeof schema>;

export function NewsletterForm() {
  const { newsletter } = homeContent;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <section className="w-full border-t border-gray-200 bg-[#f4f7f5] py-10">
      <div className="mx-auto max-w-4xl space-y-3 px-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-sm">
          <MaterialIcon name="mark_email_read" className="text-2xl" />
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900">{newsletter.title}</h3>
        <p className="mx-auto max-w-xl text-xs text-gray-600 sm:text-sm">{newsletter.description}</p>
        <form
          className="mx-auto flex max-w-md flex-col gap-2 pt-2 sm:flex-row"
          onSubmit={handleSubmit(() => {
            toast.success(newsletter.successMessage);
            reset();
          })}
        >
          <div className="flex-1 text-left">
            <label htmlFor="newsletter-email" className="sr-only">
              Email
            </label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder={newsletter.placeholder}
              className="rounded-full border-black bg-white px-4 py-3 text-xs sm:text-sm"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 px-2 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 rounded-full px-6 py-3 text-xs font-bold shadow-sm sm:text-sm"
          >
            {newsletter.submitLabel}
          </Button>
        </form>
      </div>
    </section>
  );
}
