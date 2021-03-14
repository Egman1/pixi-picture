/// <reference types="pixi.js" />
declare namespace pixi_picture {
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
declare namespace pixi_picture {
}
declare namespace pixi_picture {
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
declare namespace pixi_picture {
    namespace blends {
        enum CUSTOM_BLEND_MODES {
            DARKEN = 5,
            MULTIPLY = 6,
            COLOR_BURN = 7,
            LINEAR_BURN = 8,
            DARKER_COLOR = 9,
            LIGHTEN = 10,
            SCREEN = 11,
            COLOR_DODGE = 12,
            LINEAR_DODGE = 13,
            LIGHTER_COLOR = 14,
            OVERLAY = 15,
            SOFT_LIGHT = 16,
            HARD_LIGHT = 17,
            VIVID_LIGHT = 18,
            LINEAR_LIGHT = 19,
            PIN_LIGHT = 20,
            HARD_MIX = 21,
            DIFFERENCE = 22,
            EXCLUSION = 23,
            SUBTRACT = 24,
            DIVIDE = 25,
            HUE = 26,
            SATURATION = 27,
            COLOR = 28,
            LUMINOSITY = 29
        }
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
        const SOFT_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n           \n            if (Cs <= 0.5)\n            {\n                B.%rgb% = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\n            }\n            else\n            {\n                if (Cb <= 0.25) {\n                    D = ((16.0 * Cb - 12.0) * Cb + 4.0) * Cb;    \n                } else {\n                    D = sqrt(Cb);\n                }\n                B.%rgb% = Cb + (2.0 * Cs - 1.0) * (D - Cb);\n            }";
        const HARD_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs <= 0.5) {\n                result = Cb * 2.0 * Cs;\n            } else {\n                D = 2.0 * Cs - 1.0;\n                result = Cb + D - (Cb * D);\n            }\n            \n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        const VIVID_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs < 0.5) {\n                D = 2.0 * Cs;\n                \n                if(Cb == 1.0) {\n                    B.%rgb% = 1.0;\n                } else if(D == 0.0) {\n                    B.%rgb% = 0.0;\n                } else {\n                    result = 1.0 - min(1.0, (1.0 - Cb) / D);\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            } else {\n                D = 2.0 * (Cs - 0.5);\n                \n                if(Cb == 0.0) {\n                    B.%rgb% = 0.0;\n                } else if(D == 1.0) {\n                    B.%rgb% = 1.0;\n                } else {\n                    result = min(1.0, Cb / (1.0 - D));\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            }";
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
        const SOFT_LIGHT_FULL: string;
        const HARD_LIGHT_FULL: string;
        const VIVID_LIGHT_FULL: string;
        const blendFullArray: Array<string>;
    }
    function getBlendFilter(blendMode: PIXI.BLEND_MODES): BlendFilter;
    function getBlendFilterArray(blendMode: PIXI.BLEND_MODES): BlendFilter[];
}
declare namespace pixi_picture {
    class Sprite extends PIXI.Sprite {
        _render(renderer: PIXI.Renderer): void;
    }
}
declare namespace pixi_picture {
    class TilingSprite extends PIXI.TilingSprite {
        _render(renderer: PIXI.Renderer): void;
    }
}
declare namespace pixi_picture {
}
