export interface PerformanceReadings {
  total: [number, number];
  stringFormatting: [number, number];
  tagsContainer: [number, number];
}

export interface ElementObject {
  elementType: string | undefined;
  attributes: { [key: string]: string };
  children: (ElementObject | StringObject)[];
}

export interface StringObject {
  elementType: 'textContent';
  textContent: string;
}
