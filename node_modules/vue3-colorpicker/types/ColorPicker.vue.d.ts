import { ExtractPropTypes, PropType } from "vue";
import tinycolor from "tinycolor2";
import { Color, ColorFormat } from "./utils/color";
import { type Lang } from "./lang";
declare const colorPickerProps: {
    isWidget: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    pickerType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    shape: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    pureColor: {
        type: PropType<tinycolor.ColorInputWithoutInstance>;
        default: string;
    };
    gradientColor: import("vue-types").VueTypeValidableDef<string> & {
        default: string;
    } & {
        default: string;
    };
    format: {
        type: PropType<ColorFormat>;
        default: string;
    };
    disableAlpha: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    disableHistory: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    roundHistory: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    useType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    activeKey: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    lang: {
        type: PropType<Lang>;
        default: string;
    };
    zIndex: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    pickerContainer: {
        type: (StringConstructor | {
            new (): HTMLElement;
            prototype: HTMLElement;
        })[];
        default: string;
    };
    debounce: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    theme: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    blurClose: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    defaultPopup: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
};
declare type ColorPickerProps = Partial<ExtractPropTypes<typeof colorPickerProps>>;
export { ColorPickerProps };
declare const _default: import("vue").DefineComponent<{
    isWidget: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    pickerType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    shape: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    pureColor: {
        type: PropType<tinycolor.ColorInputWithoutInstance>;
        default: string;
    };
    gradientColor: import("vue-types").VueTypeValidableDef<string> & {
        default: string;
    } & {
        default: string;
    };
    format: {
        type: PropType<ColorFormat>;
        default: string;
    };
    disableAlpha: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    disableHistory: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    roundHistory: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    useType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    activeKey: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    lang: {
        type: PropType<Lang>;
        default: string;
    };
    zIndex: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    pickerContainer: {
        type: (StringConstructor | {
            new (): HTMLElement;
            prototype: HTMLElement;
        })[];
        default: string;
    };
    debounce: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    theme: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    blurClose: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    defaultPopup: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
}, {
    colorCubeRef: import("vue").Ref<HTMLElement | null>;
    pickerRef: import("vue").Ref<HTMLElement | null>;
    showPicker: import("vue").Ref<boolean>;
    colorInstance: import("vue").Ref<{
        toString: (format?: ColorFormat | undefined) => string;
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
    }>;
    getBgColorStyle: import("vue").ComputedRef<{
        background: string;
    }>;
    getComponentName: import("vue").ComputedRef<string>;
    getBindArgs: import("vue").ComputedRef<{
        startColor: {
            toString: (format?: ColorFormat | undefined) => string;
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
        };
        endColor: {
            toString: (format?: ColorFormat | undefined) => string;
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
        };
        angle: number;
        type: string;
        startColorStop: number;
        endColorStop: number;
        onStartColorChange: (v: Color) => void;
        onEndColorChange: (v: Color) => void;
        onStartColorStopChange: (v: number) => void;
        onEndColorStopChange: (v: number) => void;
        onAngleChange: (v: number) => void;
        onTypeChange: (type: string) => void;
        onAdvanceChange: (isAdvance: boolean) => void;
        disableAlpha: boolean;
        disableHistory: boolean;
        roundHistory: boolean;
        pickerType: string;
    } | {
        disableAlpha: boolean;
        disableHistory: boolean;
        roundHistory: boolean;
        color: {
            toString: (format?: ColorFormat | undefined) => string;
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
        };
        onChange: (v: Color) => void;
        onAdvanceChange: (isAdvance: boolean) => void;
        pickerType: string;
    }>;
    state: {
        pureColor: string | {
            r: string;
            g: string;
            b: string;
        } | {
            r: string;
            g: string;
            b: string;
            a: number;
        } | {
            r: number;
            g: number;
            b: number;
        } | {
            r: number;
            g: number;
            b: number;
            a: number;
        } | {
            h: number;
            s: number;
            l: number;
        } | {
            h: number;
            s: number;
            l: number;
            a: number;
        } | {
            h: number;
            s: number;
            v: number;
        } | {
            a: number;
            h: number;
            s: number;
            v: number;
        };
        activeKey: string;
        isAdvanceMode: boolean;
    };
    hasExtra: boolean;
    onColorChange: (v: Color) => void;
    onShowPicker: () => void;
    onActiveKeyChange: (key: string) => void;
    onAutoClose: import("@vueuse/shared").PromisifyFn<() => void>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:activeKey" | "update:pureColor" | "pureColorChange" | "update:gradientColor" | "gradientColorChange" | "activeKeyChange")[], "update:activeKey" | "update:pureColor" | "pureColorChange" | "update:gradientColor" | "gradientColorChange" | "activeKeyChange", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<ExtractPropTypes<{
    isWidget: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    pickerType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    shape: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    pureColor: {
        type: PropType<tinycolor.ColorInputWithoutInstance>;
        default: string;
    };
    gradientColor: import("vue-types").VueTypeValidableDef<string> & {
        default: string;
    } & {
        default: string;
    };
    format: {
        type: PropType<ColorFormat>;
        default: string;
    };
    disableAlpha: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    disableHistory: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    roundHistory: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    useType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    activeKey: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    lang: {
        type: PropType<Lang>;
        default: string;
    };
    zIndex: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    pickerContainer: {
        type: (StringConstructor | {
            new (): HTMLElement;
            prototype: HTMLElement;
        })[];
        default: string;
    };
    debounce: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    theme: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    blurClose: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    defaultPopup: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
}>> & {
    "onUpdate:activeKey"?: ((...args: any[]) => any) | undefined;
    onActiveKeyChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:pureColor"?: ((...args: any[]) => any) | undefined;
    onPureColorChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:gradientColor"?: ((...args: any[]) => any) | undefined;
    onGradientColorChange?: ((...args: any[]) => any) | undefined;
}, {
    isWidget: boolean;
    pickerType: string;
    shape: string;
    pureColor: tinycolor.ColorInputWithoutInstance;
    gradientColor: string;
    format: ColorFormat;
    disableAlpha: boolean;
    disableHistory: boolean;
    roundHistory: boolean;
    useType: string;
    activeKey: string;
    lang: Lang;
    zIndex: number;
    pickerContainer: string | HTMLElement;
    debounce: number;
    theme: string;
    blurClose: boolean;
    defaultPopup: boolean;
}, {}>;
export default _default;
