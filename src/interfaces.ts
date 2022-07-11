export interface PerformanceReadings {
  total: [number, number];
  stringFormatting: [number, number];
  tagsContainer: [number, number];
}

export interface ElementObject {
  elementType: string;
  attributes: { [key: string]: string };
  children: (ElementObject | StringObject)[];
}

export interface StringObject {
  elementType: 'textContent';
  textContent: string;
}

// export type TagString = `<${string} >`
