import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {ProjectService} from '../project.service';
import {NamedSpatialReference, SpatialReference} from '../../spatial-references/spatial-reference.model';
import {SpatialReferenceService} from '../../spatial-references/spatial-reference.service';
import {Subscription} from 'rxjs/internal/Subscription';

@Component({
    selector: 'ge-change-projection',
    templateUrl: './change-spatial-reference.component.html',
    styleUrls: ['./change-spatial-reference.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeSpatialReferenceComponent implements OnInit, OnDestroy {
    readonly SpatialReferences: Array<NamedSpatialReference>;

    spatialReference?: NamedSpatialReference;

    private subscription: Subscription;

    constructor(
        public projectService: ProjectService,
        protected spatialReferenceService: SpatialReferenceService,
        protected changeDetectorRef: ChangeDetectorRef,
    ) {
        this.SpatialReferences = this.spatialReferenceService.getSpatialReferences();
        this.subscription = this.projectService.getSpatialReferenceStream().subscribe((sref: SpatialReference) => {
            const index = this.SpatialReferences.findIndex((v) => v.spatialReference.srsString === sref.srsString);

            if (index >= 0) {
                this.spatialReference = this.SpatialReferences[index];
            } else {
                this.spatialReference = undefined;
            }

            this.changeDetectorRef.markForCheck();
        });
    }

    setSpatialReference(sref: NamedSpatialReference): void {
        this.projectService.setSpatialReference(new SpatialReference(sref.spatialReference.srsString));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {}
}
