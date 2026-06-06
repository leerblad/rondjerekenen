import Image from "next/image";

function getAvatarId(glbUrl: string): string {
  // https://models.readyplayer.me/ABC123.glb → ABC123
  return glbUrl.split("/").pop()?.replace(".glb", "") ?? "";
}

export function getRPMAvatarImageUrl(glbUrl: string, width = 512): string {
  const id = getAvatarId(glbUrl);
  return `https://models.readyplayer.me/${id}.png?scene=fullbody-portrait-v1-transparent&background=false&w=${width}`;
}

export default function RPMAvatar({
  avatarUrl,
  size = 120,
  className = "",
}: {
  avatarUrl: string;
  size?: number;
  className?: string;
}) {
  const imgSrc = getRPMAvatarImageUrl(avatarUrl, size * 2);
  return (
    <Image
      src={imgSrc}
      alt="Avatar"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      unoptimized // external URL, skip Next.js image optimization
    />
  );
}
