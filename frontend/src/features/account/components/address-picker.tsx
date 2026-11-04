"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useCreateAddress, type Address } from "../hooks/use-account";
import { AddressForm } from "./address-form";

type Props = {
  addresses: Address[];
  value: number | null;
  onChange: (id: number) => void;
  allowNew?: boolean;
};

export function AddressPicker({ addresses, value, onChange, allowNew = true }: Props) {
  const [open, setOpen] = useState(false);
  const create = useCreateAddress();

  return (
    <div className="grid gap-3">
      {addresses.length === 0 ? (
        <EmptyState title="Chưa có địa chỉ giao hàng" description="Thêm địa chỉ để tiếp tục." />
      ) : (
        <div role="radiogroup" aria-label="Địa chỉ giao hàng" className="grid gap-2">
          {addresses.map((a) => (
            <label
              key={a.id}
              className="flex cursor-pointer gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name="address"
                className="mt-1 accent-primary"
                checked={value === a.id}
                onChange={() => onChange(a.id)}
              />
              <span className="grid gap-0.5 text-sm">
                <span className="font-medium">
                  {a.recipient} · {a.phone}
                  {a.is_default && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      Mặc định
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {a.line}, {a.ward}, {a.district}, {a.province}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}

      {allowNew && (
        <>
          <Button type="button" variant="outline" className="justify-self-start" onClick={() => setOpen(true)}>
            <Plus /> Thêm địa chỉ mới
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Địa chỉ mới</DialogTitle>
              </DialogHeader>
              <AddressForm
                defaultValues={{ is_default: addresses.length === 0 }}
                onCancel={() => setOpen(false)}
                onSubmit={async (values) => {
                  const created = await create.mutateAsync(values);
                  onChange(created.id);
                  setOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
