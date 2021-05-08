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
