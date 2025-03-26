'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const paymentSchema = z.object({
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
  note: z.string().optional(),
});

type PaymentFormProps = {
  transactionId: string;
  splitId: string;
  amount: number;
  payerId?: string | null;
  locale: string;
};

type FormValues = z.infer<typeof paymentSchema>;

export default function PaymentForm({
  transactionId,
  splitId,
  amount,
  payerId,
  locale,
}: PaymentFormProps) {
  const t = useTranslations("Settlements");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "",
      note: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!payerId) {
      toast.error(t("no_user_associated"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/transactions/${transactionId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payerId,
          amount,
          paymentMethod: data.paymentMethod,
          note: data.note,
          splitId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record payment");
      }

      toast.success(t("payment_recorded"));
      router.push(`/${locale}/settlements`);
      router.refresh();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error(t("error_recording_payment"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">{t("payment_method")}</Label>
        <Input
          id="paymentMethod"
          {...register("paymentMethod")}
          placeholder={t("payment_method_placeholder")}
        />
        {errors.paymentMethod && (
          <p className="text-red-500 text-sm">{errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">{t("note")}</Label>
        <Textarea
          id="note"
          {...register("note")}
          placeholder={t("note_placeholder")}
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !payerId}
        >
          {isSubmitting ? t("recording_payment") : t("record_payment")}
        </Button>
        {!payerId && (
          <p className="text-yellow-600 text-sm mt-2">
            {t("user_not_linked")}
          </p>
        )}
      </div>
    </form>
  );
} 