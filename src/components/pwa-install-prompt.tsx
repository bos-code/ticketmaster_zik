import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return true;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    if (isStandaloneMode()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    setIsVisible(false);
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    setInstallPrompt(null);
  };

  if (!isVisible || !installPrompt) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-6 z-[2000] items-center px-4"
    >
      <View className="w-full max-w-[390px] flex-row items-center gap-3 rounded-[8px] bg-[#111111] px-4 py-3 shadow-lg">
        <View className="flex-1">
          <Text className="text-[14px] font-bold leading-[17px] text-white">
            Install Tickets
          </Text>
          <Text className="mt-1 text-[12px] font-medium leading-[15px] text-[rgba(255,255,255,0.72)]">
            Add it to your home screen for quick access.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="h-9 items-center justify-center rounded-[7px] bg-white px-4"
          onPress={handleInstall}
        >
          <Text className="text-[13px] font-bold text-[#111111]">Install</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="h-9 items-center justify-center px-1"
          onPress={() => setIsVisible(false)}
        >
          <Text className="text-[13px] font-bold text-[rgba(255,255,255,0.78)]">
            Later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
