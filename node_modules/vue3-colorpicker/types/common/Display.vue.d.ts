import { Color } from "../utils/color";
declare const _default: import("vue").DefineComponent<{
    color: import("vue-types").VueTypeDef<Color>;
    disableAlpha: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
}, {
    state: {
        color: {
            toString: (format?: import("../utils/color").ColorFormat | undefined) => string;
            toHexString: () => string;
            toRgbString: () => string;
            hex: string;
            hue: number;
            saturation: number;
            brightness: number;
            lightness: number;
            red: number;
            green: number;
            blue: number;
            alpha: number;
            readonly RGB: number[];
            readonly HSB: number[];
            readonly HSL: number[];
        } | undefined;
        hex: string | undefined;
        alpha: number;
        rgba: number[] | undefined;
        previewBgColor: string | undefined;
    };
    getBgColorStyle: import("vue").ComputedRef<{
        background: string | undefined;
    }>;
    inputType: import("vue").Ref<"hex" | "rgba">;
    copied: import("vue").ComputedRef<boolean>;
    onInputTypeChange: () => void;
    onAlphaBlur: import("@vueuse/shared").PromisifyFn<(event: any) => void>;
    onInputChange: import("@vueuse/shared").PromisifyFn<(event: any, key?: number | undefined) => void>;
    onBlurChange: import("@vueuse/shared").PromisifyFn<(event: any, key?: number | undefined) => void>;
    onCopyColorStr: () => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:color" | "change")[], "update:color" | "change", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    color: import("vue-types").VueTypeDef<Color>;
    disableAlpha: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
}>> & {
    "onUpdate:color"?: ((...args: any[]) => any) | undefined;
    onChange?: ((...args: any[]) => any) | undefined;
}, {
    disableAlpha: boolean;
}, {}>;
export default _default;
