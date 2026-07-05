import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botón "que se aplasta como vinilo": sombra dura desplazada; en :hover se
 * levanta y en :active cae sobre la sombra y la anula. Base del sistema.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-full border-3 border-tinta font-alt font-extrabold text-tinta no-underline cursor-pointer select-none " +
    "shadow-hard transition-[transform,box-shadow] duration-100 ease-out " +
    "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-hover " +
    "active:translate-x-1 active:translate-y-1 active:scale-[.96] active:shadow-none " +
    "focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-[3px] focus-visible:outline-azul " +
    "[-webkit-tap-highlight-color:transparent] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        amarillo: "bg-amarillo text-tinta",
        rojo: "bg-rojo text-white",
        verde: "bg-verde text-white",
        azul: "bg-azul text-white",
        blanco: "bg-white text-tinta",
        peligro: "bg-white text-rojo",
      },
      size: {
        default: "px-[26px] py-3.5 text-[1.02rem]",
        chico: "px-[18px] py-2.5 text-[.92rem] shadow-hard-sm",
        full: "w-full px-[26px] py-3.5 text-[1.1rem]",
        mini: "px-3 py-1.5 text-[.82rem] shadow-hard-sm",
      },
    },
    defaultVariants: {
      variant: "amarillo",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renderiza como el hijo (p. ej. un <a>) manteniendo los estilos. */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
