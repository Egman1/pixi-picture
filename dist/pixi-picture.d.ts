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
            MULTIPLY = 5
        }
        const NPM_BLEND = "if (b_src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n        vec3 Cb = b_src.rgb / b_src.a, Cs;\n        if (b_dest.a > 0.0) {\n            Cs = b_dest.rgb / b_dest.a;\n        }\n        \n        float outOp = b_src.a + b_dest.a * (1.0 - b_src.a);\n        vec3 B = b_src.rgb;\n        float cCA, eCA, result, color;\n        if (b_dest.a > 0.0) {\n            %NPM_BLEND%\n        }\n        b_res.rgb = B;\n        b_res.a = outOp;\n        ";
        const MULTIPLY_PART = "cCA = b_dest.r;\n            eCA = b_src.r;\n            result = cCA * eCA;\n            color = (1.0 - b_src.a / outOp) * cCA + b_src.a / outOp * ((1.0 - b_dest.a) * eCA + b_dest.a * result);\n            B.r = color;\n            \n            cCA = b_dest.g;\n            eCA = b_src.g;\n            result = cCA * eCA;\n            color = (1.0 - b_src.a / outOp) * cCA + b_src.a / outOp * ((1.0 - b_dest.a) * eCA + b_dest.a * result);\n            B.g = color;\n            \n            cCA = b_dest.b;\n            eCA = b_src.b;\n            result = cCA * eCA;\n            color = (1.0 - b_src.a / outOp) * cCA + b_src.a / outOp * ((1.0 - b_dest.a) * eCA + b_dest.a * result);\n            B.b = color;\n        ";
        const OVERLAY_PART = "vec3 multiply = Cb * Cs * 2.0;\nvec3 Cb2 = Cb * 2.0 - 1.0;\nvec3 screen = Cb2 + Cs - Cb2 * Cs;\nvec3 B;\nif (Cs.r <= 0.5) {\n    B.r = multiply.r;\n} else {\n    B.r = screen.r;\n}\nif (Cs.g <= 0.5) {\n    B.g = multiply.g;\n} else {\n    B.g = screen.g;\n}\nif (Cs.b <= 0.5) {\n    B.b = multiply.b;\n} else {\n    B.b = screen.b;\n}\n";
        const HARDLIGHT_PART = "vec3 multiply = Cb * Cs * 2.0;\nvec3 Cs2 = Cs * 2.0 - 1.0;\nvec3 screen = Cb + Cs2 - Cb * Cs2;\nvec3 B;\nif (Cb.r <= 0.5) {\n    B.r = multiply.r;\n} else {\n    B.r = screen.r;\n}\nif (Cb.g <= 0.5) {\n    B.g = multiply.g;\n} else {\n    B.g = screen.g;\n}\nif (Cb.b <= 0.5) {\n    B.b = multiply.b;\n} else {\n    B.b = screen.b;\n}\n";
        const SOFTLIGHT_PART = "vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\nvec3 B;\nvec3 D;\nif (Cs.r <= 0.5)\n{\n    B.r = first.r;\n}\nelse\n{\n    if (Cb.r <= 0.25)\n    {\n        D.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    \n    }\n    else\n    {\n        D.r = sqrt(Cb.r);\n    }\n    B.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);\n}\nif (Cs.g <= 0.5)\n{\n    B.g = first.g;\n}\nelse\n{\n    if (Cb.g <= 0.25)\n    {\n        D.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    \n    }\n    else\n    {\n        D.g = sqrt(Cb.g);\n    }\n    B.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);\n}\nif (Cs.b <= 0.5)\n{\n    B.b = first.b;\n}\nelse\n{\n    if (Cb.b <= 0.25)\n    {\n        D.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    \n    }\n    else\n    {\n        D.b = sqrt(Cb.b);\n    }\n    B.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);\n}\n";
        const MULTIPLY_FULL: string;
        const OVERLAY_FULL: string;
        const HARDLIGHT_FULL: string;
        const SOFTLIGHT_FULL: string;
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
