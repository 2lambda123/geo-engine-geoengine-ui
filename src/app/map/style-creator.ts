import {
    Circle as OlStyleCircle,
    Fill as OlStyleFill,
    Stroke as OlStyleStroke,
    Style as OlStyle,
    StyleFunction as OlStyleFunction,
    Text as OlStyleText,
} from 'ol/style';

import {Feature as OlFeature} from 'ol';


import {
    AbstractVectorSymbology,
    ComplexPointSymbology,
    ComplexVectorSymbology,
    DEFAULT_VECTOR_HIGHLIGHT_FILL_COLOR,
    DEFAULT_VECTOR_HIGHLIGHT_STROKE_COLOR,
    SymbologyType
} from '../layers/symbology/symbology.model';

export class StyleCreator {

    public static fromVectorSymbology(sym: AbstractVectorSymbology): OlStyleFunction | OlStyle {
        switch (sym.getSymbologyType()) {
            case SymbologyType.SIMPLE_VECTOR:
                return StyleCreator.fromSimpleVectorSymbology(sym);

            case SymbologyType.SIMPLE_POINT:
                return StyleCreator.fromSimplePointSymbology(sym as ComplexPointSymbology);


            case SymbologyType.COMPLEX_POINT:
                return StyleCreator.fromComplexPointSymbology(sym as ComplexPointSymbology);

            case SymbologyType.COMPLEX_VECTOR:
                return StyleCreator.fromComplexVectorSymbology(sym as ComplexVectorSymbology);

            default:
                console.error('StyleCreator: unknown AbstractSymbology: ' + sym.getSymbologyType());
                return StyleCreator.fromSimpleVectorSymbology(sym); // Lets pretend unknown symbology is a simple vector...
        }

    }

    static createHighlightSymbology<S extends AbstractVectorSymbology> (sym: S): S {
        const highlightSymbology: S = sym.clone() as S;
        highlightSymbology.fillRGBA = DEFAULT_VECTOR_HIGHLIGHT_FILL_COLOR;
        highlightSymbology.strokeRGBA = DEFAULT_VECTOR_HIGHLIGHT_STROKE_COLOR;
        return highlightSymbology;
    }

    static fromSimpleVectorSymbology(sym: AbstractVectorSymbology): OlStyle {
        return new OlStyle({
            fill: new OlStyleFill({ color: sym.fillRGBA.rgbaTuple() }),
            stroke: new OlStyleStroke({ color: sym.strokeRGBA.rgbaTuple(), width: sym.strokeWidth }),
        });
    }

    static fromSimplePointSymbology(sym: ComplexPointSymbology): OlStyle {
            return new OlStyle({
                image: new OlStyleCircle({
                    radius: sym.radius,
                    fill: new OlStyleFill({ color: sym.fillRGBA.rgbaTuple() }),
                    stroke: new OlStyleStroke({ color: sym.strokeRGBA.rgbaTuple(), width: sym.strokeWidth }),
                }),
            });
    }

    static buildStyleKey(
        featureColorValue: string | number | undefined,
        featureTextValue: string | number | undefined,
        featureRadiusValue: string | number |undefined
    ): string {
        const VALUE_SEPARATOR_SYMBOL = ':::';
        return `${featureColorValue}${VALUE_SEPARATOR_SYMBOL}${featureTextValue}${VALUE_SEPARATOR_SYMBOL}${featureRadiusValue}`;
    }

    static fromComplexVectorSymbology(sym: ComplexVectorSymbology): OlStyleFunction {
        // we need a style cache to speed things up. This dangles in the void of the GC...
        const styleCache: { [key: string]: OlStyle } = {};

        return (feature: OlFeature, resolution: number) => {

            const featureColorValue = (sym.colorAttribute) ? feature.get(sym.colorAttribute) : undefined;
            const featureTextValue = (sym.textAttribute) ? feature.get(sym.textAttribute) : undefined;

            const styleKey = StyleCreator.buildStyleKey(featureColorValue, featureTextValue, undefined);

            if (!styleCache[styleKey]) {

                const colorBreakpointLookup = sym.colorizer.getBreakpointForValue(featureColorValue, true);
                const color = colorBreakpointLookup ? colorBreakpointLookup.rgba.rgbaTuple() : sym.fillRGBA.rgbaTuple();

                const fill = new OlStyleFill({color: color});
                const stroke = new OlStyleStroke({color: sym.strokeRGBA.rgbaTuple(), width: sym.strokeWidth});

                // only build the text style if we are going to show it
                const textStyle = (!featureTextValue) ? undefined : new OlStyleText({
                    text: featureTextValue.toString(),
                    fill: new OlStyleFill({
                        color: sym.textColor.rgbaTuple(),
                    }),
                    stroke: new OlStyleStroke({
                        color: sym.strokeRGBA.rgbaTuple(),
                        width: sym.textStrokeWidth,
                    })
                });

                const style = new OlStyle({
                    stroke: stroke,
                    fill: fill,
                    text: textStyle
                });
                styleCache[styleKey] = style;
            }

            return styleCache[styleKey];
        };
    }

    static fromComplexPointSymbology(sym: ComplexPointSymbology): OlStyleFunction {
        // we need a style cache to speed things up. This dangles in the void of the GC...
        const styleCache: {[key: string]: OlStyle} = {};

        return (feature: OlFeature, resolution: number) => {

            const featureColorValue = (sym.colorAttribute) ? feature.get(sym.colorAttribute) : undefined;
            const featureTextValue = (sym.textAttribute) ? feature.get(sym.textAttribute) : undefined;
            const featureRadiusValue = (sym.radiusAttribute) ? feature.get(sym.radiusAttribute) : undefined;

            const styleKey = StyleCreator.buildStyleKey(featureColorValue, featureTextValue, featureRadiusValue);

            if (!styleCache[styleKey]) {

                const colorBreakpointLookup = sym.colorizer.getBreakpointForValue(featureColorValue, true);
                const color = colorBreakpointLookup ? colorBreakpointLookup.rgba.rgbaTuple() : sym.fillRGBA.rgbaTuple();
                const radius = featureRadiusValue ? featureRadiusValue as number * sym.radiusFactor : sym.radius * sym.radiusFactor;

                const imageStyle = new OlStyleCircle({
                    radius: radius,
                    fill: new OlStyleFill({color: color}),
                        stroke: new OlStyleStroke({ color: sym.strokeRGBA.rgbaTuple(), width: sym.strokeWidth }),
                    });

                // only build the text style if we are going to show it
                const textStyle = (!featureTextValue) ? undefined : new OlStyleText({
                    text: featureTextValue.toString(),
                    fill: new OlStyleFill({
                        color: sym.textColor.rgbaTuple(),
                    }),
                    stroke: new OlStyleStroke({
                        color: sym.strokeRGBA.rgbaTuple(),
                        width: sym.textStrokeWidth,
                    })
                });

                const style = new OlStyle({
                    image: imageStyle,
                    text: textStyle
                });
                styleCache[styleKey] = style;
            }

            return styleCache[styleKey];
        };
    }
}
