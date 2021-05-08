namespace pixi_picture {
    export namespace blends {

        export const NPM_BLEND =
        `if (b_src.a == 0.0) {
            gl_FragColor = vec4(0, 0, 0, 0);
            return;
        }
               
        float outOp = b_src.a + b_dest.a * (1.0 - b_src.a);
        vec3 B = b_src.rgb;
        float Cb, Cs, result, color, D;
        if (b_dest.a > 0.0) {
            %NPM_BLEND%
        }
        b_res.rgb = B;
        b_res.a = outOp;
        `;

        export const DARKEN_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = min(Cb, Cs);
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const MULTIPLY_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = Cb * Cs;
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const COLOR_BURN_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            if(Cb == 1.0) {
                B.%rgb% = 1.0;
            } else if(Cs == 0.0) {
                B.%rgb% = 0.0;
            } else {
                result = 1.0 - min(1.0, (1.0 - Cb) / Cs);
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.%rgb% = color;
            }`;

        export const LINEAR_BURN_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = 0.0;
            if((Cs + Cb) < 1.0) {
                result = 0.0;
            } else {
                result = Cs + Cb - 1.0;
            }
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const DARKER_COLOR_PART =
            `float cColors = b_dest.r + b_dest.g + b_dest.b;
            float eColors = b_src.r + b_src.g + b_src.b;
            if(cColors < eColors) {
                result = b_dest.r;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.r = color;
                
                result = b_dest.g;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.g = color;
                
                result = b_dest.b;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.b = color;
            } else {
                result = b_src.r;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.r = color;
                
                result = b_src.g;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.g = color;
                
                result = b_src.b;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.b = color;
            }`;

        export const LIGHTEN_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = max(Cb, Cs);
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const SCREEN_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = Cb + Cs - (Cb * Cs);
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const COLOR_DODGE_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            if(Cb == 0.0) {
                B.%rgb% = 0.0;
            } else if(Cs == 1.0) {
                B.%rgb% = 1.0;
            } else {
                result = min(1.0, Cb / (1.0 - Cs));
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.%rgb% = color;
            }`;

        export const LINEAR_DODGE_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = min(1.0, (Cs + Cb));
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const LIGHTER_COLOR_PART =
            `float cColors = b_dest.r + b_dest.g + b_dest.b;
            float eColors = b_src.r + b_src.g + b_src.b;
            if(cColors > eColors) {
                result = b_dest.r;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.r = color;
                
                result = b_dest.g;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.g = color;
                
                result = b_dest.b;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.b = color;
            } else {
                result = b_src.r;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.r = color;
                
                result = b_src.g;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.g = color;
                
                result = b_src.b;
                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
                B.b = color;
            }`;

        export const OVERLAY_PART =
            `Cb = b_src.%rgb%;
            Cs = b_dest.%rgb%;
            
            if (Cs <= 0.5) {
                result = Cb * 2.0 * Cs;
            } else {
                D = 2.0 * Cs - 1.0;
                result = Cb + D - (Cb * D);
            }
            
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const SOFT_LIGHT_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
           
            if (Cs <= 0.5)
            {
                B.%rgb% = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);
            }
            else
            {
                if (Cb <= 0.25) {
                    D = ((16.0 * Cb - 12.0) * Cb + 4.0) * Cb;    
                } else {
                    D = sqrt(Cb);
                }
                B.%rgb% = Cb + (2.0 * Cs - 1.0) * (D - Cb);
            }`;

        export const HARD_LIGHT_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            
            if (Cs <= 0.5) {
                result = Cb * 2.0 * Cs;
            } else {
                D = 2.0 * Cs - 1.0;
                result = Cb + D - (Cb * D);
            }
            
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const VIVID_LIGHT_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            
            if (Cs < 0.5) {
                D = 2.0 * Cs;
                
                if(Cb == 1.0) {
                    B.%rgb% = 1.0;
                } else if(D == 0.0) {
                    B.%rgb% = 0.0;
                } else {
                    result = 1.0 - min(1.0, (1.0 - Cb) / D);
                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);
                    B.%rgb% = color;
                }
            } else {
                D = 2.0 * (Cs - 0.5);
                
                if(Cb == 0.0) {
                    B.%rgb% = 0.0;
                } else if(D == 1.0) {
                    B.%rgb% = 1.0;
                } else {
                    result = min(1.0, Cb / (1.0 - D));
                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);
                    B.%rgb% = color;
                }
            }`;

        export const LINEAR_LIGHT_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            
            if (Cs < 0.5) {
                D = 2.0 * Cs;
                
                result = 0.0;
                if((D + Cb) < 1.0) {
                    result = 0.0;
                } else {
                    result = D + Cb - 1.0;
                }
            } else {
                D = 2.0 * (Cs - 0.5);
                
                result = min(1.0, (D + Cb));
             }
             
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const PIN_LIGHT_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            
            if (Cs < 0.5) {
                D = 2.0 * Cs;
                result = min(Cb, D);
            } else {
                D = 2.0 * (Cs - 0.5);
                result = max(Cb, D);
             }
             
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const HARD_MIX_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            
            if (Cs < 0.5) {
                D = 2.0 * Cs;
                
                if(Cb == 1.0) {
                    B.%rgb% = 1.0;
                } else if(D == 0.0) {
                    B.%rgb% = 0.0;
                } else {
                    result = 1.0 - min(1.0, (1.0 - Cb) / D);
                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);
                    B.%rgb% = color;
                }
            } else {
                D = 2.0 * (Cs - 0.5);
                
                if(Cb == 0.0) {
                    B.%rgb% = 0.0;
                } else if(D == 1.0) {
                    B.%rgb% = 1.0;
                } else {
                    result = min(1.0, Cb / (1.0 - D));
                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);
                    B.%rgb% = color;
                }
            }
            
            if(B.%rgb% < 0.5) {
                B.%rgb% = 0.0;
            } else {
                B.%rgb% = 1.0;
            }`;

        export const DIFFERENCE_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = abs(Cb - Cs);
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const EXCLUSION_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = Cs + Cb - 2.0 * Cs * Cb;
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const SUBTRACT_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = max(0.0, Cb - Cs);
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;

        export const DIVIDE_PART =
            `Cb = b_dest.%rgb%;
            Cs = b_src.%rgb%;
            result = max(0.0, min(1.0, Cb / Cs));
            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);
            B.%rgb% = color;`;


        export const DARKEN_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [DARKEN_PART.replace(/%rgb%/g, 'r'), DARKEN_PART.replace(/%rgb%/g, 'g'), DARKEN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const MULTIPLY_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [MULTIPLY_PART.replace(/%rgb%/g, 'r'), MULTIPLY_PART.replace(/%rgb%/g, 'g'), MULTIPLY_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const COLOR_BURN_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [COLOR_BURN_PART.replace(/%rgb%/g, 'r'), COLOR_BURN_PART.replace(/%rgb%/g, 'g'), COLOR_BURN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const LINEAR_BURN_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [LINEAR_BURN_PART.replace(/%rgb%/g, 'r'), LINEAR_BURN_PART.replace(/%rgb%/g, 'g'), LINEAR_BURN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const DARKER_COLOR_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, DARKER_COLOR_PART);
        export const LIGHTEN_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [LIGHTEN_PART.replace(/%rgb%/g, 'r'), LIGHTEN_PART.replace(/%rgb%/g, 'g'), LIGHTEN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const SCREEN_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [SCREEN_PART.replace(/%rgb%/g, 'r'), SCREEN_PART.replace(/%rgb%/g, 'g'), SCREEN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const COLOR_DODGE_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [COLOR_DODGE_PART.replace(/%rgb%/g, 'r'), COLOR_DODGE_PART.replace(/%rgb%/g, 'g'), COLOR_DODGE_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const LINEAR_DODGE_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [LINEAR_DODGE_PART.replace(/%rgb%/g, 'r'), LINEAR_DODGE_PART.replace(/%rgb%/g, 'g'), LINEAR_DODGE_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const LIGHTER_COLOR_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, LIGHTER_COLOR_PART);
        export const OVERLAY_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [OVERLAY_PART.replace(/%rgb%/g, 'r'), OVERLAY_PART.replace(/%rgb%/g, 'g'), OVERLAY_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const SOFT_LIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [SOFT_LIGHT_PART.replace(/%rgb%/g, 'r'), SOFT_LIGHT_PART.replace(/%rgb%/g, 'g'), SOFT_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const HARD_LIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [HARD_LIGHT_PART.replace(/%rgb%/g, 'r'), HARD_LIGHT_PART.replace(/%rgb%/g, 'g'), HARD_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const VIVID_LIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [VIVID_LIGHT_PART.replace(/%rgb%/g, 'r'), VIVID_LIGHT_PART.replace(/%rgb%/g, 'g'), VIVID_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const LINEAR_LIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [LINEAR_LIGHT_PART.replace(/%rgb%/g, 'r'), LINEAR_LIGHT_PART.replace(/%rgb%/g, 'g'), LINEAR_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const PIN_LIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [PIN_LIGHT_PART.replace(/%rgb%/g, 'r'), PIN_LIGHT_PART.replace(/%rgb%/g, 'g'), PIN_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const HARD_MIX_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [HARD_MIX_PART.replace(/%rgb%/g, 'r'), HARD_MIX_PART.replace(/%rgb%/g, 'g'), HARD_MIX_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const DIFFERENCE_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [DIFFERENCE_PART.replace(/%rgb%/g, 'r'), DIFFERENCE_PART.replace(/%rgb%/g, 'g'), DIFFERENCE_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const EXCLUSION_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [EXCLUSION_PART.replace(/%rgb%/g, 'r'), EXCLUSION_PART.replace(/%rgb%/g, 'g'), EXCLUSION_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const SUBTRACT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [SUBTRACT_PART.replace(/%rgb%/g, 'r'), SUBTRACT_PART.replace(/%rgb%/g, 'g'), SUBTRACT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        export const DIVIDE_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, [DIVIDE_PART.replace(/%rgb%/g, 'r'), DIVIDE_PART.replace(/%rgb%/g, 'g'), DIVIDE_PART.replace(/%rgb%/g, 'b')].join('\n'));

        export const blendFullArray: Array<string> = [];

        blendFullArray[PIXI.BLEND_MODES.DARKEN] = DARKEN_FULL;
        blendFullArray[PIXI.BLEND_MODES.MULTIPLY] = MULTIPLY_FULL;
        blendFullArray[PIXI.BLEND_MODES.COLOR_BURN] = COLOR_BURN_FULL;
        blendFullArray[PIXI.BLEND_MODES.LINEAR_BURN] = LINEAR_BURN_FULL;
        blendFullArray[PIXI.BLEND_MODES.DARKER_COLOR] = DARKER_COLOR_FULL;
        blendFullArray[PIXI.BLEND_MODES.LIGHTEN] = LIGHTEN_FULL;
        blendFullArray[PIXI.BLEND_MODES.SCREEN] = SCREEN_FULL;
        blendFullArray[PIXI.BLEND_MODES.COLOR_DODGE] = COLOR_DODGE_FULL;
        blendFullArray[PIXI.BLEND_MODES.LINEAR_DODGE] = LINEAR_DODGE_FULL;
        blendFullArray[PIXI.BLEND_MODES.LIGHTER_COLOR] = LIGHTER_COLOR_FULL;
        blendFullArray[PIXI.BLEND_MODES.OVERLAY] = OVERLAY_FULL;
        blendFullArray[PIXI.BLEND_MODES.SOFT_LIGHT] = SOFT_LIGHT_FULL;
        blendFullArray[PIXI.BLEND_MODES.HARD_LIGHT] = HARD_LIGHT_FULL;
        blendFullArray[PIXI.BLEND_MODES.VIVID_LIGHT] = VIVID_LIGHT_FULL;
        blendFullArray[PIXI.BLEND_MODES.LINEAR_LIGHT] = LINEAR_LIGHT_FULL;
        blendFullArray[PIXI.BLEND_MODES.PIN_LIGHT] = PIN_LIGHT_FULL;
        blendFullArray[PIXI.BLEND_MODES.HARD_MIX] = HARD_MIX_FULL;
        blendFullArray[PIXI.BLEND_MODES.DIFFERENCE] = DIFFERENCE_FULL;
        blendFullArray[PIXI.BLEND_MODES.EXCLUSION] = EXCLUSION_FULL;
        blendFullArray[PIXI.BLEND_MODES.SUBTRACT] = SUBTRACT_FULL;
        blendFullArray[PIXI.BLEND_MODES.DIVIDE] = DIVIDE_FULL;
    }

    let filterCache: Array<BlendFilter> = [];
    let filterCacheArray: Array<Array<BlendFilter>> = [];

    export function getBlendFilter(blendMode: PIXI.BLEND_MODES) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCache[blendMode]) {
            filterCache[blendMode] = new BlendFilter({blendCode: blends.blendFullArray[blendMode]});
        }
        return filterCache[blendMode];
    }

    export function getBlendFilterArray(blendMode: PIXI.BLEND_MODES) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCacheArray[blendMode]) {
            filterCacheArray[blendMode] = [this.getBlendFilter(blendMode)];
        }
        return filterCacheArray[blendMode];
    }
}