import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priorityColor',
})
export class PriorityColorPipe implements PipeTransform {
  transform(priority: string): string {
    if (!priority) return '';

    switch (priority.toLowerCase()) {
      case 'haute':
        return 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold';

      case 'moyenne':
        return 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold';

      case 'basse':
        return 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold';

      default:
        return 'bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs';
    }
  }
}
