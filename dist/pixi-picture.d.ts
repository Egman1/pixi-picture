declare namespace PIXI.picture {
    class BackdropFilter extends PIXI.Filter {
        backdropUniformName: string;
        _backdropActive: boolean;
        clearColor: Float32Array;
    }
    interface IBlendShaderParts {
        uniformCode?: string;
        uniforms?: {
            [key: string]: any;
        };
        blendCode: string;
    }
    class BlendFilter extends BackdropFilter {
        constructor(shaderParts: IBlendShaderParts);
    }
}
declare namespace PIXI {
    namespace systems {
        interface FilterSystem {
            prepareBackdrop(sourceFrame: PIXI.Rectangle): PIXI.RenderTexture;
            pushWithCheck(target: PIXI.DisplayObject, filters: Array<Filter>, checkEmptyBounds?: boolean): boolean;
        }
        interface TextureSystem {
            bindForceLocation(texture: BaseTexture, location: number): void;
        }
    }
}
declare namespace PIXI.picture {
}
declare namespace PIXI.picture {
    enum MASK_CHANNEL {
        RED = 0,
        GREEN = 1,
        BLUE = 2,
        ALPHA = 3
    }
    class MaskConfig {
        maskBefore: boolean;
        constructor(maskBefore?: boolean, channel?: MASK_CHANNEL);
        uniformCode: string;
        uniforms: any;
        blendCode: string;
    }
    class MaskFilter extends BlendFilter {
        baseFilter: PIXI.Filter;
        config: MaskConfig;
        constructor(baseFilter: PIXI.Filter, config?: MaskConfig);
        apply(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture, clearMode: PIXI.CLEAR_MODES): void;
    }
}
declare namespace PIXI.picture {
    namespace blends {
        const NPM_BLEND = "if (b_src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n               \n        float outOp = b_src.a + b_dest.a * (1.0 - b_src.a);\n        vec3 B = b_src.rgb;\n        float Cb, Cs, result, color, D;\n        if (b_dest.a > 0.0) {\n            %NPM_BLEND%\n        }\n        b_res.rgb = B;\n        b_res.a = outOp;\n        ";
        const DARKEN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = min(Cb, Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const MULTIPLY_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = Cb * Cs;\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const COLOR_BURN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            if(Cb == 1.0) {\n                B.%rgb% = 1.0;\n            } else if(Cs == 0.0) {\n                B.%rgb% = 0.0;\n            } else {\n                result = 1.0 - min(1.0, (1.0 - Cb) / Cs);\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.%rgb% = color;\n            }";
        const LINEAR_BURN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = 0.0;\n            if((Cs + Cb) < 1.0) {\n                result = 0.0;\n            } else {\n                result = Cs + Cb - 1.0;\n            }\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const DARKER_COLOR_PART = "float cColors = b_dest.r + b_dest.g + b_dest.b;\n            float eColors = b_src.r + b_src.g + b_src.b;\n            if(cColors < eColors) {\n                result = b_dest.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_dest.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_dest.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            } else {\n                result = b_src.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_src.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_src.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            }";
        const LIGHTEN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = max(Cb, Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const SCREEN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = Cb + Cs - (Cb * Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const COLOR_DODGE_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            if(Cb == 0.0) {\n                B.%rgb% = 0.0;\n            } else if(Cs == 1.0) {\n                B.%rgb% = 1.0;\n            } else {\n                result = min(1.0, Cb / (1.0 - Cs));\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.%rgb% = color;\n            }";
        const LINEAR_DODGE_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = min(1.0, (Cs + Cb));\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const LIGHTER_COLOR_PART = "float cColors = b_dest.r + b_dest.g + b_dest.b;\n            float eColors = b_src.r + b_src.g + b_src.b;\n            if(cColors > eColors) {\n                result = b_dest.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_dest.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_dest.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            } else {\n                result = b_src.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_src.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_src.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            }";
        const OVERLAY_PART = "Cb = b_src.%rgb%;\n            Cs = b_dest.%rgb%;\n            \n            if (Cs <= 0.5) {\n                result = Cb * 2.0 * Cs;\n            } else {\n                D = 2.0 * Cs - 1.0;\n                result = Cb + D - (Cb * D);\n            }\n            \n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const SOFT_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n           \n            if (Cs <= 0.5)\n            {\n                B.%rgb% = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\n            }\n            else\n            {\n                if (Cb <= 0.25) {\n                    D = ((16.0 * Cb - 12.0) * Cb + 4.0) * Cb;    \n                } else {\n                    D = sqrt(Cb);\n                }\n                B.%rgb% = Cb + (2.0 * Cs - 1.0) * (D - Cb);\n            }";
        const HARD_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs <= 0.5) {\n                result = Cb * 2.0 * Cs;\n            } else {\n                D = 2.0 * Cs - 1.0;\n                result = Cb + D - (Cb * D);\n            }\n            \n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const VIVID_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs < 0.5) {\n                D = 2.0 * Cs;\n                \n                if(Cb == 1.0) {\n                    B.%rgb% = 1.0;\n                } else if(D == 0.0) {\n                    B.%rgb% = 0.0;\n                } else {\n                    result = 1.0 - min(1.0, (1.0 - Cb) / D);\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            } else {\n                D = 2.0 * (Cs - 0.5);\n                \n                if(Cb == 0.0) {\n                    B.%rgb% = 0.0;\n                } else if(D == 1.0) {\n                    B.%rgb% = 1.0;\n                } else {\n                    result = min(1.0, Cb / (1.0 - D));\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            }";
        const LINEAR_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs < 0.5) {\n                D = 2.0 * Cs;\n                \n                result = 0.0;\n                if((D + Cb) < 1.0) {\n                    result = 0.0;\n                } else {\n                    result = D + Cb - 1.0;\n                }\n            } else {\n                D = 2.0 * (Cs - 0.5);\n                \n                result = min(1.0, (D + Cb));\n             }\n             \n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const PIN_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs < 0.5) {\n                D = 2.0 * Cs;\n                result = min(Cb, D);\n            } else {\n                D = 2.0 * (Cs - 0.5);\n                result = max(Cb, D);\n             }\n             \n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const HARD_MIX_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs < 0.5) {\n                D = 2.0 * Cs;\n                \n                if(Cb == 1.0) {\n                    B.%rgb% = 1.0;\n                } else if(D == 0.0) {\n                    B.%rgb% = 0.0;\n                } else {\n                    result = 1.0 - min(1.0, (1.0 - Cb) / D);\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            } else {\n                D = 2.0 * (Cs - 0.5);\n                \n                if(Cb == 0.0) {\n                    B.%rgb% = 0.0;\n                } else if(D == 1.0) {\n                    B.%rgb% = 1.0;\n                } else {\n                    result = min(1.0, Cb / (1.0 - D));\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            }\n            \n            if(B.%rgb% < 0.5) {\n                B.%rgb% = 0.0;\n            } else {\n                B.%rgb% = 1.0;\n            }";
        const DIFFERENCE_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = abs(Cb - Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const EXCLUSION_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = Cs + Cb - 2.0 * Cs * Cb;\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const SUBTRACT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = max(0.0, Cb - Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const DIVIDE_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = max(0.0, min(1.0, Cb / Cs));\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const HUE_PART = "\n            // lum(cColorF)\n            float lum_cColors = 0.3 * b_dest.r + 0.59 * b_dest.g + 0.11 * b_dest.b;\n                    \n            float max3 = max(b_dest.r, max(b_dest.g, b_dest.b));\n            float min3 = min(b_dest.r, min(b_dest.g, b_dest.b));\n            // sat(cColorF)\n            float sat_cColors = max3 - min3;\n            \n            \n            // setSat(eColorF, sat(cColorF))\n            // setSat(eColorF, sat_cColors)\n            \n            //setSat start\n            float r = b_src.r;\n            float g = b_src.g;\n            float b = b_src.b;\n        \n            if (r >= g && r >= b) {\n                // Cmax = r start\n        \n                if (g >= b) {\n                    // Cmid = g, Cmin = b start\n                    if (r > b) {\n                        g = (((g - b) * sat_cColors) / (r - b));\n                        r = sat_cColors;\n                    } else {\n                        g = 0.0;\n                        r = 0.0;\n                    }\n                    b = 0.0;\n                    // Cmid = g, Cmin = b end\n                } else {\n                    // Cmid = b, Cmin = g start\n                    if (r > g) {\n                        b = (((b - g) * sat_cColors) / (r - g));\n                        r = sat_cColors;\n                    } else {\n                        b = 0.0;\n                        r = 0.0;\n                    }\n                    g = 0.0;\n                    // Cmid = b, Cmin = g end\n                }\n                // Cmax = r end\n            } else if (g >= b && g >= r) {\n                // Cmax = g start\n        \n                if (b >= r) {\n                    // Cmid = b, Cmin = r start\n                    if (g > r) {\n                        b = (((b - r) * sat_cColors) / (g - r));\n                        g = sat_cColors;\n                    } else {\n                        b = 0.0;\n                        g = 0.0;\n                    }\n                    r = 0.0;\n                    // Cmid = b, Cmin = r end\n                } else {\n                    // Cmid = r, Cmin = b start\n                    if (g > b) {\n                        r = (((r - b) * sat_cColors) / (g - b));\n                        g = sat_cColors;\n                    } else {\n                        r = 0.0;\n                        g = 0.0;\n                    }\n                    b = 0.0;\n                    // Cmid = r, Cmin = b end\n                }\n                // Cmax = g end\n            } else if (b >= r && b >= g) {\n                // Cmax = b start\n        \n                if (r >= g) {\n                    // Cmid = r, Cmin = g start\n                    if (b > g) {\n                        r = (((r - g) * sat_cColors) / (b - g));\n                        b = sat_cColors;\n                    } else {\n                        r = 0.0;\n                        b = 0.0;\n                    }\n                    g = 0.0;\n                    // Cmid = r, Cmin = g end\n                } else {\n                    // Cmid = g, Cmin = r start\n                    if (b > r) {\n                        g = (((g - r) * sat_cColors) / (b - r));\n                        b = sat_cColors;\n                    } else {\n                        g = 0.0;\n                        b = 0.0;\n                    }\n                    r = 0.0;\n                    // Cmid = g, Cmin = r end\n                }\n                // Cmax = g end\n            }\n            \n            // vec3 setSat = vec3(r,g,b);\n            //setSat end\n        \n        \n            // setLum start\n            // setLum(setSat, lum_cColors)\n            float lum_rgb = 0.3 * r + 0.59 * g + 0.11 * b;\n            float d = lum_cColors - lum_rgb;\n            r = r + d;\n            g = g + d;\n            b = b + d;\n            \n            //clip start\n            float l = 0.3 * r + 0.59 * g + 0.11 * b;\n            float n = min(r, min(g, b));\n            float x = max(r, max(g, b));\n        \n            if (n < 0.0) {\n                r = l + (((r - l) * l) / (l - n));\n                g = l + (((g - l) * l) / (l - n));\n                b = l + (((b - l) * l) / (l - n));\n            }\n            if (x > 1.0) {\n                r = l + (((r - l) * (1.0 - l)) / (x - l));\n                g = l + (((g - l) * (1.0 - l)) / (x - l));\n                b = l + (((b - l) * (1.0 - l)) / (x - l));\n            }\n            //clip end\n            // setLum start\n\n            result = r;\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.r = color;\n            \n            result = g;\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.g = color;\n            \n            result = b;\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.b = color;\n            ";
        const DARKEN_FULL: string;
        const MULTIPLY_FULL: string;
        const COLOR_BURN_FULL: string;
        const LINEAR_BURN_FULL: string;
        const DARKER_COLOR_FULL: string;
        const LIGHTEN_FULL: string;
        const SCREEN_FULL: string;
        const COLOR_DODGE_FULL: string;
        const LINEAR_DODGE_FULL: string;
        const LIGHTER_COLOR_FULL: string;
        const OVERLAY_FULL: string;
        const SOFT_LIGHT_FULL: string;
        const HARD_LIGHT_FULL: string;
        const VIVID_LIGHT_FULL: string;
        const LINEAR_LIGHT_FULL: string;
        const PIN_LIGHT_FULL: string;
        const HARD_MIX_FULL: string;
        const DIFFERENCE_FULL: string;
        const EXCLUSION_FULL: string;
        const SUBTRACT_FULL: string;
        const DIVIDE_FULL: string;
        const HUE_FULL: string;
        const blendFullArray: Array<string>;
    }
    function getBlendFilter(blendMode: PIXI.BLEND_MODES): BlendFilter;
    function getBlendFilterArray(blendMode: PIXI.BLEND_MODES): BlendFilter[];
}
declare namespace PIXI.picture {
    class Sprite extends PIXI.Sprite {
        _render(renderer: PIXI.Renderer): void;
    }
}
declare namespace PIXI.picture {
    class TilingSprite extends PIXI.TilingSprite {
        _render(renderer: PIXI.Renderer): void;
    }
}
declare namespace PIXI.picture {
}
