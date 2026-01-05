import { ComputedRef } from "vue";
export declare type SupportLang = "ZH-cn" | "En";
export interface ColorPickerProvider {
    lang: ComputedRef<{
        [key: string]: string;
    }>;
}
export declare const ColorPickerProviderKey = "Vue3ColorPickerProvider";
