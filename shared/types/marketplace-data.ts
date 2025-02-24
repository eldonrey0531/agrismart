export enum AttributeType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE'
}

export interface MarketplaceProductAttribute {
  id: string;
  name: string;
  value: string;
  type: AttributeType;
}

export interface MarketplaceAttribute {
  value: string;
  type: AttributeType;
}

export interface AttributesJson {
  [key: string]: MarketplaceAttribute;
}

export const DEFAULT_PRODUCT_DATA = {
  rating: 0,
  views: 0,
  isActive: true,
  isFeatured: false
} as const;

// Helper type for JSON value validation
export type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }