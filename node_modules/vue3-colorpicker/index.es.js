var qe = Object.defineProperty;
var Ye = (e, t, o) => t in e ? qe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[t] = o;
var W = (e, t, o) => (Ye(e, typeof t != "symbol" ? t + "" : t, o), o);
import { defineComponent as G, ref as M, reactive as Y, watch as x, computed as K, openBlock as C, createElementBlock as $, normalizeClass as O, createElementVNode as u, normalizeStyle as D, pushScopeId as ee, popScopeId as te, Fragment as Q, renderList as ne, getCurrentInstance as Ue, nextTick as je, createCommentVNode as B, withDirectives as le, vModelText as Ze, createTextVNode as Ee, toDisplayString as se, resolveComponent as V, createBlock as I, createVNode as Z, onMounted as Je, inject as Ie, vShow as ge, renderSlot as he, provide as Qe, useSlots as xe, withCtx as Be, resolveDynamicComponent as He, mergeProps as Re, Teleport as et } from "vue";
import { tryOnMounted as oe, whenever as T, useClipboard as tt, useDebounceFn as j, useLocalStorage as pe, onClickOutside as ot } from "@vueuse/core";
import R from "tinycolor2";
import { stringify as nt, parse as at } from "gradient-parser";
import { createPopper as rt } from "@popperjs/core";
import v from "vue-types";
import { DOMUtils as ae } from "@aesoper/normal-utils";
import { merge as ie } from "lodash-es";
const P = (e) => Math.round(e * 100) / 100;
class A {
  constructor(t) {
    W(this, "instance");
    W(this, "alphaValue", 0);
    // RGB
    W(this, "redValue", 0);
    W(this, "greenValue", 0);
    W(this, "blueValue", 0);
    // HSV
    W(this, "hueValue", 0);
    W(this, "saturationValue", 0);
    W(this, "brightnessValue", 0);
    // HSL
    W(this, "hslSaturationValue", 0);
    W(this, "lightnessValue", 0);
    W(this, "initAlpha", () => {
      const t = this.instance.getAlpha();
      this.alphaValue = Math.min(1, t) * 100;
    });
    W(this, "initLightness", () => {
      const { s: t, l: o } = this.instance.toHsl();
      this.hslSaturationValue = P(t), this.lightnessValue = P(o);
    });
    W(this, "initRgb", () => {
      const { r: t, g: o, b: n } = this.instance.toRgb();
      this.redValue = P(t), this.greenValue = P(o), this.blueValue = P(n);
    });
    W(this, "initHsb", () => {
      const { h: t, s: o, v: n } = this.instance.toHsv();
      this.hueValue = Math.min(360, Math.ceil(t)), this.saturationValue = P(o), this.brightnessValue = P(n);
    });
    W(this, "toHexString", () => this.instance.toHexString());
    W(this, "toRgbString", () => this.instance.toRgbString());
    this.instance = R(t), this.initRgb(), this.initHsb(), this.initLightness(), this.initAlpha();
  }
  toString(t) {
    return this.instance.toString(t);
  }
  get hex() {
    return this.instance.toHex();
  }
  set hex(t) {
    this.instance = R(t), this.initHsb(), this.initRgb(), this.initAlpha(), this.initLightness();
  }
  // 色调
  set hue(t) {
    this.saturation === 0 && this.brightness === 0 && (this.saturationValue = 1, this.brightnessValue = 1), this.instance = R({
      h: P(t),
      s: this.saturation,
      v: this.brightness,
      a: this.alphaValue / 100
    }), this.initRgb(), this.initLightness(), this.hueValue = P(t);
  }
  get hue() {
    return this.hueValue;
  }
  // 饱和度
  set saturation(t) {
    this.instance = R({
      h: this.hue,
      s: P(t),
      v: this.brightness,
      a: this.alphaValue / 100
    }), this.initRgb(), this.initLightness(), this.saturationValue = P(t);
  }
  get saturation() {
    return this.saturationValue;
  }
  // 明度
  set brightness(t) {
    this.instance = R({
      h: this.hue,
      s: this.saturation,
      v: P(t),
      a: this.alphaValue / 100
    }), this.initRgb(), this.initLightness(), this.brightnessValue = P(t);
  }
  get brightness() {
    return this.brightnessValue;
  }
  // 亮度
  set lightness(t) {
    this.instance = R({
      h: this.hue,
      s: this.hslSaturationValue,
      l: P(t),
      a: this.alphaValue / 100
    }), this.initRgb(), this.initHsb(), this.lightnessValue = P(t);
  }
  get lightness() {
    return this.lightnessValue;
  }
  // red
  set red(t) {
    const o = this.instance.toRgb();
    this.instance = R({
      ...o,
      r: P(t),
      a: this.alphaValue / 100
    }), this.initHsb(), this.initLightness(), this.redValue = P(t);
  }
  get red() {
    return this.redValue;
  }
  // green
  set green(t) {
    const o = this.instance.toRgb();
    this.instance = R({
      ...o,
      g: P(t),
      a: this.alphaValue / 100
    }), this.initHsb(), this.initLightness(), this.greenValue = P(t);
  }
  get green() {
    return this.greenValue;
  }
  // blue
  set blue(t) {
    const o = this.instance.toRgb();
    this.instance = R({
      ...o,
      b: P(t),
      a: this.alphaValue / 100
    }), this.initHsb(), this.initLightness(), this.blueValue = P(t);
  }
  get blue() {
    return this.blueValue;
  }
  // alpha
  set alpha(t) {
    this.instance.setAlpha(t / 100), this.alphaValue = t;
  }
  get alpha() {
    return this.alphaValue;
  }
  get RGB() {
    return [this.red, this.green, this.blue, parseFloat((this.alpha / 100).toFixed(2))];
  }
  get HSB() {
    return [this.hue, this.saturation, this.brightness, parseFloat((this.alpha / 100).toFixed(2))];
  }
  get HSL() {
    return [
      this.hue,
      this.hslSaturationValue,
      this.lightness,
      parseFloat((this.alpha / 100).toFixed(2))
    ];
  }
}
function Ae(e, t, o, n) {
  return `rgba(${[e, t, o, n / 100].join(",")})`;
}
const ue = (e, t, o) => t < o ? e < t ? t : e > o ? o : e : e < o ? o : e > t ? t : e, fe = "color-history", Ce = 8;
const q = (e, t) => {
  const o = e.__vccOpts || e;
  for (const [n, i] of t)
    o[n] = i;
  return o;
}, lt = G({
  name: "Alpha",
  props: {
    color: v.instanceOf(A),
    size: v.oneOf(["small", "default"]).def("default")
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const o = M(null), n = M(null);
    let i = e.color || new A();
    const l = Y({
      red: i.red,
      green: i.green,
      blue: i.blue,
      alpha: i.alpha
    });
    x(
      () => e.color,
      (g) => {
        g && (i = g, ie(l, {
          red: g.red,
          green: g.green,
          blue: g.blue,
          alpha: g.alpha
        }));
      },
      { deep: !0 }
    );
    const a = K(() => {
      const g = Ae(l.red, l.green, l.blue, 0), d = Ae(l.red, l.green, l.blue, 100);
      return {
        background: `linear-gradient(to right, ${g} , ${d})`
      };
    }), r = () => {
      if (o.value && n.value) {
        const g = l.alpha / 100, d = o.value.getBoundingClientRect(), m = n.value.offsetWidth;
        return Math.round(g * (d.width - m) + m / 2);
      }
      return 0;
    }, c = K(() => ({
      left: r() + "px",
      top: 0
    })), k = (g) => {
      g.target !== o.value && p(g);
    }, p = (g) => {
      if (g.stopPropagation(), o.value && n.value) {
        const d = o.value.getBoundingClientRect(), m = n.value.offsetWidth;
        let b = g.clientX - d.left;
        b = Math.max(m / 2, b), b = Math.min(b, d.width - m / 2);
        const h = Math.round((b - m / 2) / (d.width - m) * 100);
        i.alpha = h, l.alpha = h, t("change", h);
      }
    };
    return oe(() => {
      const g = {
        drag: (d) => {
          p(d);
        },
        end: (d) => {
          p(d);
        }
      };
      o.value && n.value && ae.triggerDragEvent(o.value, g);
    }), { barElement: o, cursorElement: n, getCursorStyle: c, getBackgroundStyle: a, onClickSider: k };
  }
}), st = (e) => (ee("data-v-18925ba6"), e = e(), te(), e), it = /* @__PURE__ */ st(() => /* @__PURE__ */ u("div", { class: "vc-alpha-slider__bar-handle" }, null, -1)), ct = [
  it
];
function ut(e, t, o, n, i, l) {
  return C(), $("div", {
    class: O(["vc-alpha-slider", "transparent", { "small-slider": e.size === "small" }])
  }, [
    u("div", {
      ref: "barElement",
      class: "vc-alpha-slider__bar",
      style: D(e.getBackgroundStyle),
      onClick: t[0] || (t[0] = (...a) => e.onClickSider && e.onClickSider(...a))
    }, [
      u("div", {
        class: O(["vc-alpha-slider__bar-pointer", { "small-bar": e.size === "small" }]),
        ref: "cursorElement",
        style: D(e.getCursorStyle)
      }, ct, 6)
    ], 4)
  ], 2);
}
const ve = /* @__PURE__ */ q(lt, [["render", ut], ["__scopeId", "data-v-18925ba6"]]);
const dt = [
  // 第一行
  [
    "#fcc02e",
    "#f67c01",
    "#e64a19",
    "#d81b43",
    "#8e24aa",
    "#512da7",
    "#1f87e8",
    "#008781",
    "#05a045"
  ],
  // 第二行
  [
    "#fed835",
    "#fb8c00",
    "#f5511e",
    "#eb1d4e",
    "#9c28b1",
    "#5d35b0",
    "#2097f3",
    "#029688",
    "#4cb050"
  ],
  // 第三行
  [
    "#ffeb3c",
    "#ffa727",
    "#fe5722",
    "#eb4165",
    "#aa47bc",
    "#673bb7",
    "#42a5f6",
    "#26a59a",
    "#83c683"
  ],
  // 第四行
  [
    "#fff176",
    "#ffb74e",
    "#ff8a66",
    "#f1627e",
    "#b968c7",
    "#7986cc",
    "#64b5f6",
    "#80cbc4",
    "#a5d6a7"
  ],
  // 第五行
  [
    "#fff59c",
    "#ffcc80",
    "#ffab91",
    "#fb879e",
    "#cf93d9",
    "#9ea8db",
    "#90caf8",
    "#b2dfdc",
    "#c8e6ca"
  ],
  // 最后一行
  [
    "transparent",
    "#ffffff",
    "#dedede",
    "#a9a9a9",
    "#4b4b4b",
    "#353535",
    "#212121",
    "#000000",
    "advance"
  ]
], gt = G({
  name: "Palette",
  emits: ["change"],
  setup(e, { emit: t }) {
    return { palettes: dt, computedBgStyle: (i) => i === "transparent" ? i : i === "advance" ? {} : { background: R(i).toRgbString() }, onColorChange: (i) => {
      t("change", i);
    } };
  }
}), ht = { class: "vc-compact" }, pt = ["onClick"];
function ft(e, t, o, n, i, l) {
  return C(), $("div", ht, [
    (C(!0), $(Q, null, ne(e.palettes, (a, r) => (C(), $("div", {
      key: r,
      class: "vc-compact__row"
    }, [
      (C(!0), $(Q, null, ne(a, (c, k) => (C(), $("div", {
        key: k,
        class: "vc-compact__color-cube--wrap",
        onClick: (p) => e.onColorChange(c)
      }, [
        u("div", {
          class: O([
            "vc-compact__color_cube",
            {
              advance: c === "advance",
              transparent: c === "transparent"
            }
          ]),
          style: D(e.computedBgStyle(c))
        }, null, 6)
      ], 8, pt))), 128))
    ]))), 128))
  ]);
}
const Ke = /* @__PURE__ */ q(gt, [["render", ft], ["__scopeId", "data-v-b969fd48"]]);
const Ct = G({
  name: "Board",
  props: {
    color: v.instanceOf(A),
    round: v.bool.def(!1),
    hide: v.bool.def(!0)
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    var y, f, w;
    const o = Ue(), n = {
      h: ((y = e.color) == null ? void 0 : y.hue) || 0,
      s: 1,
      v: 1
    }, i = new A(n).toHexString(), l = Y({
      hueColor: i,
      saturation: ((f = e.color) == null ? void 0 : f.saturation) || 0,
      brightness: ((w = e.color) == null ? void 0 : w.brightness) || 0
    }), a = M(0), r = M(0), c = M(), k = K(() => ({
      top: a.value + "px",
      left: r.value + "px"
    })), p = () => {
      if (o) {
        const S = o.vnode.el;
        r.value = l.saturation * (S == null ? void 0 : S.clientWidth), a.value = (1 - l.brightness) * (S == null ? void 0 : S.clientHeight);
      }
    };
    let g = !1;
    const d = (S) => {
      g = !0, h(S);
    }, m = (S) => {
      g && h(S);
    }, b = () => {
      g = !1;
    }, h = (S) => {
      if (o) {
        const F = o.vnode.el, E = F == null ? void 0 : F.getBoundingClientRect();
        let L = S.clientX - E.left, U = S.clientY - E.top;
        L = ue(L, 0, E.width), U = ue(U, 0, E.height);
        const J = L / E.width, X = ue(-(U / E.height) + 1, 0, 1);
        r.value = L, a.value = U, l.saturation = J, l.brightness = X, t("change", J, X);
      }
    };
    return oe(() => {
      o && o.vnode.el && c.value && je(() => {
        p();
      });
    }), T(
      () => e.color,
      (S) => {
        ie(l, {
          hueColor: new A({ h: S.hue, s: 1, v: 1 }).toHexString(),
          saturation: S.saturation,
          brightness: S.brightness
        }), p();
      },
      { deep: !0 }
    ), { state: l, cursorElement: c, getCursorStyle: k, onClickBoard: d, onDrag: m, onDragEnd: b };
  }
}), be = (e) => (ee("data-v-7f0cdcdf"), e = e(), te(), e), vt = /* @__PURE__ */ be(() => /* @__PURE__ */ u("div", { class: "vc-saturation__white" }, null, -1)), bt = /* @__PURE__ */ be(() => /* @__PURE__ */ u("div", { class: "vc-saturation__black" }, null, -1)), yt = /* @__PURE__ */ be(() => /* @__PURE__ */ u("div", null, null, -1)), _t = [
  yt
];
function mt(e, t, o, n, i, l) {
  return C(), $("div", {
    ref: "boardElement",
    class: O(["vc-saturation", { "vc-saturation__chrome": e.round, "vc-saturation__hidden": e.hide }]),
    style: D({ backgroundColor: e.state.hueColor }),
    onMousedown: t[0] || (t[0] = (...a) => e.onClickBoard && e.onClickBoard(...a)),
    onMousemove: t[1] || (t[1] = (...a) => e.onDrag && e.onDrag(...a)),
    onMouseup: t[2] || (t[2] = (...a) => e.onDragEnd && e.onDragEnd(...a))
  }, [
    vt,
    bt,
    u("div", {
      class: "vc-saturation__cursor",
      ref: "cursorElement",
      style: D(e.getCursorStyle)
    }, _t, 4)
  ], 38);
}
const ye = /* @__PURE__ */ q(Ct, [["render", mt], ["__scopeId", "data-v-7f0cdcdf"]]);
const St = G({
  name: "Hue",
  props: {
    color: v.instanceOf(A),
    size: v.oneOf(["small", "default"]).def("default")
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const o = M(null), n = M(null);
    let i = e.color || new A();
    const l = Y({
      hue: i.hue || 0
    });
    x(
      () => e.color,
      (p) => {
        p && (i = p, ie(l, { hue: i.hue }));
      },
      { deep: !0 }
    );
    const a = () => {
      if (o.value && n.value) {
        const p = o.value.getBoundingClientRect(), g = n.value.offsetWidth;
        return l.hue === 360 ? p.width - g / 2 : l.hue % 360 * (p.width - g) / 360 + g / 2;
      }
      return 0;
    }, r = K(() => ({
      left: a() + "px",
      top: 0
    })), c = (p) => {
      p.target !== o.value && k(p);
    }, k = (p) => {
      if (p.stopPropagation(), o.value && n.value) {
        const g = o.value.getBoundingClientRect(), d = n.value.offsetWidth;
        let m = p.clientX - g.left;
        m = Math.min(m, g.width - d / 2), m = Math.max(d / 2, m);
        const b = Math.round((m - d / 2) / (g.width - d) * 360);
        i.hue = b, l.hue = b, t("change", b);
      }
    };
    return oe(() => {
      const p = {
        drag: (g) => {
          k(g);
        },
        end: (g) => {
          k(g);
        }
      };
      o.value && n.value && ae.triggerDragEvent(o.value, p);
    }), { barElement: o, cursorElement: n, getCursorStyle: r, onClickSider: c };
  }
}), kt = (e) => (ee("data-v-e1a08576"), e = e(), te(), e), $t = /* @__PURE__ */ kt(() => /* @__PURE__ */ u("div", { class: "vc-hue-slider__bar-handle" }, null, -1)), wt = [
  $t
];
function Bt(e, t, o, n, i, l) {
  return C(), $("div", {
    class: O(["vc-hue-slider", { "small-slider": e.size === "small" }])
  }, [
    u("div", {
      ref: "barElement",
      class: "vc-hue-slider__bar",
      onClick: t[0] || (t[0] = (...a) => e.onClickSider && e.onClickSider(...a))
    }, [
      u("div", {
        class: O(["vc-hue-slider__bar-pointer", { "small-bar": e.size === "small" }]),
        ref: "cursorElement",
        style: D(e.getCursorStyle)
      }, wt, 6)
    ], 512)
  ], 2);
}
const _e = /* @__PURE__ */ q(St, [["render", Bt], ["__scopeId", "data-v-e1a08576"]]);
const Ht = G({
  name: "Lightness",
  props: {
    color: v.instanceOf(A),
    size: v.oneOf(["small", "default"]).def("default")
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const o = M(null), n = M(null);
    let i = e.color || new A();
    const [l, a, r] = i.HSL, c = Y({
      hue: l,
      saturation: a,
      lightness: r
    });
    x(
      () => e.color,
      (b) => {
        if (b) {
          i = b;
          const [h, y, f] = i.HSL;
          ie(c, {
            hue: h,
            saturation: y,
            lightness: f
          });
        }
      },
      { deep: !0 }
    );
    const k = K(() => {
      const b = R({
        h: c.hue,
        s: c.saturation,
        l: 0.8
      }).toPercentageRgbString(), h = R({
        h: c.hue,
        s: c.saturation,
        l: 0.6
      }).toPercentageRgbString(), y = R({
        h: c.hue,
        s: c.saturation,
        l: 0.4
      }).toPercentageRgbString(), f = R({
        h: c.hue,
        s: c.saturation,
        l: 0.2
      }).toPercentageRgbString();
      return {
        background: [
          `linear-gradient(to right, rgb(255, 255, 255), ${b}, ${h}, ${y}, ${f}, rgb(0, 0, 0))`,
          `-webkit-linear-gradient(left, rgb(255, 255, 255), ${b}, ${h}, ${y}, ${f}, rgb(0, 0, 0))`,
          `-moz-linear-gradient(left, rgb(255, 255, 255), ${b}, ${h}, ${y}, ${f}, rgb(0, 0, 0))`,
          `-ms-linear-gradient(left, rgb(255, 255, 255), ${b}, ${h}, ${y}, ${f}, rgb(0, 0, 0))`
        ]
      };
    }), p = () => {
      if (o.value && n.value) {
        const b = c.lightness, h = o.value.getBoundingClientRect(), y = n.value.offsetWidth;
        return (1 - b) * (h.width - y) + y / 2;
      }
      return 0;
    }, g = K(() => ({
      left: p() + "px",
      top: 0
    })), d = (b) => {
      b.target !== o.value && m(b);
    }, m = (b) => {
      if (b.stopPropagation(), o.value && n.value) {
        const h = o.value.getBoundingClientRect(), y = n.value.offsetWidth;
        let f = b.clientX - h.left;
        f = Math.max(y / 2, f), f = Math.min(f, h.width - y / 2);
        const w = 1 - (f - y / 2) / (h.width - y);
        i.lightness = w, t("change", w);
      }
    };
    return oe(() => {
      const b = {
        drag: (h) => {
          m(h);
        },
        end: (h) => {
          m(h);
        }
      };
      o.value && n.value && ae.triggerDragEvent(o.value, b);
    }), { barElement: o, cursorElement: n, getCursorStyle: g, getBackgroundStyle: k, onClickSider: d };
  }
}), Rt = (e) => (ee("data-v-94a50a9e"), e = e(), te(), e), At = /* @__PURE__ */ Rt(() => /* @__PURE__ */ u("div", { class: "vc-lightness-slider__bar-handle" }, null, -1)), Pt = [
  At
];
function Vt(e, t, o, n, i, l) {
  return C(), $("div", {
    class: O(["vc-lightness-slider", { "small-slider": e.size === "small" }])
  }, [
    u("div", {
      ref: "barElement",
      class: "vc-lightness-slider__bar",
      style: D(e.getBackgroundStyle),
      onClick: t[0] || (t[0] = (...a) => e.onClickSider && e.onClickSider(...a))
    }, [
      u("div", {
        class: O(["vc-lightness-slider__bar-pointer", { "small-bar": e.size === "small" }]),
        ref: "cursorElement",
        style: D(e.getCursorStyle)
      }, Pt, 6)
    ], 4)
  ], 2);
}
const Le = /* @__PURE__ */ q(Ht, [["render", Vt], ["__scopeId", "data-v-94a50a9e"]]);
const Mt = G({
  name: "History",
  props: {
    colors: v.arrayOf(String).def(() => []),
    round: v.bool.def(!1)
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    return { onColorSelect: (n) => {
      t("change", n);
    } };
  }
}), Et = {
  key: 0,
  class: "vc-colorPicker__record"
}, It = { class: "color-list" }, Kt = ["onClick"];
function Lt(e, t, o, n, i, l) {
  return e.colors && e.colors.length > 0 ? (C(), $("div", Et, [
    u("div", It, [
      (C(!0), $(Q, null, ne(e.colors, (a, r) => (C(), $("div", {
        key: r,
        class: O(["color-item", "transparent", { "color-item__round": e.round }]),
        onClick: (c) => e.onColorSelect(a)
      }, [
        u("div", {
          class: "color-item__display",
          style: D({ backgroundColor: a })
        }, null, 4)
      ], 10, Kt))), 128))
    ])
  ])) : B("", !0);
}
const me = /* @__PURE__ */ q(Mt, [["render", Lt], ["__scopeId", "data-v-0f657238"]]);
const Nt = G({
  name: "Display",
  props: {
    color: v.instanceOf(A),
    disableAlpha: v.bool.def(!1)
  },
  emits: ["update:color", "change"],
  setup(e, { emit: t }) {
    var m, b, h, y;
    const { copy: o, copied: n, isSupported: i } = tt(), l = M("hex"), a = Y({
      color: e.color,
      hex: (m = e.color) == null ? void 0 : m.hex,
      alpha: Math.round(((b = e.color) == null ? void 0 : b.alpha) || 100),
      rgba: (h = e.color) == null ? void 0 : h.RGB,
      previewBgColor: (y = e.color) == null ? void 0 : y.toRgbString()
    }), r = K(() => ({
      background: a.previewBgColor
    })), c = () => {
      l.value = l.value === "rgba" ? "hex" : "rgba";
    }, k = j((f) => {
      if (!f.target.value)
        return;
      let w = parseInt(f.target.value.replace("%", ""));
      w > 100 && (f.target.value = "100", w = 100), w < 0 && (f.target.value = "0", w = 0), isNaN(w) && (f.target.value = "100", w = 100), !isNaN(w) && a.color && (a.color.alpha = w), t("change", a.color);
    }, 300), p = j((f, w) => {
      if (a.color) {
        if (l.value === "hex") {
          const S = f.target.value.replace("#", "");
          R(S).isValid() ? [3, 4].includes(S.length) && (a.color.hex = S) : a.color.hex = "000000", t("change", a.color);
        } else if (l.value === "rgba" && w === 3 && f.target.value.toString() === "0." && a.rgba) {
          a.rgba[w] = f.target.value;
          const [S, F, E, L] = a.rgba;
          a.color.hex = R({ r: S, g: F, b: E }).toHex(), a.color.alpha = Math.round(L * 100), t("change", a.color);
        }
      }
    }, 100), g = j((f, w) => {
      if (f.target.value) {
        if (l.value === "hex") {
          const S = f.target.value.replace("#", "");
          R(S).isValid() && a.color && [6, 8].includes(S.length) && (a.color.hex = S);
        } else if (w !== void 0 && a.rgba && a.color) {
          if (f.target.value < 0 && (f.target.value = 0), w === 3 && ((f.target.value > 1 || isNaN(f.target.value)) && (f.target.value = 1), f.target.value.toString() === "0."))
            return;
          w < 3 && f.target.value > 255 && (f.target.value = 255), a.rgba[w] = f.target.value;
          const [S, F, E, L] = a.rgba;
          a.color.hex = R({ r: S, g: F, b: E }).toHex(), a.color.alpha = Math.round(L * 100);
        }
        t("change", a.color);
      }
    }, 300), d = () => {
      if (i && a.color) {
        const f = l.value === "hex" ? a.color.toString(a.color.alpha === 100 ? "hex6" : "hex8") : a.color.toRgbString();
        o(f || "");
      }
    };
    return T(
      () => e.color,
      (f) => {
        f && (a.color = f, a.alpha = Math.round(a.color.alpha), a.hex = a.color.hex, a.rgba = a.color.RGB);
      },
      { deep: !0 }
    ), T(
      () => a.color,
      () => {
        a.color && (a.previewBgColor = a.color.toRgbString());
      },
      { deep: !0 }
    ), {
      state: a,
      getBgColorStyle: r,
      inputType: l,
      copied: n,
      onInputTypeChange: c,
      onAlphaBlur: k,
      onInputChange: g,
      onBlurChange: p,
      onCopyColorStr: d
    };
  }
}), Wt = { class: "vc-display" }, Dt = { class: "vc-current-color vc-transparent" }, Tt = {
  key: 0,
  class: "copy-text"
}, Ot = {
  key: 0,
  style: { display: "flex", flex: "1", gap: "4px", height: "100%" }
}, zt = { class: "vc-color-input" }, Gt = {
  key: 0,
  class: "vc-alpha-input"
}, Ft = ["value"], Xt = {
  key: 1,
  style: { display: "flex", flex: "1", gap: "4px", height: "100%" }
}, qt = ["value", "onInput", "onBlur"];
function Yt(e, t, o, n, i, l) {
  return C(), $("div", Wt, [
    u("div", Dt, [
      u("div", {
        class: "color-cube",
        style: D(e.getBgColorStyle),
        onClick: t[0] || (t[0] = (...a) => e.onCopyColorStr && e.onCopyColorStr(...a))
      }, [
        e.copied ? (C(), $("span", Tt, "Copied!")) : B("", !0)
      ], 4)
    ]),
    e.inputType === "hex" ? (C(), $("div", Ot, [
      u("div", zt, [
        le(u("input", {
          "onUpdate:modelValue": t[1] || (t[1] = (a) => e.state.hex = a),
          maxlength: "8",
          onInput: t[2] || (t[2] = (...a) => e.onInputChange && e.onInputChange(...a)),
          onBlur: t[3] || (t[3] = (...a) => e.onBlurChange && e.onBlurChange(...a))
        }, null, 544), [
          [Ze, e.state.hex]
        ])
      ]),
      e.disableAlpha ? B("", !0) : (C(), $("div", Gt, [
        u("input", {
          class: "vc-alpha-input__inner",
          value: e.state.alpha,
          onInput: t[4] || (t[4] = (...a) => e.onAlphaBlur && e.onAlphaBlur(...a))
        }, null, 40, Ft),
        Ee("% ")
      ]))
    ])) : e.state.rgba ? (C(), $("div", Xt, [
      (C(!0), $(Q, null, ne(e.state.rgba, (a, r) => (C(), $("div", {
        class: "vc-color-input",
        key: r
      }, [
        u("input", {
          value: a,
          onInput: (c) => e.onInputChange(c, r),
          onBlur: (c) => e.onBlurChange(c, r)
        }, null, 40, qt)
      ]))), 128))
    ])) : B("", !0),
    u("div", {
      class: "vc-input-toggle",
      onClick: t[5] || (t[5] = (...a) => e.onInputTypeChange && e.onInputTypeChange(...a))
    }, se(e.inputType), 1)
  ]);
}
const Se = /* @__PURE__ */ q(Nt, [["render", Yt], ["__scopeId", "data-v-7334ac20"]]);
const Ut = G({
  name: "FkColorPicker",
  components: { Display: Se, Alpha: ve, Palette: Ke, Board: ye, Hue: _e, Lightness: Le, History: me },
  props: {
    color: v.instanceOf(A),
    disableHistory: v.bool.def(!1),
    roundHistory: v.bool.def(!1),
    disableAlpha: v.bool.def(!1)
  },
  emits: ["update:color", "change", "advanceChange"],
  setup(e, { emit: t }) {
    const o = e.color || new A(), n = Y({
      color: o,
      hex: o.toHexString(),
      rgb: o.toRgbString()
    }), i = M(!1), l = K(() => ({ background: n.rgb })), a = () => {
      i.value = !1, t("advanceChange", !1);
    }, r = pe(fe, [], {}), c = j(() => {
      if (e.disableHistory)
        return;
      const h = n.color.toRgbString();
      if (r.value = r.value.filter((y) => !R.equals(y, h)), !r.value.includes(h)) {
        for (; r.value.length > Ce; )
          r.value.pop();
        r.value.unshift(h);
      }
    }, 500), k = (h) => {
      h === "advance" ? (i.value = !0, t("advanceChange", !0)) : (n.color.hex = h, t("advanceChange", !1));
    }, p = (h) => {
      n.color.alpha = h;
    }, g = (h) => {
      n.color.hue = h;
    }, d = (h, y) => {
      n.color.saturation = h, n.color.brightness = y;
    }, m = (h) => {
      n.color.lightness = h;
    }, b = (h) => {
      const f = h.target.value.replace("#", "");
      R(f).isValid() && (n.color.hex = f);
    };
    return T(
      () => e.color,
      (h) => {
        h && (n.color = h);
      },
      { deep: !0 }
    ), T(
      () => n.color,
      () => {
        n.hex = n.color.hex, n.rgb = n.color.toRgbString(), c(), t("update:color", n.color), t("change", n.color);
      },
      { deep: !0 }
    ), {
      state: n,
      advancePanelShow: i,
      onBack: a,
      onCompactChange: k,
      onAlphaChange: p,
      onHueChange: g,
      onBoardChange: d,
      onLightChange: m,
      onInputChange: b,
      previewStyle: l,
      historyColors: r
    };
  }
}), jt = (e) => (ee("data-v-48e3c224"), e = e(), te(), e), Zt = { class: "vc-fk-colorPicker" }, Jt = { class: "vc-fk-colorPicker__inner" }, Qt = { class: "vc-fk-colorPicker__header" }, xt = /* @__PURE__ */ jt(() => /* @__PURE__ */ u("div", { class: "back" }, null, -1)), eo = [
  xt
];
function to(e, t, o, n, i, l) {
  const a = V("Palette"), r = V("Board"), c = V("Hue"), k = V("Lightness"), p = V("Alpha"), g = V("Display"), d = V("History");
  return C(), $("div", Zt, [
    u("div", Jt, [
      u("div", Qt, [
        e.advancePanelShow ? (C(), $("span", {
          key: 0,
          style: { cursor: "pointer" },
          onClick: t[0] || (t[0] = (...m) => e.onBack && e.onBack(...m))
        }, eo)) : B("", !0)
      ]),
      e.advancePanelShow ? B("", !0) : (C(), I(a, {
        key: 0,
        onChange: e.onCompactChange
      }, null, 8, ["onChange"])),
      e.advancePanelShow ? (C(), I(r, {
        key: 1,
        color: e.state.color,
        onChange: e.onBoardChange
      }, null, 8, ["color", "onChange"])) : B("", !0),
      e.advancePanelShow ? (C(), I(c, {
        key: 2,
        color: e.state.color,
        onChange: e.onHueChange
      }, null, 8, ["color", "onChange"])) : B("", !0),
      e.advancePanelShow ? B("", !0) : (C(), I(k, {
        key: 3,
        color: e.state.color,
        onChange: e.onLightChange
      }, null, 8, ["color", "onChange"])),
      e.disableAlpha ? B("", !0) : (C(), I(p, {
        key: 4,
        color: e.state.color,
        onChange: e.onAlphaChange
      }, null, 8, ["color", "onChange"])),
      Z(g, {
        color: e.state.color,
        "disable-alpha": e.disableAlpha
      }, null, 8, ["color", "disable-alpha"]),
      e.disableHistory ? B("", !0) : (C(), I(d, {
        key: 5,
        round: e.roundHistory,
        colors: e.historyColors,
        onChange: e.onCompactChange
      }, null, 8, ["round", "colors", "onChange"]))
    ])
  ]);
}
const Pe = /* @__PURE__ */ q(Ut, [["render", to], ["__scopeId", "data-v-48e3c224"]]);
const oo = G({
  name: "ChromeColorPicker",
  components: { Display: Se, Alpha: ve, Board: ye, Hue: _e, History: me },
  props: {
    color: v.instanceOf(A),
    disableHistory: v.bool.def(!1),
    roundHistory: v.bool.def(!1),
    disableAlpha: v.bool.def(!1)
  },
  emits: ["update:color", "change"],
  setup(e, { emit: t }) {
    const o = e.color || new A(), n = Y({
      color: o,
      hex: o.toHexString(),
      rgb: o.toRgbString()
    }), i = K(() => ({ background: n.rgb })), l = pe(fe, [], {}), a = j(() => {
      if (e.disableHistory)
        return;
      const d = n.color.toRgbString();
      if (l.value = l.value.filter((m) => !R.equals(m, d)), !l.value.includes(d)) {
        for (; l.value.length > Ce; )
          l.value.pop();
        l.value.unshift(d);
      }
    }, 500), r = (d) => {
      n.color.alpha = d;
    }, c = (d) => {
      n.color.hue = d;
    }, k = (d) => {
      d.hex !== void 0 && (n.color.hex = d.hex), d.alpha !== void 0 && (n.color.alpha = d.alpha);
    }, p = (d, m) => {
      n.color.saturation = d, n.color.brightness = m;
    }, g = (d) => {
      d !== "advance" && (n.color.hex = d);
    };
    return T(
      () => e.color,
      (d) => {
        d && (n.color = d);
      },
      { deep: !0 }
    ), T(
      () => n.color,
      () => {
        n.hex = n.color.hex, n.rgb = n.color.toRgbString(), a(), t("update:color", n.color), t("change", n.color);
      },
      { deep: !0 }
    ), {
      state: n,
      previewStyle: i,
      historyColors: l,
      onAlphaChange: r,
      onHueChange: c,
      onBoardChange: p,
      onInputChange: k,
      onCompactChange: g
    };
  }
}), no = { class: "vc-chrome-colorPicker" }, ao = { class: "vc-chrome-colorPicker-body" }, ro = { class: "chrome-controls" }, lo = { class: "chrome-sliders" };
function so(e, t, o, n, i, l) {
  const a = V("Board"), r = V("Hue"), c = V("Alpha"), k = V("Display"), p = V("History");
  return C(), $("div", no, [
    Z(a, {
      round: !0,
      hide: !1,
      color: e.state.color,
      onChange: e.onBoardChange
    }, null, 8, ["color", "onChange"]),
    u("div", ao, [
      u("div", ro, [
        u("div", lo, [
          Z(r, {
            size: "small",
            color: e.state.color,
            onChange: e.onHueChange
          }, null, 8, ["color", "onChange"]),
          e.disableAlpha ? B("", !0) : (C(), I(c, {
            key: 0,
            size: "small",
            color: e.state.color,
            onChange: e.onAlphaChange
          }, null, 8, ["color", "onChange"]))
        ])
      ]),
      Z(k, {
        color: e.state.color,
        "disable-alpha": e.disableAlpha
      }, null, 8, ["color", "disable-alpha"]),
      e.disableHistory ? B("", !0) : (C(), I(p, {
        key: 0,
        round: e.roundHistory,
        colors: e.historyColors,
        onChange: e.onCompactChange
      }, null, 8, ["round", "colors", "onChange"]))
    ])
  ]);
}
const Ve = /* @__PURE__ */ q(oo, [["render", so], ["__scopeId", "data-v-2611d66c"]]), ke = "Vue3ColorPickerProvider", io = (e, t) => {
  const o = e.getBoundingClientRect(), n = o.left + o.width / 2, i = o.top + o.height / 2, l = Math.abs(n - t.clientX), a = Math.abs(i - t.clientY), r = Math.sqrt(Math.pow(l, 2) + Math.pow(a, 2)), c = a / r, k = Math.acos(c);
  let p = Math.floor(180 / (Math.PI / k));
  return t.clientX > n && t.clientY > i && (p = 180 - p), t.clientX == n && t.clientY > i && (p = 180), t.clientX > n && t.clientY == i && (p = 90), t.clientX < n && t.clientY > i && (p = 180 + p), t.clientX < n && t.clientY == i && (p = 270), t.clientX < n && t.clientY < i && (p = 360 - p), p;
};
let de = !1;
const co = (e, t) => {
  const o = function(i) {
    var l;
    (l = t.drag) == null || l.call(t, i);
  }, n = function(i) {
    var l;
    document.removeEventListener("mousemove", o, !1), document.removeEventListener("mouseup", n, !1), document.onselectstart = null, document.ondragstart = null, de = !1, (l = t.end) == null || l.call(t, i);
  };
  e && e.addEventListener("mousedown", (i) => {
    var l;
    de || (document.onselectstart = () => !1, document.ondragstart = () => !1, document.addEventListener("mousemove", o, !1), document.addEventListener("mouseup", n, !1), de = !0, (l = t.start) == null || l.call(t, i));
  });
};
const uo = {
  angle: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 16,
    validator: (e) => e >= 16
  },
  borderWidth: {
    type: Number,
    default: 1,
    validator: (e) => e >= 1
  },
  borderColor: {
    type: String,
    default: "#666"
  }
}, go = G({
  name: "Angle",
  props: uo,
  emits: ["update:angle", "change"],
  setup(e, {
    emit: t
  }) {
    const o = M(null), n = M(0);
    x(() => e.angle, (r) => {
      n.value = r;
    });
    const i = () => {
      let r = Number(n.value);
      isNaN(r) || (r = r > 360 || r < 0 ? e.angle : r, n.value = r === 360 ? 0 : r, t("update:angle", n.value), t("change", n.value));
    }, l = K(() => ({
      width: e.size + "px",
      height: e.size + "px",
      borderWidth: e.borderWidth + "px",
      borderColor: e.borderColor,
      transform: `rotate(${n.value}deg)`
    })), a = (r) => {
      o.value && (n.value = io(o.value, r) % 360, i());
    };
    return Je(() => {
      const r = {
        drag: (c) => {
          a(c);
        },
        end: (c) => {
          a(c);
        }
      };
      o.value && co(o.value, r);
    }), () => Z("div", {
      class: "bee-angle"
    }, [Z("div", {
      class: "bee-angle__round",
      ref: o,
      style: l.value
    }, null)]);
  }
});
const ho = G({
  name: "GradientColorPicker",
  components: { Angle: go, Display: Se, Alpha: ve, Palette: Ke, Board: ye, Hue: _e, Lightness: Le, History: me },
  props: {
    startColor: v.instanceOf(A).isRequired,
    endColor: v.instanceOf(A).isRequired,
    startColorStop: v.number.def(0),
    endColorStop: v.number.def(100),
    angle: v.number.def(0),
    type: v.oneOf(["linear", "radial"]).def("linear"),
    disableHistory: v.bool.def(!1),
    roundHistory: v.bool.def(!1),
    disableAlpha: v.bool.def(!1),
    pickerType: v.oneOf(["fk", "chrome"]).def("fk")
  },
  emits: [
    "update:startColor",
    "update:endColor",
    "update:angle",
    "update:startColorStop",
    "update:endColorStop",
    "startColorChange",
    "endColorChange",
    "advanceChange",
    "angleChange",
    "startColorStopChange",
    "endColorStopChange",
    "typeChange"
  ],
  setup(e, { emit: t }) {
    const o = Y({
      startActive: !0,
      startColor: e.startColor,
      endColor: e.endColor,
      startColorStop: e.startColorStop,
      endColorStop: e.endColorStop,
      angle: e.angle,
      type: e.type,
      // rgba
      startColorRgba: e.startColor.toRgbString(),
      endColorRgba: e.endColor.toRgbString()
    }), n = Ie(ke), i = M(e.pickerType === "chrome"), l = M(), a = M(), r = M();
    x(
      () => [e.startColor, e.endColor, e.angle],
      (s) => {
        o.startColor = s[0], o.endColor = s[1], o.angle = s[2];
      }
    ), x(
      () => e.type,
      (s) => {
        o.type = s;
      }
    );
    const c = K({
      get: () => o.startActive ? o.startColor : o.endColor,
      set: (s) => {
        if (o.startActive) {
          o.startColor = s;
          return;
        }
        o.endColor = s;
      }
    }), k = K(() => {
      if (r.value && l.value) {
        const s = o.startColorStop / 100, _ = r.value.getBoundingClientRect(), H = l.value.offsetWidth;
        return Math.round(s * (_.width - H) + H / 2);
      }
      return 0;
    }), p = K(() => {
      if (r.value && a.value) {
        const s = o.endColorStop / 100, _ = r.value.getBoundingClientRect(), H = a.value.offsetWidth;
        return Math.round(s * (_.width - H) + H / 2);
      }
      return 0;
    }), g = K(() => {
      let s = `background: linear-gradient(${o.angle}deg, ${o.startColorRgba} ${o.startColorStop}%, ${o.endColorRgba} ${o.endColorStop}%)`;
      return o.type === "radial" && (s = `background: radial-gradient(circle, ${o.startColorRgba} ${o.startColorStop}%, ${o.endColorRgba} ${o.endColorStop}%)`), s;
    }), d = (s) => {
      var _;
      if (o.startActive = !0, r.value && l.value) {
        const H = (_ = r.value) == null ? void 0 : _.getBoundingClientRect();
        let N = s.clientX - H.left;
        N = Math.max(l.value.offsetWidth / 2, N), N = Math.min(N, H.width - l.value.offsetWidth / 2), o.startColorStop = Math.round(
          (N - l.value.offsetWidth / 2) / (H.width - l.value.offsetWidth) * 100
        ), t("update:startColorStop", o.startColorStop), t("startColorStopChange", o.startColorStop);
      }
    }, m = (s) => {
      var _;
      if (o.startActive = !1, r.value && a.value) {
        const H = (_ = r.value) == null ? void 0 : _.getBoundingClientRect();
        let N = s.clientX - H.left;
        N = Math.max(a.value.offsetWidth / 2, N), N = Math.min(N, H.width - a.value.offsetWidth / 2), o.endColorStop = Math.round(
          (N - a.value.offsetWidth / 2) / (H.width - a.value.offsetWidth) * 100
        ), t("update:endColorStop", o.endColorStop), t("endColorStopChange", o.endColorStop);
      }
    }, b = (s) => {
      const _ = s.target, H = parseInt(_.value.replace("°", ""));
      isNaN(H) || (o.angle = H % 360), t("update:angle", o.angle), t("angleChange", o.angle);
    }, h = (s) => {
      o.angle = s, t("update:angle", o.angle), t("angleChange", o.angle);
    }, y = (s) => {
      s === "advance" ? (i.value = !0, t("advanceChange", !0)) : (c.value.hex = s, t("advanceChange", !1)), L();
    }, f = (s) => {
      c.value.alpha = s, L();
    }, w = (s) => {
      c.value.hue = s, L();
    }, S = (s, _) => {
      c.value.saturation = s, c.value.brightness = _, L();
    }, F = (s) => {
      c.value.lightness = s, L();
    }, E = () => {
      L();
    }, L = () => {
      o.startActive ? (t("update:startColor", o.startColor), t("startColorChange", o.startColor)) : (t("update:endColor", o.endColor), t("endColorChange", o.endColor));
    }, U = () => {
      i.value = !1, t("advanceChange", !1);
    }, J = () => {
      o.type = o.type === "linear" ? "radial" : "linear", t("typeChange", o.type);
    }, X = pe(fe, [], {}), ce = j(() => {
      if (e.disableHistory)
        return;
      const s = c.value.toRgbString();
      if (X.value = X.value.filter((_) => !R.equals(_, s)), !X.value.includes(s)) {
        for (; X.value.length > Ce; )
          X.value.pop();
        X.value.unshift(s);
      }
    }, 500);
    return oe(() => {
      a.value && l.value && (ae.triggerDragEvent(a.value, {
        drag: (s) => {
          m(s);
        },
        end: (s) => {
          m(s);
        }
      }), ae.triggerDragEvent(l.value, {
        drag: (s) => {
          d(s);
        },
        end: (s) => {
          d(s);
        }
      }));
    }), T(
      () => o.startColor,
      (s) => {
        o.startColorRgba = s.toRgbString();
      },
      { deep: !0 }
    ), T(
      () => o.endColor,
      (s) => {
        o.endColorRgba = s.toRgbString();
      },
      { deep: !0 }
    ), T(
      () => c.value,
      () => {
        ce();
      },
      { deep: !0 }
    ), {
      startGradientRef: l,
      stopGradientRef: a,
      colorRangeRef: r,
      state: o,
      currentColor: c,
      getStartColorLeft: k,
      getEndColorLeft: p,
      gradientBg: g,
      advancePanelShow: i,
      onDegreeBlur: b,
      onCompactChange: y,
      onAlphaChange: f,
      onHueChange: w,
      onBoardChange: S,
      onLightChange: F,
      historyColors: X,
      onBack: U,
      onDegreeChange: h,
      onDisplayChange: E,
      onTypeChange: J,
      lang: n == null ? void 0 : n.lang
    };
  }
}), Ne = (e) => (ee("data-v-c4d6d6ea"), e = e(), te(), e), po = { class: "vc-gradient-picker" }, fo = { class: "vc-gradient-picker__header" }, Co = { class: "vc-gradient__types" }, vo = { class: "vc-gradient-wrap__types" }, bo = { class: "vc-picker-degree-input vc-degree-input" }, yo = { class: "vc-degree-input__control" }, _o = ["value"], mo = { class: "vc-degree-input__panel" }, So = { class: "vc-degree-input__disk" }, ko = { class: "vc-gradient-picker__body" }, $o = {
  class: "vc-color-range",
  ref: "colorRangeRef"
}, wo = { class: "vc-color-range__container" }, Bo = { class: "vc-gradient__stop__container" }, Ho = ["title"], Ro = /* @__PURE__ */ Ne(() => /* @__PURE__ */ u("span", { class: "vc-gradient__stop--inner" }, null, -1)), Ao = [
  Ro
], Po = ["title"], Vo = /* @__PURE__ */ Ne(() => /* @__PURE__ */ u("span", { class: "vc-gradient__stop--inner" }, null, -1)), Mo = [
  Vo
];
function Eo(e, t, o, n, i, l) {
  var b, h;
  const a = V("Angle"), r = V("Board"), c = V("Hue"), k = V("Palette"), p = V("Lightness"), g = V("Alpha"), d = V("Display"), m = V("History");
  return C(), $("div", po, [
    u("div", fo, [
      u("div", null, [
        le(u("div", {
          class: "back",
          style: { cursor: "pointer" },
          onClick: t[0] || (t[0] = (...y) => e.onBack && e.onBack(...y))
        }, null, 512), [
          [ge, e.pickerType === "fk" && e.advancePanelShow]
        ])
      ]),
      u("div", Co, [
        u("div", vo, [
          (C(), $(Q, null, ne(["linear", "radial"], (y) => u("div", {
            class: O(["vc-gradient__type", { active: e.state.type === y }]),
            key: y,
            onClick: t[1] || (t[1] = (...f) => e.onTypeChange && e.onTypeChange(...f))
          }, se(e.lang ? e.lang[y] : y), 3)), 64))
        ]),
        le(u("div", bo, [
          u("div", yo, [
            u("input", {
              value: e.state.angle,
              onBlur: t[2] || (t[2] = (...y) => e.onDegreeBlur && e.onDegreeBlur(...y))
            }, null, 40, _o),
            Ee("deg ")
          ]),
          u("div", mo, [
            u("div", So, [
              Z(a, {
                angle: e.state.angle,
                "onUpdate:angle": t[3] || (t[3] = (y) => e.state.angle = y),
                size: 40,
                onChange: e.onDegreeChange
              }, null, 8, ["angle", "onChange"])
            ])
          ])
        ], 512), [
          [ge, e.state.type === "linear"]
        ])
      ])
    ]),
    u("div", ko, [
      u("div", $o, [
        u("div", wo, [
          u("div", {
            class: "vc-background",
            style: D(e.gradientBg)
          }, null, 4),
          u("div", Bo, [
            u("div", {
              class: O(["vc-gradient__stop", {
                "vc-gradient__stop--current": e.state.startActive
              }]),
              ref: "startGradientRef",
              title: (b = e.lang) == null ? void 0 : b.start,
              style: D({ left: e.getStartColorLeft + "px", backgroundColor: e.state.startColorRgba })
            }, Ao, 14, Ho),
            u("div", {
              class: O(["vc-gradient__stop", {
                "vc-gradient__stop--current": !e.state.startActive
              }]),
              ref: "stopGradientRef",
              title: (h = e.lang) == null ? void 0 : h.end,
              style: D({ left: e.getEndColorLeft + "px", backgroundColor: e.state.endColorRgba })
            }, Mo, 14, Po)
          ])
        ])
      ], 512)
    ]),
    e.advancePanelShow ? (C(), I(r, {
      key: 0,
      color: e.currentColor,
      onChange: e.onBoardChange
    }, null, 8, ["color", "onChange"])) : B("", !0),
    e.advancePanelShow ? (C(), I(c, {
      key: 1,
      color: e.currentColor,
      onChange: e.onHueChange
    }, null, 8, ["color", "onChange"])) : B("", !0),
    e.advancePanelShow ? B("", !0) : (C(), I(k, {
      key: 2,
      onChange: e.onCompactChange
    }, null, 8, ["onChange"])),
    e.advancePanelShow ? B("", !0) : (C(), I(p, {
      key: 3,
      color: e.currentColor,
      onChange: e.onLightChange
    }, null, 8, ["color", "onChange"])),
    e.disableAlpha ? B("", !0) : (C(), I(g, {
      key: 4,
      color: e.currentColor,
      onChange: e.onAlphaChange
    }, null, 8, ["color", "onChange"])),
    Z(d, {
      color: e.currentColor,
      "disable-alpha": e.disableAlpha,
      onChange: e.onDisplayChange
    }, null, 8, ["color", "disable-alpha", "onChange"]),
    e.disableHistory ? B("", !0) : (C(), I(m, {
      key: 5,
      round: e.roundHistory,
      colors: e.historyColors,
      onChange: e.onCompactChange
    }, null, 8, ["round", "colors", "onChange"]))
  ]);
}
const Me = /* @__PURE__ */ q(ho, [["render", Eo], ["__scopeId", "data-v-c4d6d6ea"]]);
const Io = G({
  name: "WrapContainer",
  props: {
    theme: v.oneOf(["white", "black"]).def("white"),
    showTab: v.bool.def(!1),
    activeKey: v.oneOf(["pure", "gradient"]).def("pure")
  },
  emits: ["update:activeKey", "change"],
  setup(e, { emit: t }) {
    const o = Y({
      activeKey: e.activeKey
    }), n = Ie(ke), i = (l) => {
      o.activeKey = l, t("update:activeKey", l), t("change", l);
    };
    return T(
      () => e.activeKey,
      (l) => {
        o.activeKey = l;
      }
    ), { state: o, onActiveKeyChange: i, lang: n == null ? void 0 : n.lang };
  }
}), Ko = { class: "vc-colorpicker--container" }, Lo = {
  key: 0,
  class: "vc-colorpicker--tabs"
}, No = { class: "vc-colorpicker--tabs__inner" }, Wo = { class: "vc-btn__content" }, Do = { class: "vc-btn__content" };
function To(e, t, o, n, i, l) {
  var a, r;
  return C(), $("div", {
    class: O(["vc-colorpicker", e.theme])
  }, [
    u("div", Ko, [
      e.showTab ? (C(), $("div", Lo, [
        u("div", No, [
          u("div", {
            class: O([
              "vc-colorpicker--tabs__btn",
              {
                "vc-btn-active": e.state.activeKey === "pure"
              }
            ]),
            onClick: t[0] || (t[0] = (c) => e.onActiveKeyChange("pure"))
          }, [
            u("button", null, [
              u("div", Wo, se((a = e.lang) == null ? void 0 : a.pure), 1)
            ])
          ], 2),
          u("div", {
            class: O([
              "vc-colorpicker--tabs__btn",
              {
                "vc-btn-active": e.state.activeKey === "gradient"
              }
            ]),
            onClick: t[1] || (t[1] = (c) => e.onActiveKeyChange("gradient"))
          }, [
            u("button", null, [
              u("div", Do, se((r = e.lang) == null ? void 0 : r.gradient), 1)
            ])
          ], 2),
          u("div", {
            class: "vc-colorpicker--tabs__bg",
            style: D({
              width: "50%",
              left: `calc(${e.state.activeKey === "gradient" ? 50 : 0}%)`
            })
          }, null, 4)
        ])
      ])) : B("", !0),
      he(e.$slots, "default", {}, void 0, !0)
    ])
  ], 2);
}
const Oo = /* @__PURE__ */ q(Io, [["render", To], ["__scopeId", "data-v-0492277d"]]), zo = {
  start: "Start",
  end: "End",
  pure: "Pure",
  gradient: "Gradient",
  linear: "linear",
  radial: "radial"
}, Go = {
  start: "开始",
  end: "结束",
  pure: "纯色",
  gradient: "渐变",
  linear: "线性",
  radial: "径向"
}, Fo = {
  En: zo,
  "ZH-cn": Go
};
const Xo = {
  isWidget: v.bool.def(!1),
  pickerType: v.oneOf(["fk", "chrome"]).def("fk"),
  shape: v.oneOf(["circle", "square"]).def("square"),
  pureColor: {
    type: [String, Object],
    default: "#000000"
  },
  gradientColor: v.string.def(
    "linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)"
  ),
  format: {
    type: String,
    default: "rgb"
  },
  disableAlpha: v.bool.def(!1),
  disableHistory: v.bool.def(!1),
  roundHistory: v.bool.def(!1),
  useType: v.oneOf(["pure", "gradient", "both"]).def("pure"),
  activeKey: v.oneOf(["pure", "gradient"]).def("pure"),
  lang: {
    type: String,
    default: "ZH-cn"
  },
  zIndex: v.number.def(9999),
  pickerContainer: {
    type: [String, HTMLElement],
    default: "body"
  },
  debounce: v.number.def(100),
  theme: v.oneOf(["white", "black"]).def("white"),
  blurClose: v.bool.def(!1),
  defaultPopup: v.bool.def(!1)
}, qo = G({
  name: "ColorPicker",
  components: { FkColorPicker: Pe, ChromeColorPicker: Ve, GradientColorPicker: Me, WrapContainer: Oo },
  inheritAttrs: !1,
  props: Xo,
  emits: [
    "update:pureColor",
    "pureColorChange",
    "update:gradientColor",
    "gradientColorChange",
    "update:activeKey",
    "activeKeyChange"
  ],
  setup(e, { emit: t }) {
    Qe(ke, {
      lang: K(() => Fo[e.lang || "ZH-cn"])
    });
    const o = !!xe().extra, n = Y({
      pureColor: e.pureColor || "",
      activeKey: e.useType === "gradient" ? "gradient" : e.activeKey,
      //  "pure" | "gradient"
      isAdvanceMode: !1
    }), i = new A("#000"), l = new A("#000"), a = new A(n.pureColor), r = Y({
      startColor: i,
      endColor: l,
      startColorStop: 0,
      endColorStop: 100,
      angle: 0,
      type: "linear",
      gradientColor: e.gradientColor
    }), c = M(a), k = M(e.defaultPopup), p = M(null), g = M(null);
    let d = null;
    const m = K(() => ({
      background: n.activeKey !== "gradient" ? R(n.pureColor).toRgbString() : r.gradientColor
    })), b = K(() => n.activeKey === "gradient" ? Me.name : e.pickerType === "fk" ? Pe.name : Ve.name), h = (s) => {
      n.isAdvanceMode = s;
    }, y = K(() => {
      const s = {
        disableAlpha: e.disableAlpha,
        disableHistory: e.disableHistory,
        roundHistory: e.roundHistory,
        pickerType: e.pickerType
      };
      return n.activeKey === "gradient" ? {
        ...s,
        startColor: r.startColor,
        endColor: r.endColor,
        angle: r.angle,
        type: r.type,
        startColorStop: r.startColorStop,
        endColorStop: r.endColorStop,
        onStartColorChange: (_) => {
          r.startColor = _, E();
        },
        onEndColorChange: (_) => {
          r.endColor = _, E();
        },
        onStartColorStopChange: (_) => {
          r.startColorStop = _, E();
        },
        onEndColorStopChange: (_) => {
          r.endColorStop = _, E();
        },
        onAngleChange: (_) => {
          r.angle = _, E();
        },
        onTypeChange: (_) => {
          r.type = _, E();
        },
        onAdvanceChange: h
      } : {
        ...s,
        disableAlpha: e.disableAlpha,
        disableHistory: e.disableHistory,
        roundHistory: e.roundHistory,
        color: c.value,
        onChange: J,
        onAdvanceChange: h
      };
    }), f = () => {
      k.value = !0, d ? d.update() : U();
    }, w = () => {
      k.value = !1;
    }, S = j(() => {
      !e.isWidget && e.blurClose && w();
    }, 100);
    ot(g, () => {
      w();
    });
    const F = () => {
      var s, _, H, N;
      try {
        const [z] = at(r.gradientColor);
        if (z && z.type.includes("gradient") && z.colorStops.length >= 2) {
          const $e = z.colorStops[0], we = z.colorStops[1];
          r.startColorStop = Number((s = $e.length) == null ? void 0 : s.value) || 0, r.endColorStop = Number((_ = we.length) == null ? void 0 : _.value) || 0, z.type === "linear-gradient" && ((H = z.orientation) == null ? void 0 : H.type) === "angular" && (r.angle = Number((N = z.orientation) == null ? void 0 : N.value) || 0), r.type = z.type.split("-")[0];
          const [We, De, Te, Oe] = $e.value, [ze, Ge, Fe, Xe] = we.value;
          r.startColor = new A({
            r: Number(We),
            g: Number(De),
            b: Number(Te),
            a: Number(Oe)
          }), r.endColor = new A({
            r: Number(ze),
            g: Number(Ge),
            b: Number(Fe),
            a: Number(Xe)
          });
        }
      } catch (z) {
        console.log(`[Parse Color]: ${z}`);
      }
    }, E = j(() => {
      const s = L();
      try {
        r.gradientColor = nt(s), t("update:gradientColor", r.gradientColor), t("gradientColorChange", r.gradientColor);
      } catch (_) {
        console.log(_);
      }
    }, e.debounce), L = () => {
      const s = [], _ = r.startColor.RGB.map((z) => z.toString()), H = r.endColor.RGB.map((z) => z.toString()), N = [
        {
          type: "rgba",
          value: [_[0], _[1], _[2], _[3]],
          length: { value: r.startColorStop + "", type: "%" }
        },
        {
          type: "rgba",
          value: [H[0], H[1], H[2], H[3]],
          length: { value: r.endColorStop + "", type: "%" }
        }
      ];
      return r.type === "linear" ? s.push({
        type: "linear-gradient",
        orientation: { type: "angular", value: r.angle + "" },
        colorStops: N
      }) : r.type === "radial" && s.push({
        type: "radial-gradient",
        orientation: [{ type: "shape", value: "circle" }],
        colorStops: N
      }), s;
    }, U = () => {
      p.value && g.value && (d = rt(p.value, g.value, {
        placement: "auto",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 8]
            }
          },
          {
            name: "flip",
            options: {
              allowedAutoPlacements: ["top", "bottom", "left", "right"],
              rootBoundary: "viewport"
            }
          }
        ]
      }));
    }, J = (s) => {
      c.value = s, n.pureColor = s.toString(e.format), X();
    }, X = j(() => {
      t("update:pureColor", n.pureColor), t("pureColorChange", n.pureColor);
    }, e.debounce), ce = (s) => {
      n.activeKey = s, t("update:activeKey", s), t("activeKeyChange", s);
    };
    return oe(() => {
      F(), d || U();
    }), T(
      () => e.gradientColor,
      (s) => {
        s != r.gradientColor && (r.gradientColor = s);
      }
    ), T(
      () => r.gradientColor,
      () => {
        F();
      }
    ), T(
      () => e.activeKey,
      (s) => {
        n.activeKey = s;
      }
    ), T(
      () => e.useType,
      (s) => {
        n.activeKey !== "gradient" && s === "gradient" ? n.activeKey = "gradient" : n.activeKey = "pure";
      }
    ), T(
      () => e.pureColor,
      (s) => {
        R.equals(s, n.pureColor) || (n.pureColor = s, c.value = new A(s));
      },
      { deep: !0 }
    ), {
      colorCubeRef: p,
      pickerRef: g,
      showPicker: k,
      colorInstance: c,
      getBgColorStyle: m,
      getComponentName: b,
      getBindArgs: y,
      state: n,
      hasExtra: o,
      onColorChange: J,
      onShowPicker: f,
      onActiveKeyChange: ce,
      onAutoClose: S
    };
  }
}), Yo = {
  key: 0,
  class: "vc-color-extra"
}, Uo = {
  key: 0,
  class: "vc-color-extra"
};
function jo(e, t, o, n, i, l) {
  const a = V("WrapContainer");
  return C(), $(Q, null, [
    e.isWidget ? (C(), I(a, {
      key: 0,
      "active-key": e.state.activeKey,
      "onUpdate:activeKey": t[0] || (t[0] = (r) => e.state.activeKey = r),
      "show-tab": e.useType === "both",
      style: D({ zIndex: e.zIndex }),
      theme: e.theme,
      onChange: e.onActiveKeyChange
    }, {
      default: Be(() => [
        (C(), I(He(e.getComponentName), Re({ key: e.getComponentName }, e.getBindArgs), null, 16)),
        e.hasExtra ? (C(), $("div", Yo, [
          he(e.$slots, "extra", {}, void 0, !0)
        ])) : B("", !0)
      ]),
      _: 3
    }, 8, ["active-key", "show-tab", "style", "theme", "onChange"])) : B("", !0),
    e.isWidget ? B("", !0) : (C(), $(Q, { key: 1 }, [
      u("div", {
        class: O(["vc-color-wrap transparent", { round: e.shape === "circle" }]),
        ref: "colorCubeRef"
      }, [
        u("div", {
          class: "current-color",
          style: D(e.getBgColorStyle),
          onClick: t[1] || (t[1] = (...r) => e.onShowPicker && e.onShowPicker(...r))
        }, null, 4)
      ], 2),
      (C(), I(et, { to: e.pickerContainer }, [
        le(u("div", {
          ref: "pickerRef",
          style: D({ zIndex: e.zIndex }),
          onMouseleave: t[3] || (t[3] = (...r) => e.onAutoClose && e.onAutoClose(...r))
        }, [
          e.showPicker ? (C(), I(a, {
            key: 0,
            "show-tab": e.useType === "both" && !e.state.isAdvanceMode,
            theme: e.theme,
            "active-key": e.state.activeKey,
            "onUpdate:activeKey": t[2] || (t[2] = (r) => e.state.activeKey = r),
            onChange: e.onActiveKeyChange
          }, {
            default: Be(() => [
              (C(), I(He(e.getComponentName), Re({ key: e.getComponentName }, e.getBindArgs), null, 16)),
              e.hasExtra ? (C(), $("div", Uo, [
                he(e.$slots, "extra", {}, void 0, !0)
              ])) : B("", !0)
            ]),
            _: 3
          }, 8, ["show-tab", "theme", "active-key", "onChange"])) : B("", !0)
        ], 36), [
          [ge, e.showPicker]
        ])
      ], 8, ["to"]))
    ], 64))
  ], 64);
}
const re = /* @__PURE__ */ q(qo, [["render", jo], ["__scopeId", "data-v-354ca836"]]), rn = {
  install: (e) => {
    e.component(re.name, re), e.component("Vue3" + re.name, re);
  }
};
export {
  re as ColorPicker,
  rn as default
};
