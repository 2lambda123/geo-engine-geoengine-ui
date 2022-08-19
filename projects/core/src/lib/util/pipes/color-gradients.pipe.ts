import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Color, RgbaTuple} from '../../colors/color';
import {ColorBreakpoint} from '../../colors/color-breakpoint.model';
import {Colorizer} from '../../colors/colorizer.model';

/**
 * Pipe to transform a colorizer into a CSS gradient.
 */
@Pipe({name: 'waveColorizerCssGradient'})
export class ColorizerCssGradientPipe implements PipeTransform {
    constructor(protected sanitizer: DomSanitizer) {}

    transform(colorizer: Colorizer, angle: number = 180): SafeStyle {
        const colors = colorizer.getBreakpoints().map((breakpoint) => breakpoint.color);
        const style = colorsToCssGradient(colors, angle);
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }
}

/**
 * Pipe to transform an `Array<ColorBreakpoint>`  into a CSS gradient.
 */
@Pipe({name: 'waveColorBreakpointsCssGradient'})
export class ColorBreakpointsCssGradientPipe implements PipeTransform {
    constructor(protected sanitizer: DomSanitizer) {}

    transform(breakpoints: Array<ColorBreakpoint>, angle: number = 180): SafeStyle {
        const colors = breakpoints.map((breakpoint) => breakpoint.color);
        const style = colorsToCssGradient(colors, angle);
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }
}

/**
 * Pipe to transform an `Array<RgbaColor>`  into a CSS gradient.
 */
@Pipe({name: 'waveRgbaTuplesCssGradient'})
export class RgbaArrayCssGradientPipe implements PipeTransform {
    constructor(protected sanitizer: DomSanitizer) {}

    transform(rgbaColors: Array<RgbaTuple>, angle: number = 180): SafeStyle {
        const colors = rgbaColors.map((rgba) => Color.fromRgbaLike(rgba));
        const style = colorsToCssGradient(colors, angle);
        return this.sanitizer.bypassSecurityTrustStyle(style);
    }
}

/**
 * Convert an array of colors to a CSS gradient.
 */
function colorsToCssGradient(colors: Array<Color>, angle: number = 180): string {
    const numColors = colors.length;
    const elementSize = 100.0 / numColors;
    const halfElementSize = elementSize / 2.0;

    const validAngle = angle !== undefined ? angle % 360.0 : 180;

    const colorString = colors.reduce<string>(
        (acc, color, i) => acc + `, ${color.rgbaCssString()} ${i * elementSize + halfElementSize}%`,
        '',
    );

    const cssString = `linear-gradient(${validAngle}deg ${colorString})`;

    return cssString;
}
