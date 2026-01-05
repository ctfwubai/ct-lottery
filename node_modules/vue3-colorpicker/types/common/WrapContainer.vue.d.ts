declare const _default: import("vue").DefineComponent<{
    theme: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    showTab: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    activeKey: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
}, {
    state: {
        activeKey: string;
    };
    onActiveKeyChange: (key: string) => void;
    lang: import("vue").ComputedRef<{
        [key: string]: string;
    }> | undefined;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("change" | "update:activeKey")[], "change" | "update:activeKey", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    theme: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
    showTab: import("vue-types").VueTypeValidableDef<boolean> & {
        default: boolean;
    } & {
        default: boolean;
    };
    activeKey: import("vue-types").VueTypeDef<string> & {
        default: string;
    };
}>> & {
    onChange?: ((...args: any[]) => any) | undefined;
    "onUpdate:activeKey"?: ((...args: any[]) => any) | undefined;
}, {
    activeKey: string;
    theme: string;
    showTab: boolean;
}, {}>;
export default _default;
