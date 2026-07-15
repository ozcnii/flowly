import { forwardRef, type InputHTMLAttributes, type Ref, type TextareaHTMLAttributes } from "react";
import { cx } from "./utils";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; multiline?: false };
export type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; multiline: true };

export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps | TextAreaFieldProps>(function TextField({ label, multiline, className, ...props }, ref) {
  return <label className={cx("fl-field", className)}><span>{label}</span>{multiline ? <textarea ref={ref as Ref<HTMLTextAreaElement>} {...props as TextareaHTMLAttributes<HTMLTextAreaElement>} /> : <input ref={ref as Ref<HTMLInputElement>} {...props as InputHTMLAttributes<HTMLInputElement>} />}</label>;
});
