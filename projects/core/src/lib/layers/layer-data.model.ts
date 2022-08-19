import {Time} from '../time/time.model';
import {LayerType} from './layer.model';
import {SpatialReference} from '../spatial-references/spatial-reference.model';
import {GeoJSON as OlFormatGeoJSON} from 'ol/format';
import OlFeature from 'ol/Feature';
import {ProjectionLike as OlProjectionLike} from 'ol/proj';
import {UUID} from '../backend/backend.model';
import {featureToHash} from '../util/conversions';
import OlGeometry from 'ol/geom/Geometry';

export abstract class LayerData {
    readonly type: LayerType;
    readonly time: Time;
    readonly spatialReference: SpatialReference;

    protected constructor(type: LayerType, time: Time, spatialReference: SpatialReference) {
        this.type = type;
        this.spatialReference = spatialReference;
        this.time = time;
    }
}

export class RasterData extends LayerData {
    readonly workflowId: UUID;

    constructor(time: Time, spatialReference: SpatialReference, workflowId: UUID) {
        if (time.end.isAfter(time.start)) {
            time = new Time(time.start);
        }
        super('raster', time, spatialReference);
        this.workflowId = workflowId;
    }
}

export class VectorData extends LayerData {
    readonly data: Array<OlFeature<OlGeometry>>;
    readonly extent: [number, number, number, number];

    constructor(time: Time, projection: SpatialReference, data: Array<OlFeature<OlGeometry>>, extent: [number, number, number, number]) {
        super('vector', time, projection);
        this.data = data;
        this.extent = extent;
        this.fakeIds(); // FIXME: use real IDs ...
    }

    static olParse(
        time: Time,
        projection: SpatialReference,
        extent: [number, number, number, number],
        source: Document | Node | any | string,
        optOptions?: {dataProjection: OlProjectionLike; featureProjection: OlProjectionLike},
    ): VectorData {
        return new VectorData(time, projection, new OlFormatGeoJSON().readFeatures(source, optOptions), extent);
    }

    fakeIds(): void {
        for (const feature of this.data) {
            if (feature.getId() === undefined) {
                feature.setId(featureToHash(feature));
            }
        }
    }
}
