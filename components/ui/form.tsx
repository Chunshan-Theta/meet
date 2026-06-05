import { FormHTMLAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Form({ className, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return <form className={cn("space-y-4", className)} {...props} />;
}

export function FormItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function FormLabel({ className, ...props }: HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium", className)} {...props} />;
}

export function FormInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("w-full rounded-md border border-slate-200 px-3 py-2 text-sm", className)} {...props} />;
}

export function FormTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-md border border-slate-200 px-3 py-2 text-sm", className)} {...props} />;
}
