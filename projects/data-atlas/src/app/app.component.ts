import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewContainerRef} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {UserService} from '@geoengine/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
    selector: 'ge-app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, AfterViewInit {
    constructor(
        private readonly iconRegistry: MatIconRegistry,
        private readonly sanitizer: DomSanitizer,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly vcRef: ViewContainerRef,
    ) {
        this.registerIcons();

        this.setupLogoutCallback();
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {}

    private registerIcons(): void {
        this.iconRegistry.addSvgIconInNamespace(
            'geoengine',
            'logo',
            this.sanitizer.bypassSecurityTrustResourceUrl('assets/geoengine-white.svg'),
        );

        // used for navigation
        this.iconRegistry.addSvgIcon('cogs', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/cogs.svg'));
    }

    private setupLogoutCallback(): void {
        this.userService.setLogoutCallback(() => {
            this.router.navigate(['signin']);
        });
    }
}
