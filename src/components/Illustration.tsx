import Image from "next/image";

export function Illustration({
  name,
  size = 40,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/illustrations/${name}.svg`}
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
