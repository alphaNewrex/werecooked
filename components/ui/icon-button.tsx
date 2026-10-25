import { X } from 'lucide-react-native';

import { Icon, type IconProps } from './icon';
import { Pressable, type PressableProps } from './pressable';

export type IconButtonProps = Omit<PressableProps, 'children'> &
  Omit<IconProps, 'accessibilityLabel'> & {
    accessibilityLabel: string;
  };

export function IconButton({ accessibilityLabel, ...props }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="items-center justify-center rounded-full p-2"
      {...props}>
      <Icon accessibilityLabel={accessibilityLabel} icon={props.icon} size={props.size} strokeWidth={props.strokeWidth} tone={props.tone} />
    </Pressable>
  );
}

export function CloseButton(props: Omit<IconButtonProps, 'icon'>) {
  return <IconButton icon={X} {...props} />;
}
