import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {Color} from '../../../colors/color';
import {Colorizer} from '../../../colors/colorizer.model';

/**
 * a simple interface to model a cell in the raster icon
 */
interface Cell {
    xStart: number;
    yStart: number;
    xSize: number;
    ySize: number;
    colorString: string;
}

/**
 * The raster icon component displays colored cells to visualize the raster style
 */
@Component({
    selector: 'ge-raster-icon',
    templateUrl: './raster-icon.component.svg',
    styleUrls: ['./raster-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RasterIconComponent implements OnInit, OnChanges {
    // number of cells in x and y direction
    @Input() xCells!: number;
    @Input() yCells!: number;
    // the raster style used to color the icon
    @Input() colorizer!: Colorizer;

    /**
     * the array of generated (colored and positioned) cells.
     */
    cells: Array<Cell> = [];
    /**
     * This is the number of pixels used for the icon
     */
    cellSpace = 24;

    ngOnChanges(_changes: {[propertyName: string]: SimpleChange}): void {
        this.generateCells(this.xCells, this.yCells);
    }

    ngOnInit(): void {
        this.generateCells(this.xCells, this.yCells);
    }

    /**
     * generates an array of cell descriptors which are used by the template
     */
    generateCells(xCells: number, yCells: number): void {
        this.cells = new Array<Cell>(xCells * yCells);
        for (let y = 0; y < this.yCells; y++) {
            for (let x = 0; x < this.xCells; x++) {
                const idx = this.xCells * y + x;
                this.cells[idx] = {
                    xStart: (x * this.cellSpace) / this.xCells,
                    yStart: (y * this.cellSpace) / this.yCells,
                    xSize: this.cellSpace / this.xCells,
                    ySize: this.cellSpace / this.yCells,
                    colorString: Color.rgbaToCssString(this.cellColor(x, y)),
                };
            }
        }
    }

    private cellColor(x: number, y: number): Color {
        const validSymbology = this.colorizer && this.colorizer.getNumberOfColors() > 0;
        if (!validSymbology) {
            return Color.fromRgbaLike('ff000000');
        }
        const numberOfCells = this.xCells * this.yCells;
        const numberOfColors = this.colorizer.getNumberOfColors();
        const isGradient = this.colorizer.isGradient();
        const scale = isGradient ? numberOfColors / (this.xCells + this.yCells - 1) : numberOfColors / numberOfCells;
        const idx = y * this.xCells + x;
        let colorIdx = 0;
        if (numberOfColors === 2) {
            colorIdx = y % 2 === 0 ? x % 2 : (x + 1) % 2;
        } else {
            const uidx = isGradient ? this.xCells - 1 - x + y : idx;
            colorIdx = Math.trunc(uidx * scale) % numberOfColors;
        }
        return this.colorizer.getColorAtIndex(colorIdx);
    }
}
