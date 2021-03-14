var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pixi_picture;
(function (pixi_picture) {
    var BackdropFilter = (function (_super) {
        __extends(BackdropFilter, _super);
        function BackdropFilter() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.backdropUniformName = null;
            _this._backdropActive = false;
            _this.clearColor = null;
            return _this;
        }
        return BackdropFilter;
    }(PIXI.Filter));
    pixi_picture.BackdropFilter = BackdropFilter;
    var filterFrag = "\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform sampler2D uBackdrop;\n\n%UNIFORM_CODE%\n\nvoid main(void)\n{\n   vec4 b_src = texture2D(uSampler, vTextureCoord);\n   vec4 b_dest = texture2D(uBackdrop, vTextureCoord);\n   vec4 b_res = b_dest;\n   \n   %BLEND_CODE%\n\n   gl_FragColor = b_res;\n}";
    var BlendFilter = (function (_super) {
        __extends(BlendFilter, _super);
        function BlendFilter(shaderParts) {
            var _this = this;
            var fragCode = filterFrag;
            fragCode = fragCode.replace('%UNIFORM_CODE%', shaderParts.uniformCode || "");
            fragCode = fragCode.replace('%BLEND_CODE%', shaderParts.blendCode || "");
            _this = _super.call(this, undefined, fragCode, shaderParts.uniforms) || this;
            _this.backdropUniformName = 'uBackdrop';
            return _this;
        }
        return BlendFilter;
    }(BackdropFilter));
    pixi_picture.BlendFilter = BlendFilter;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    function containsRect(rectOut, rectIn) {
        var r1 = rectIn.x + rectIn.width;
        var b1 = rectIn.y + rectIn.height;
        var r2 = rectOut.x + rectOut.width;
        var b2 = rectOut.y + rectOut.height;
        return (rectIn.x >= rectOut.x) &&
            (rectIn.x <= r2) &&
            (rectIn.y >= rectOut.y) &&
            (rectIn.y <= b2) &&
            (r1 >= rectOut.x) &&
            (r1 <= r2) &&
            (b1 >= rectOut.y) &&
            (b1 <= b2);
    }
    PIXI.systems.TextureSystem.prototype.bindForceLocation = function (texture, location) {
        if (location === void 0) { location = 0; }
        var gl = this.gl;
        if (this.currentLocation !== location) {
            this.currentLocation = location;
            gl.activeTexture(gl.TEXTURE0 + location);
        }
        this.bind(texture, location);
    };
    function pushWithCheck(target, filters, checkEmptyBounds) {
        if (checkEmptyBounds === void 0) { checkEmptyBounds = true; }
        var renderer = this.renderer;
        var filterStack = this.defaultFilterStack;
        var state = this.statePool.pop() || new PIXI.FilterState();
        var resolution = filters[0].resolution;
        var padding = filters[0].padding;
        var autoFit = filters[0].autoFit;
        var legacy = filters[0].legacy;
        for (var i = 1; i < filters.length; i++) {
            var filter = filters[i];
            resolution = Math.min(resolution, filter.resolution);
            padding = this.useMaxPadding
                ? Math.max(padding, filter.padding)
                : padding + filter.padding;
            autoFit = autoFit || filter.autoFit;
            legacy = legacy || filter.legacy;
        }
        if (filterStack.length === 1) {
            this.defaultFilterStack[0].renderTexture = renderer.renderTexture.current;
        }
        filterStack.push(state);
        state.resolution = resolution;
        state.legacy = legacy;
        state.target = target;
        state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));
        var canUseBackdrop = true;
        state.sourceFrame.pad(padding);
        if (autoFit) {
            state.sourceFrame.fit(this.renderer.renderTexture.sourceFrame);
        }
        else {
            canUseBackdrop = containsRect(this.renderer.renderTexture.sourceFrame, state.sourceFrame);
        }
        if (checkEmptyBounds && state.sourceFrame.width <= 1 && state.sourceFrame.height <= 1) {
            filterStack.pop();
            state.clear();
            this.statePool.push(state);
            return false;
        }
        state.sourceFrame.ceil(resolution);
        if (canUseBackdrop) {
            var backdrop = null;
            for (var i = 0; i < filters.length; i++) {
                var bName = filters[i].backdropUniformName;
                if (bName) {
                    if (backdrop === null) {
                        backdrop = this.prepareBackdrop(state.sourceFrame);
                    }
                    filters[i].uniforms[bName] = backdrop;
                    if (backdrop) {
                        filters[i]._backdropActive = true;
                    }
                }
            }
        }
        state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution);
        state.filters = filters;
        state.destinationFrame.width = state.renderTexture.width;
        state.destinationFrame.height = state.renderTexture.height;
        var destinationFrame = this.tempRect;
        destinationFrame.width = state.sourceFrame.width;
        destinationFrame.height = state.sourceFrame.height;
        state.renderTexture.filterFrame = state.sourceFrame;
        renderer.renderTexture.bind(state.renderTexture, state.sourceFrame, destinationFrame);
        renderer.renderTexture.clear(filters[filters.length - 1].clearColor);
        return true;
    }
    function push(target, filters) {
        return this.pushWithCheck(target, filters, false);
    }
    function pop() {
        var filterStack = this.defaultFilterStack;
        var state = filterStack.pop();
        var filters = state.filters;
        this.activeState = state;
        var globalUniforms = this.globalUniforms.uniforms;
        globalUniforms.outputFrame = state.sourceFrame;
        globalUniforms.resolution = state.resolution;
        var inputSize = globalUniforms.inputSize;
        var inputPixel = globalUniforms.inputPixel;
        var inputClamp = globalUniforms.inputClamp;
        inputSize[0] = state.destinationFrame.width;
        inputSize[1] = state.destinationFrame.height;
        inputSize[2] = 1.0 / inputSize[0];
        inputSize[3] = 1.0 / inputSize[1];
        inputPixel[0] = inputSize[0] * state.resolution;
        inputPixel[1] = inputSize[1] * state.resolution;
        inputPixel[2] = 1.0 / inputPixel[0];
        inputPixel[3] = 1.0 / inputPixel[1];
        inputClamp[0] = 0.5 * inputPixel[2];
        inputClamp[1] = 0.5 * inputPixel[3];
        inputClamp[2] = (state.sourceFrame.width * inputSize[2]) - (0.5 * inputPixel[2]);
        inputClamp[3] = (state.sourceFrame.height * inputSize[3]) - (0.5 * inputPixel[3]);
        if (state.legacy) {
            var filterArea = globalUniforms.filterArea;
            filterArea[0] = state.destinationFrame.width;
            filterArea[1] = state.destinationFrame.height;
            filterArea[2] = state.sourceFrame.x;
            filterArea[3] = state.sourceFrame.y;
            globalUniforms.filterClamp = globalUniforms.inputClamp;
        }
        this.globalUniforms.update();
        var lastState = filterStack[filterStack.length - 1];
        if (state.renderTexture.framebuffer.multisample > 1) {
            this.renderer.framebuffer.blit();
        }
        if (filters.length === 1) {
            filters[0].apply(this, state.renderTexture, lastState.renderTexture, PIXI.CLEAR_MODES.BLEND, state);
            this.returnFilterTexture(state.renderTexture);
        }
        else {
            var flip = state.renderTexture;
            var flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution);
            flop.filterFrame = flip.filterFrame;
            var i = 0;
            for (i = 0; i < filters.length - 1; ++i) {
                filters[i].apply(this, flip, flop, PIXI.CLEAR_MODES.CLEAR, state);
                var t = flip;
                flip = flop;
                flop = t;
            }
            filters[i].apply(this, flip, lastState.renderTexture, PIXI.CLEAR_MODES.BLEND, state);
            this.returnFilterTexture(flip);
            this.returnFilterTexture(flop);
        }
        var backdropFree = false;
        for (var i = 0; i < filters.length; i++) {
            if (filters[i]._backdropActive) {
                var bName = filters[i].backdropUniformName;
                if (!backdropFree) {
                    this.returnFilterTexture(filters[i].uniforms[bName]);
                    backdropFree = true;
                }
                filters[i].uniforms[bName] = null;
                filters[i]._backdropActive = false;
            }
        }
        state.clear();
        this.statePool.push(state);
    }
    var hadBackbufferError = false;
    function prepareBackdrop(bounds) {
        var renderer = this.renderer;
        var renderTarget = renderer.renderTexture.current;
        var fr = this.renderer.renderTexture.sourceFrame;
        if (!renderTarget) {
            if (!hadBackbufferError) {
                hadBackbufferError = true;
                console.warn('pixi-picture: you are trying to use Blend Filter on main framebuffer! That wont work.');
            }
            return null;
        }
        var resolution = renderTarget.baseTexture.resolution;
        var x = (bounds.x - fr.x) * resolution;
        var y = (bounds.y - fr.y) * resolution;
        var w = (bounds.width) * resolution;
        var h = (bounds.height) * resolution;
        var gl = renderer.gl;
        var rt = this.getOptimalFilterTexture(w, h, 1);
        rt.filterFrame = fr;
        renderer.texture.bindForceLocation(rt.baseTexture, 0);
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x, y, w, h);
        return rt;
    }
    PIXI.systems.FilterSystem.prototype.push = push;
    PIXI.systems.FilterSystem.prototype.pushWithCheck = pushWithCheck;
    PIXI.systems.FilterSystem.prototype.pop = pop;
    PIXI.systems.FilterSystem.prototype.prepareBackdrop = prepareBackdrop;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var MASK_CHANNEL;
    (function (MASK_CHANNEL) {
        MASK_CHANNEL[MASK_CHANNEL["RED"] = 0] = "RED";
        MASK_CHANNEL[MASK_CHANNEL["GREEN"] = 1] = "GREEN";
        MASK_CHANNEL[MASK_CHANNEL["BLUE"] = 2] = "BLUE";
        MASK_CHANNEL[MASK_CHANNEL["ALPHA"] = 3] = "ALPHA";
    })(MASK_CHANNEL = pixi_picture.MASK_CHANNEL || (pixi_picture.MASK_CHANNEL = {}));
    var MaskConfig = (function () {
        function MaskConfig(maskBefore, channel) {
            if (maskBefore === void 0) { maskBefore = false; }
            if (channel === void 0) { channel = MASK_CHANNEL.ALPHA; }
            this.maskBefore = maskBefore;
            this.uniformCode = 'uniform vec4 uChannel;';
            this.uniforms = {
                uChannel: new Float32Array([0, 0, 0, 0]),
            };
            this.blendCode = "b_res = dot(b_src, uChannel) * b_dest;";
            this.uniforms.uChannel[channel] = 1.0;
        }
        return MaskConfig;
    }());
    pixi_picture.MaskConfig = MaskConfig;
    var MaskFilter = (function (_super) {
        __extends(MaskFilter, _super);
        function MaskFilter(baseFilter, config) {
            if (config === void 0) { config = new MaskConfig(); }
            var _this = _super.call(this, config) || this;
            _this.baseFilter = baseFilter;
            _this.config = config;
            _this.padding = baseFilter.padding;
            return _this;
        }
        MaskFilter.prototype.apply = function (filterManager, input, output, clearMode) {
            var target = filterManager.getFilterTexture(input);
            if (this.config.maskBefore) {
                var blendMode = this.state.blendMode;
                this.state.blendMode = PIXI.BLEND_MODES.NONE;
                filterManager.applyFilter(this, input, target, PIXI.CLEAR_MODES.YES);
                this.baseFilter.blendMode = blendMode;
                this.baseFilter.apply(filterManager, target, output, clearMode);
                this.state.blendMode = blendMode;
            }
            else {
                var uBackdrop = this.uniforms.uBackdrop;
                this.baseFilter.apply(filterManager, uBackdrop, target, PIXI.CLEAR_MODES.YES);
                this.uniforms.uBackdrop = target;
                filterManager.applyFilter(this, input, output, clearMode);
                this.uniforms.uBackdrop = uBackdrop;
            }
            filterManager.returnFilterTexture(target);
        };
        return MaskFilter;
    }(pixi_picture.BlendFilter));
    pixi_picture.MaskFilter = MaskFilter;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var blends;
    (function (blends) {
        var CUSTOM_BLEND_MODES;
        (function (CUSTOM_BLEND_MODES) {
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["DARKEN"] = 5] = "DARKEN";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["MULTIPLY"] = 6] = "MULTIPLY";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["COLOR_BURN"] = 7] = "COLOR_BURN";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["LINEAR_BURN"] = 8] = "LINEAR_BURN";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["DARKER_COLOR"] = 9] = "DARKER_COLOR";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["LIGHTEN"] = 10] = "LIGHTEN";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["SCREEN"] = 11] = "SCREEN";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["COLOR_DODGE"] = 12] = "COLOR_DODGE";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["LINEAR_DODGE"] = 13] = "LINEAR_DODGE";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["LIGHTER_COLOR"] = 14] = "LIGHTER_COLOR";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["OVERLAY"] = 15] = "OVERLAY";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["SOFT_LIGHT"] = 16] = "SOFT_LIGHT";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["HARD_LIGHT"] = 17] = "HARD_LIGHT";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["VIVID_LIGHT"] = 18] = "VIVID_LIGHT";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["LINEAR_LIGHT"] = 19] = "LINEAR_LIGHT";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["PIN_LIGHT"] = 20] = "PIN_LIGHT";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["HARD_MIX"] = 21] = "HARD_MIX";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["DIFFERENCE"] = 22] = "DIFFERENCE";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["EXCLUSION"] = 23] = "EXCLUSION";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["SUBTRACT"] = 24] = "SUBTRACT";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["DIVIDE"] = 25] = "DIVIDE";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["HUE"] = 26] = "HUE";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["SATURATION"] = 27] = "SATURATION";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["COLOR"] = 28] = "COLOR";
            CUSTOM_BLEND_MODES[CUSTOM_BLEND_MODES["LUMINOSITY"] = 29] = "LUMINOSITY";
        })(CUSTOM_BLEND_MODES = blends.CUSTOM_BLEND_MODES || (blends.CUSTOM_BLEND_MODES = {}));
        blends.NPM_BLEND = "if (b_src.a == 0.0) {\n            gl_FragColor = vec4(0, 0, 0, 0);\n            return;\n        }\n               \n        float outOp = b_src.a + b_dest.a * (1.0 - b_src.a);\n        vec3 B = b_src.rgb;\n        float Cb, Cs, result, color, D;\n        if (b_dest.a > 0.0) {\n            %NPM_BLEND%\n        }\n        b_res.rgb = B;\n        b_res.a = outOp;\n        ";
        blends.DARKEN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = min(Cb, Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        blends.MULTIPLY_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = Cb * Cs;\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        blends.COLOR_BURN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            if(Cb == 1.0) {\n                B.%rgb% = 1.0;\n            } else if(Cs == 0.0) {\n                B.%rgb% = 0.0;\n            } else {\n                result = 1.0 - min(1.0, (1.0 - Cb) / Cs);\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.%rgb% = color;\n            }";
        blends.LINEAR_BURN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = 0.0;\n            if((Cs + Cb) < 1.0) {\n                result = 0.0;\n            } else {\n                result = Cs + Cb - 1.0;\n            }\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        blends.DARKER_COLOR_PART = "float cColors = b_dest.r + b_dest.g + b_dest.b;\n            float eColors = b_src.r + b_src.g + b_src.b;\n            if(cColors < eColors) {\n                result = b_dest.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_dest.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_dest.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            } else {\n                result = b_src.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_src.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_src.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            }";
        blends.LIGHTEN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = max(Cb, Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        blends.SCREEN_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = Cb + Cs - (Cb * Cs);\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        blends.COLOR_DODGE_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            if(Cb == 0.0) {\n                B.%rgb% = 0.0;\n            } else if(Cs == 1.0) {\n                B.%rgb% = 1.0;\n            } else {\n                result = min(1.0, Cb / (1.0 - Cs));\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.%rgb% = color;\n            }";
        blends.LINEAR_DODGE_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            result = min(1.0, (Cs + Cb));\n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        blends.LIGHTER_COLOR_PART = "float cColors = b_dest.r + b_dest.g + b_dest.b;\n            float eColors = b_src.r + b_src.g + b_src.b;\n            if(cColors > eColors) {\n                result = b_dest.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_dest.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_dest.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            } else {\n                result = b_src.r;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.r = color;\n                \n                result = b_src.g;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.g = color;\n                \n                result = b_src.b;\n                color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n                B.b = color;\n            }";
        blends.SOFT_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n           \n            if (Cs <= 0.5)\n            {\n                B.%rgb% = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\n            }\n            else\n            {\n                if (Cb <= 0.25) {\n                    D = ((16.0 * Cb - 12.0) * Cb + 4.0) * Cb;    \n                } else {\n                    D = sqrt(Cb);\n                }\n                B.%rgb% = Cb + (2.0 * Cs - 1.0) * (D - Cb);\n            }";
        blends.HARD_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs <= 0.5) {\n                result = Cb * 2.0 * Cs;\n            } else {\n                D = 2.0 * Cs - 1.0;\n                result = Cb + D - (Cb * D);\n            }\n            \n            color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * Cs + b_dest.a * result);\n            B.%rgb% = color;";
        blends.VIVID_LIGHT_PART = "Cb = b_dest.%rgb%;\n            Cs = b_src.%rgb%;\n            \n            if (Cs < 0.5) {\n                D = 2.0 * Cs;\n                \n                if(Cb == 1.0) {\n                    B.%rgb% = 1.0;\n                } else if(D == 0.0) {\n                    B.%rgb% = 0.0;\n                } else {\n                    result = 1.0 - min(1.0, (1.0 - Cb) / D);\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            } else {\n                D = 2.0 * (Cs - 0.5);\n                \n                if(Cb == 0.0) {\n                    B.%rgb% = 0.0;\n                } else if(D == 1.0) {\n                    B.%rgb% = 1.0;\n                } else {\n                    result = min(1.0, Cb / (1.0 - D));\n                    color = (1.0 - b_src.a / outOp) * Cb + b_src.a / outOp * ((1.0 - b_dest.a) * D + b_dest.a * result);\n                    B.%rgb% = color;\n                }\n            }";
        blends.DARKEN_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.DARKEN_PART.replace(/%rgb%/g, 'r'), blends.DARKEN_PART.replace(/%rgb%/g, 'g'), blends.DARKEN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.MULTIPLY_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.MULTIPLY_PART.replace(/%rgb%/g, 'r'), blends.MULTIPLY_PART.replace(/%rgb%/g, 'g'), blends.MULTIPLY_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.COLOR_BURN_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.COLOR_BURN_PART.replace(/%rgb%/g, 'r'), blends.COLOR_BURN_PART.replace(/%rgb%/g, 'g'), blends.COLOR_BURN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.LINEAR_BURN_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.LINEAR_BURN_PART.replace(/%rgb%/g, 'r'), blends.LINEAR_BURN_PART.replace(/%rgb%/g, 'g'), blends.LINEAR_BURN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.DARKER_COLOR_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", blends.DARKER_COLOR_PART);
        blends.LIGHTEN_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.LIGHTEN_PART.replace(/%rgb%/g, 'r'), blends.LIGHTEN_PART.replace(/%rgb%/g, 'g'), blends.LIGHTEN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.SCREEN_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.SCREEN_PART.replace(/%rgb%/g, 'r'), blends.SCREEN_PART.replace(/%rgb%/g, 'g'), blends.SCREEN_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.COLOR_DODGE_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.COLOR_DODGE_PART.replace(/%rgb%/g, 'r'), blends.COLOR_DODGE_PART.replace(/%rgb%/g, 'g'), blends.COLOR_DODGE_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.LINEAR_DODGE_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.LINEAR_DODGE_PART.replace(/%rgb%/g, 'r'), blends.LINEAR_DODGE_PART.replace(/%rgb%/g, 'g'), blends.LINEAR_DODGE_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.LIGHTER_COLOR_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", blends.LIGHTER_COLOR_PART);
        blends.SOFT_LIGHT_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.SOFT_LIGHT_PART.replace(/%rgb%/g, 'r'), blends.SOFT_LIGHT_PART.replace(/%rgb%/g, 'g'), blends.SOFT_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.HARD_LIGHT_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.HARD_LIGHT_PART.replace(/%rgb%/g, 'r'), blends.HARD_LIGHT_PART.replace(/%rgb%/g, 'g'), blends.HARD_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.VIVID_LIGHT_FULL = blends.NPM_BLEND.replace("%NPM_BLEND%", [blends.VIVID_LIGHT_PART.replace(/%rgb%/g, 'r'), blends.VIVID_LIGHT_PART.replace(/%rgb%/g, 'g'), blends.VIVID_LIGHT_PART.replace(/%rgb%/g, 'b')].join('\n'));
        blends.blendFullArray = [];
        blends.blendFullArray[CUSTOM_BLEND_MODES.DARKEN] = blends.DARKEN_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.MULTIPLY] = blends.MULTIPLY_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.COLOR_BURN] = blends.COLOR_BURN_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.LINEAR_BURN] = blends.LINEAR_BURN_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.DARKER_COLOR] = blends.DARKER_COLOR_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.LIGHTEN] = blends.LIGHTEN_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.SCREEN] = blends.SCREEN_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.COLOR_DODGE] = blends.COLOR_DODGE_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.LINEAR_DODGE] = blends.LINEAR_DODGE_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.LIGHTER_COLOR] = blends.LIGHTER_COLOR_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.SOFT_LIGHT] = blends.SOFT_LIGHT_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.HARD_LIGHT] = blends.HARD_LIGHT_FULL;
        blends.blendFullArray[CUSTOM_BLEND_MODES.VIVID_LIGHT] = blends.VIVID_LIGHT_FULL;
    })(blends = pixi_picture.blends || (pixi_picture.blends = {}));
    var filterCache = [];
    var filterCacheArray = [];
    function getBlendFilter(blendMode) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCache[blendMode]) {
            filterCache[blendMode] = new pixi_picture.BlendFilter({ blendCode: blends.blendFullArray[blendMode] });
        }
        return filterCache[blendMode];
    }
    pixi_picture.getBlendFilter = getBlendFilter;
    function getBlendFilterArray(blendMode) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCacheArray[blendMode]) {
            filterCacheArray[blendMode] = [this.getBlendFilter(blendMode)];
        }
        return filterCacheArray[blendMode];
    }
    pixi_picture.getBlendFilterArray = getBlendFilterArray;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Sprite.prototype._render = function (renderer) {
            var texture = this._texture;
            if (!texture || !texture.valid) {
                return;
            }
            var blendFilterArray = pixi_picture.getBlendFilterArray(this.blendMode);
            if (blendFilterArray) {
                renderer.batch.flush();
                if (!renderer.filter.pushWithCheck(this, blendFilterArray)) {
                    return;
                }
            }
            this.calculateVertices();
            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);
            if (blendFilterArray) {
                renderer.batch.flush();
                renderer.filter.pop();
            }
        };
        return Sprite;
    }(PIXI.Sprite));
    pixi_picture.Sprite = Sprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    var TilingSprite = (function (_super) {
        __extends(TilingSprite, _super);
        function TilingSprite() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TilingSprite.prototype._render = function (renderer) {
            var texture = this._texture;
            if (!texture || !texture.valid) {
                return;
            }
            var blendFilterArray = pixi_picture.getBlendFilterArray(this.blendMode);
            if (blendFilterArray) {
                renderer.batch.flush();
                if (!renderer.filter.pushWithCheck(this, blendFilterArray)) {
                    return;
                }
            }
            this.tileTransform.updateLocalTransform();
            this.uvMatrix.update();
            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);
            if (blendFilterArray) {
                renderer.batch.flush();
                renderer.filter.pop();
            }
        };
        return TilingSprite;
    }(PIXI.TilingSprite));
    pixi_picture.TilingSprite = TilingSprite;
})(pixi_picture || (pixi_picture = {}));
var pixi_picture;
(function (pixi_picture) {
    PIXI.picture = pixi_picture;
})(pixi_picture || (pixi_picture = {}));
//# sourceMappingURL=pixi-picture.js.map