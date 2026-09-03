import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";

/** Loads the Inter weights the Nocturne system uses (body 400, heading 500, emphasis 600). */
export function useInterFonts(): boolean {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  return loaded;
}
