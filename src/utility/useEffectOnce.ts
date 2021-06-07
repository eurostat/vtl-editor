import { useEffect } from "react";

export const useEffectOnce = (method: () => void) => useEffect(method, [])