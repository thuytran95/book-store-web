"use client";

import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
  type Address,
} from "../hooks/use-account";
import { AddressForm } from "./address-form";

export function AddressBook() {
  const { data: addresses, isLoading, error } = useAddresses();
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  if (isLoading) return <Skeleton className="h-40" />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Địa chỉ giao hàng</h1>
        <Button onClick={() => setEditing("new")}>
          <Plus /> Thêm địa chỉ
        </Button>
      </div>

      {!addresses?.length ? (
        <EmptyState title="Bạn chưa có địa chỉ nào" description="Thêm địa chỉ để đặt hàng nhanh hơn." />
      ) : (
        <ul className="grid gap-3">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 text-sm">
              <div className="grid gap-0.5">
                <p className="font-medium">
                  {a.recipient} · {a.phone}
                  {a.is_default && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Mặc định</span>
                  )}
                </p>
                <p className="text-muted-foreground">
                  {a.line}, {a.ward}, {a.district}, {a.province}
                </p>
              </div>
              <div className="flex gap-1">
                {!a.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={setDefault.isPending}
                    onClick={() => setDefault.mutate(a.id, { onSuccess: () => toast.success("Đã đặt làm mặc định") })}
                  >
                    <Star /> Đặt mặc định
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" aria-label="Sửa địa chỉ" onClick={() => setEditing(a)}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Xoá địa chỉ" onClick={() => setDeleting(a)}>
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Địa chỉ mới" : "Sửa địa chỉ"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <AddressForm
              defaultValues={editing === "new" ? { is_default: !addresses?.length } : editing}
              onCancel={() => setEditing(null)}
              onSubmit={async (values) => {
                if (editing === "new") await create.mutateAsync(values);
                else await update.mutateAsync({ id: editing.id, body: values });
                toast.success("Đã lưu địa chỉ");
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xoá địa chỉ?"
        message="Địa chỉ này sẽ bị xoá khỏi sổ địa chỉ của bạn."
        destructive
        confirmLabel="Xoá"
        loading={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Đã xoá địa chỉ");
              setDeleting(null);
            },
            onError: (e) => {
              toast.error(errorMessage(e));
              setDeleting(null);
            },
          })
        }
      />
    </div>
  );
}
