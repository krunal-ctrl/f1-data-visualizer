import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'positionSuffix'
})
export class PositionSuffixPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
