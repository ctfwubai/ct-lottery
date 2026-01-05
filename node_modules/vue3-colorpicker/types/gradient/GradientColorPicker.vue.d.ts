import { Color } from "../utils/color";
declare const _default: import("vue").DefineComponent<{
    startColor: import("vue-types").VueTypeDef<Color> & {
        required: true;
    };
    endColor: import("vue-types").VueTypeDef<Color> & {
        required: true;
    };
    startColorStop: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    endColorStop: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    angle: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    type: import("vue-types").VueTypeDef<string> & {
        default: string;
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
    disableAlpha: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    pickerType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
}, {
    startGradientRef: import("vue").Ref<HTMLElement | undefined>;
    stopGradientRef: import("vue").Ref<HTMLElement | undefined>;
    colorRangeRef: import("vue").Ref<HTMLElement | undefined>;
    state: {
        startActive: boolean;
        startColor: {
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
        };
        endColor: {
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
        };
        startColorStop: number;
        endColorStop: number;
        angle: number;
        type: string;
        startColorRgba: string;
        endColorRgba: string;
    };
    currentColor: any;
    getStartColorLeft: import("vue").ComputedRef<number>;
    getEndColorLeft: import("vue").ComputedRef<number>;
    gradientBg: import("vue").ComputedRef<string>;
    advancePanelShow: import("vue").Ref<boolean>;
    onDegreeBlur: (evt: FocusEvent) => void;
    onCompactChange: (color: string) => void;
    onAlphaChange: (alpha: number) => void;
    onHueChange: (hue: number) => void;
    onBoardChange: (saturation: number, brightness: number) => void;
    onLightChange: (light: number) => void;
    historyColors: import("@vueuse/shared").RemovableRef<string[]>;
    onBack: () => void;
    onDegreeChange: (angle: number) => void;
    onDisplayChange: () => void;
    onTypeChange: () => void;
    lang: import("vue").ComputedRef<{
        [key: string]: string;
    }> | undefined;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("advanceChange" | "update:angle" | "update:startColor" | "update:endColor" | "update:startColorStop" | "update:endColorStop" | "startColorChange" | "endColorChange" | "angleChange" | "startColorStopChange" | "endColorStopChange" | "typeChange")[], "advanceChange" | "update:angle" | "update:startColor" | "update:endColor" | "update:startColorStop" | "update:endColorStop" | "startColorChange" | "endColorChange" | "angleChange" | "startColorStopChange" | "endColorStopChange" | "typeChange", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    startColor: import("vue-types").VueTypeDef<Color> & {
        required: true;
    };
    endColor: import("vue-types").VueTypeDef<Color> & {
        required: true;
    };
    startColorStop: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    endColorStop: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    angle: import("vue-types").VueTypeValidableDef<number> & {
        default: number;
    } & {
        default: number;
    };
    type: import("vue-types").VueTypeDef<string> & {
        default: string;
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
    disableAlpha: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    pickerType: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
}>> & {
    onAdvanceChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:angle"?: ((...args: any[]) => any) | undefined;
    "onUpdate:startColor"?: ((...args: any[]) => any) | undefined;
    "onUpdate:endColor"?: ((...args: any[]) => any) | undefined;
    "onUpdate:startColorStop"?: ((...args: any[]) => any) | undefined;
    "onUpdate:endColorStop"?: ((...args: any[]) => any) | undefined;
    onStartColorChange?: ((...args: any[]) => any) | undefined;
    onEndColorChange?: ((...args: any[]) => any) | undefined;
    onAngleChange?: ((...args: any[]) => any) | undefined;
    onStartColorStopChange?: ((...args: any[]) => any) | undefined;
    onEndColorStopChange?: ((...args: any[]) => any) | undefined;
    onTypeChange?: ((...args: any[]) => any) | undefined;
}, {
    pickerType: string;
    disableAlpha: boolean;
    disableHistory: boolean;
    roundHistory: boolean;
    type: string;
    angle: number;
    startColorStop: number;
    endColorStop: number;
}, {}>;
export default _default;
