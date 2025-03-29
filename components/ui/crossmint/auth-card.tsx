"use client";
import { usePhantom } from "@/components/providers/phantom";
import { Card, CardContent } from "../card";
import { useCrossmint } from "@/components/providers/crossmint";

interface AuthenticatedCardProps
  extends React.ComponentProps<typeof CardContent> {
  children: React.ReactNode;
  loadingClassName?: string;
}

export function AuthenticatedCard({
  children,
  className,
  loadingClassName,
  ...props
}: AuthenticatedCardProps) {
  const { wallet } = useCrossmint();
  const { connected } = usePhantom();

  if (!connected || !wallet) {
    return null;
  }

  return (
    <Card className={className} {...props}>
      {children}
    </Card>
  );
}
