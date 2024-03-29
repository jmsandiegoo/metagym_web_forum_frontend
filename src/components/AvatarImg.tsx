import { Avatar } from "@mui/material";

interface AvatarProps {
  fallbackName: string;
  width?: number | string;
  height?: number | string;
  src?: string;
}

const AvatarImg = ({ fallbackName, width, height, src }: AvatarProps) => {
  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name: string) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }

  return (
    <Avatar
      {...(src ? { alt: fallbackName, src } : stringAvatar(fallbackName))}
      sx={{
        ...(width && { width }),
        ...(height && { height }),
      }}
    />
  );
};

export default AvatarImg;
