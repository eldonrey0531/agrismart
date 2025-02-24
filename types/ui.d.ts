declare module "@radix-ui/react-toast" {
  import * as React from "react";

  interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    duration?: number;
  }

  interface ToastProviderProps {
    children?: React.ReactNode;
    swipeDirection?: "right" | "left" | "up" | "down";
    duration?: number;
  }

  interface ToastViewportProps extends React.HTMLAttributes<HTMLOListElement> {
    label?: string;
  }

  interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
  interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}
  interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
  interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

  export const Provider: React.FC<ToastProviderProps>;
  export const Viewport: React.ForwardRefExoticComponent<ToastViewportProps>;
  export const Root: React.ForwardRefExoticComponent<ToastProps>;
  export const Title: React.ForwardRefExoticComponent<ToastTitleProps>;
  export const Description: React.ForwardRefExoticComponent<ToastDescriptionProps>;
  export const Action: React.ForwardRefExoticComponent<ToastActionProps>;
  export const Close: React.ForwardRefExoticComponent<ToastCloseProps>;
}