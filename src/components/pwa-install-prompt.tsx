import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

export function PwaInstallPrompt({ isStartupFinished }: { isStartupFinished?: boolean }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 50 + insets.bottom;
  const PROMPT_BOTTOM_GAP = 12;

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    // Check if it's iOS (including modern iPad in desktop mode)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);
    
    setIsIOS(isIOSDevice);

    if (isStandaloneMode()) {
      return;
    }

    // For iOS, we show the prompt after startup and a short delay
    if (isIOSDevice && isStartupFinished) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // For Android/Chrome, we listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      
      // Only show if startup is already finished, otherwise we'll show it when it finishes
      if (isStartupFinished) {
        setIsVisible(true);
      }
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
  }, [isStartupFinished]);

  // Secondary effect to show the non-iOS prompt if it was received during splash
  useEffect(() => {
    if (isStartupFinished && installPrompt && !isIOS) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isStartupFinished, installPrompt, isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS doesn't have a programmatic prompt, instructions are in the text
      setIsVisible(false);
      return;
    }

    if (!installPrompt) {
      return;
    }

    setIsVisible(false);
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    setInstallPrompt(null);
  };

  if (!isVisible || (!installPrompt && !isIOS)) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 z-[2000] items-center px-4"
      style={{ bottom: TAB_BAR_HEIGHT + PROMPT_BOTTOM_GAP }}
    >
      <View className="w-full max-w-[390px] flex-row items-center gap-3 rounded-[16px] bg-[#111111] px-4 py-3.5 shadow-2xl border border-white/10">
        <View className="flex-1">
          <Text className="text-[14px] font-bold leading-[17px] text-white">
            Install Tickets
          </Text>
          <Text className="mt-1 text-[12px] font-medium leading-[16px] text-[rgba(255,255,255,0.7)]">
            {isIOS 
              ? "Tap the share button and 'Add to Home Screen'."
              : "Add to home screen for the best experience."}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="h-10 items-center justify-center rounded-[10px] bg-white px-4 active:opacity-80"
          onPress={handleInstall}
        >
          <Text className="text-[13px] font-bold text-[#111111]">
            {isIOS ? "Got it" : "Install"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="h-10 items-center justify-center px-2 ml-1"
          onPress={() => setIsVisible(false)}
        >
          <Text className="text-[13px] font-medium text-[rgba(255,255,255,0.4)]">
            Later
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

