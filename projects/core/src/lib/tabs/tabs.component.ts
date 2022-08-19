import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    HostBinding,
    Input,
    OnChanges,
    SimpleChanges,
    OnDestroy,
    ViewChild,
    ComponentFactoryResolver,
    Injector,
    AfterViewInit,
    ChangeDetectorRef,
} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {Config} from '../config.service';
import {LayoutService} from '../layout.service';
import {clamp} from '../util/math';
import {TabContent, TabsService} from './tabs.service';

const TAB_WIDTH_PCT_MIN = 10;
const TAB_WIDTH_PCT_MAX = 20;

@Component({
    selector: 'ge-tab-panel',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @HostBinding('class.mat-elevation-z4') elevationStyle = true;
    @ViewChild(CdkPortalOutlet) portalOutlet!: CdkPortalOutlet;

    @Input() maxHeight = 0;
    @Input() visible = true;

    toggleTooltip: 'Show' | 'Hide' = this.visible ? 'Hide' : 'Show';
    readonly toggleTooltipDelay: number;

    readonly tabWidthPct: Observable<number>;

    contentHeight = 0;

    protected activeTabSubscription: Subscription;

    constructor(
        public readonly tabsService: TabsService,
        protected readonly layoutService: LayoutService,
        protected readonly config: Config,
        protected readonly componentFactoryResolver: ComponentFactoryResolver,
        protected readonly injector: Injector,
        protected readonly changeDetectorRef: ChangeDetectorRef,
    ) {
        this.toggleTooltipDelay = this.config.DELAYS.TOOLTIP;

        this.activeTabSubscription = this.tabsService.getActiveTabChanges().subscribe((tabContent) => {
            if (tabContent) {
                this.renderTabContent(tabContent);
            } else {
                this.removeRenderedTabContent();
            }
        });

        this.tabWidthPct = this.tabsService.tabs.pipe(map((tabs) => clamp(100 / tabs.length, TAB_WIDTH_PCT_MIN, TAB_WIDTH_PCT_MAX)));
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.maxHeight || changes.visible) {
            this.setContentHeight(this.maxHeight, this.visible);
        }

        if (changes.visible) {
            this.toggleTooltip = this.visible ? 'Hide' : 'Show';

            if (this.visible && this.tabsService.activeTab) {
                this.renderTabContent(this.tabsService.activeTab);
            } else if (!this.visible) {
                this.removeRenderedTabContent();
            }
        }
    }

    ngOnDestroy(): void {
        this.activeTabSubscription.unsubscribe();
    }

    toggleVisibility(): void {
        this.layoutService.toggleLayerDetailViewVisibility();
    }

    setTab(tabContent: TabContent): void {
        this.tabsService.activeTab = tabContent;
    }

    closeTab(tabContent: TabContent): void {
        this.tabsService.removeComponent(tabContent);
    }

    protected renderTabContent(tabContent: TabContent): void {
        this.layoutService.setLayerDetailViewVisibility(true);

        this.removeRenderedTabContent();

        const portal = new ComponentPortal(tabContent.component);
        const componentRef = this.portalOutlet.attach(portal);

        const component = componentRef.instance;

        // inject data
        for (const property of Object.keys(tabContent.inputs)) {
            component[property] = tabContent.inputs[property];
        }

        this.changeDetectorRef.markForCheck();
    }

    protected removeRenderedTabContent(): void {
        if (this.portalOutlet && this.portalOutlet.hasAttached()) {
            this.portalOutlet.detach();
        }
    }

    protected setContentHeight(maxHeight: number, visible: boolean): void {
        let contentHeight = 0;
        if (visible) {
            contentHeight = maxHeight - LayoutService.getLayerDetailViewBarHeightPx();
        }

        this.contentHeight = contentHeight;
    }
}
