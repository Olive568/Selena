import Image from "next/image";

import iconUrl from "@/app/icon.png";
import { cn } from "@/lib/utils";

type SelenaIconProps = {
  className?: string;
};

export function SelenaIcon({ className }: SelenaIconProps) {
  return (
    <Image
      src={iconUrl}
      alt=""
      width={512}
      height={512}
      className={cn("object-cover", className)}
    />
  );
}