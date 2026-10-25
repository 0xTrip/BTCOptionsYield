import { VAULT } from "@/config";

type Health = "safe" | "near" | "unsafe";

const health = (r: number): Health => (r >= 2.5 ? "safe" : r >= VAULT.minRatio ? "near" : "unsafe");

/** Text colour for a collateral ratio: comfortable, close to the minimum, or below it */
export const healthTone = (r: number) => ({ safe: "text-up", near: "text-warn", unsafe: "text-down" })[health(r)];
export const healthBg = (r: number) => ({ safe: "bg-up", near: "bg-warn", unsafe: "bg-down" })[health(r)];
