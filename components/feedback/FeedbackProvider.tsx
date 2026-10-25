import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Modal, Platform, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { enterAnimation, exitAnimation } from '@/lib/design/motion';

import { Button } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type FeedbackTone = 'info' | 'success' | 'warning' | 'danger';
type ToastAction = { label: string; onPress: () => void };
type ToastRecord = { id: number; message: string; action?: ToastAction; tone: FeedbackTone };
type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type FeedbackContextValue = {
  toast: (options: { message: string; action?: ToastAction; tone?: FeedbackTone; duration?: number }) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: (options: { title: string; message: string; tone?: FeedbackTone }) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ action, duration, message, tone = 'info' }: { message: string; action?: ToastAction; tone?: FeedbackTone; duration?: number }) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { action, id, message, tone }]);
      const timeout = duration ?? (action ? 6000 : 3500);
      setTimeout(() => dismiss(id), timeout);
    },
    [dismiss]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      return Promise.resolve(globalThis.confirm(`${options.title}\n\n${options.message}`));
    }
    setConfirmation(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const resolveConfirmation = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setConfirmation(null);
  }, []);

  const notify = useCallback(
    ({ message, title, tone = 'info' }: { title: string; message: string; tone?: FeedbackTone }) => {
      toast({ message: `${title}: ${message}`, tone });
    },
    [toast]
  );

  return (
    <FeedbackContext.Provider value={{ confirm, notify, toast }}>
      {children}
      <View className="pointer-events-none absolute inset-x-0 bottom-0 z-50 items-center gap-2 p-4">
        {toasts.map((item) => (
          <Animated.View
            entering={enterAnimation()}
            exiting={exitAnimation()}
            key={item.id}
            className={`pointer-events-auto w-full max-w-md rounded-xl border border-border-strong bg-surface-raised p-3 shadow-lg`}>
            <View className="flex-row items-center justify-between gap-3">
              <Text variant="body-sm" tone={item.tone === 'danger' ? 'danger-ink' : 'text'}>{item.message}</Text>
              {item.action && <Pressable onPress={item.action.onPress}><Text variant="caption" tone="primary">{item.action.label}</Text></Pressable>}
            </View>
          </Animated.View>
        ))}
      </View>
      <Modal animationType="none" transparent visible={Boolean(confirmation)} onRequestClose={() => resolveConfirmation(false)}>
        {confirmation && (
          <View className="flex-1 items-center justify-center bg-black/50 p-5">
            <Animated.View entering={enterAnimation()} className="w-full max-w-md gap-3 rounded-xl bg-surface-raised p-5 shadow-xl">
              <Text variant="title">{confirmation.title}</Text>
              <Text variant="body" tone="muted">{confirmation.message}</Text>
              <View className="flex-row justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onPress={() => resolveConfirmation(false)}>
                  <Text>{confirmation.cancelLabel ?? 'Cancel'}</Text>
                </Button>
                <Button variant={confirmation.destructive ? 'danger' : 'primary'} size="sm" onPress={() => resolveConfirmation(true)}>
                  <Text>{confirmation.confirmLabel ?? 'Confirm'}</Text>
                </Button>
              </View>
            </Animated.View>
          </View>
        )}
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error('useFeedback must be used inside FeedbackProvider');
  return value;
}
