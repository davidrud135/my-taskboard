import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {
  readonly BYTES_IN_KILOBYTE = 1024;
  readonly BYTES_IN_MEGABYTE = this.BYTES_IN_KILOBYTE * 1024;
  readonly BYTES_IN_GIGABYTE = this.BYTES_IN_MEGABYTE * 1024;
  readonly BYTES_IN_TERABYTE = this.BYTES_IN_GIGABYTE * 1024;

  transform(fileSize: number): string {
    if (fileSize >= this.BYTES_IN_TERABYTE) {
      const fileSizeInTB = (fileSize / this.BYTES_IN_TERABYTE).toFixed(1);
      return `${fileSizeInTB} TB`;
    }
    if (fileSize >= this.BYTES_IN_GIGABYTE) {
      const fileSizeInGB = (fileSize / this.BYTES_IN_GIGABYTE).toFixed(1);
      return `${fileSizeInGB} GB`;
    }
    if (fileSize >= this.BYTES_IN_MEGABYTE) {
      const fileSizeInMB = (fileSize / this.BYTES_IN_MEGABYTE).toFixed(1);
      return `${fileSizeInMB} MB`;
    }
    if (fileSize >= this.BYTES_IN_KILOBYTE) {
      const fileSizeInKB = (fileSize / this.BYTES_IN_KILOBYTE).toFixed(1);
      return `${fileSizeInKB} KB`;
    }
    return `${fileSize} bytes`;
  }
}
