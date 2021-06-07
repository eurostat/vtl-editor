import { RootState } from "./store";

export const routerPath = (state: RootState) => state.router.location.pathname;