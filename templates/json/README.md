# Product JSON Template Documentation

## Overview
This folder contains JSON templates for structuring product data in the BabyFictions e-commerce platform. These templates ensure consistent data structure across all products and support advanced features like color variants with unique images and inventory tracking.

## Files
- `product-template.json` - Complete template for apparel products (t-shirts, hoodies, etc.)
- `product-cap-example.json` - Example template for accessories (caps, hats, etc.)
- `product-schema.md` - Detailed field documentation (this file)

## Key Features

### Color Variants System
Each product can have multiple color variants, with each color having:
- **Unique Images**: 4+ images per color (front, back, detail, lifestyle)
- **Individual SKUs**: Separate tracking for each color
- **Size Availability**: Different stock levels per size per color
- **Independent Pricing**: Optional price variations by color

### Product Structure

```json
{
  "_id": "unique-mongodb-id",
  "name": "Product Name",
  "description": "Detailed product description",
  "price": 350,
  "compareAtPrice": 450,
  "sku": "BF-CATEGORY-PRODUCT-001",
  "barcode": "1234567890123",
  "category": "clothing",
  "subcategory": "t-shirts",
  "brand": "Babyfiction",
  "colorVariants": [...],
  ...
}
```

## Field Definitions

### Basic Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | String | Yes | Unique MongoDB ObjectId |
| `name` | String | Yes | Product display name |
| `description` | String | Yes | Detailed product description |
| `price` | Number | Yes | Base price in ZAR |
| `compareAtPrice` | Number | No | Original price for sale items |
| `sku` | String | Yes | Stock Keeping Unit (format: BF-CATEGORY-PRODUCT-###) |
| `barcode` | String | No | Product barcode/UPC |
| `category` | String | Yes | Main category (e.g., "clothing", "accessories") |
| `subcategory` | String | Yes | Sub-category (e.g., "t-shirts", "hats", "hoodies") |
| `brand` | String | Yes | Brand name (typically "Babyfiction") |

### Color Variants Array
Each product has a `colorVariants` array where each variant contains:

```json
{
  "colorName": "Black",
  "colorCode": "#000000",
  "sku": "BF-TSHIRT-001-BLK",
  "price": 350,
  "images": [
    "url-to-front-view.jpg",
    "url-to-back-view.jpg",
    "url-to-detail-view.jpg",
    "url-to-lifestyle-view.jpg"
  ],
  "thumbnail": "url-to-main-thumbnail.jpg",
  "sizes": [
    {
      "size": "S",
      "stock": 15,
      "sku": "BF-TSHIRT-001-BLK-S"
    }
  ],
  "isAvailable": true
}
```

#### Color Variant Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `colorName` | String | Yes | Display name of color (e.g., "Black", "Navy Blue") |
| `colorCode` | String | Yes | Hex color code for color picker display |
| `sku` | String | Yes | SKU for this color (format: BASE-SKU-COLOR) |
| `price` | Number | No | Override price for this color (optional) |
| `images` | Array | Yes | Array of image URLs (minimum 4 recommended) |
| `thumbnail` | String | Yes | Main thumbnail for catalog display |
| `sizes` | Array | Yes | Available sizes with stock levels |
| `isAvailable` | Boolean | Yes | Whether this color is currently available |

#### Size Object Structure
```json
{
  "size": "M",
  "stock": 20,
  "sku": "BF-TSHIRT-001-BLK-M",
  "adjustable": false,
  "fitRange": "96-101 cm"
}
```

### Material & Care
| Field | Type | Description |
|-------|------|-------------|
| `material` | String | Material composition |
| `weight` | String | Fabric weight (e.g., "180 GSM") |
| `careInstructions` | Array | Array of care instruction strings |

### Features & Details
| Field | Type | Description |
|-------|------|-------------|
| `features` | Array | Key product features (bullet points) |
| `measurements` | Object | Size chart with measurements per size |
| `tags` | Array | Search and filter tags |

### Measurements Object
```json
{
  "S": {
    "chest": "91-96 cm",
    "length": "70 cm",
    "sleeve": "19 cm"
  },
  "M": {
    "chest": "96-101 cm",
    "length": "72 cm",
    "sleeve": "20 cm"
  }
}
```

### SEO Information
```json
{
  "seo": {
    "title": "SEO optimized page title",
    "description": "Meta description for search engines",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
}
```

### Shipping Information
```json
{
  "shipping": {
    "weight": 0.25,
    "dimensions": {
      "length": 30,
      "width": 25,
      "height": 3
    },
    "estimatedDelivery": "2-5 business days",
    "freeShippingEligible": true
  }
}
```

### Rating & Reviews
```json
{
  "rating": {
    "average": 4.7,
    "count": 156,
    "breakdown": {
      "5": 98,
      "4": 42,
      "3": 12,
      "2": 3,
      "1": 1
    }
  },
  "reviews": [
    {
      "userId": "user-id",
      "userName": "Customer Name",
      "rating": 5,
      "title": "Review title",
      "comment": "Review text",
      "verified": true,
      "helpful": 24,
      "createdAt": "2025-10-15T10:30:00Z",
      "images": []
    }
  ]
}
```

### Product Relationships
| Field | Type | Description |
|-------|------|-------------|
| `relatedProducts` | Array | Array of related product IDs |
| `collections` | Array | Collections this product belongs to |

### Status Flags
| Field | Type | Description |
|-------|------|-------------|
| `isFeatured` | Boolean | Featured on homepage |
| `isActive` | Boolean | Available for purchase |
| `isNewArrival` | Boolean | Show "New" badge |
| `isOnSale` | Boolean | Show "Sale" badge |
| `saleBadge` | String/Null | Custom sale badge text |

### Metadata
```json
{
  "metaData": {
    "totalStock": 281,
    "lowStockThreshold": 5,
    "soldCount": 523,
    "viewCount": 2847,
    "wishlistCount": 145
  }
}
```

### Timestamps
| Field | Type | Description |
|-------|------|-------------|
| `createdBy` | String | User ID who created the product |
| `createdAt` | ISO Date | Creation timestamp |
| `updatedAt` | ISO Date | Last update timestamp |
| `__v` | Number | MongoDB version key |

## SKU Naming Convention

### Format: `BF-CATEGORY-PRODUCT-COLOR-SIZE`

**Examples:**
- Base Product: `BF-TSHIRT-001`
- Color Variant: `BF-TSHIRT-001-BLK`
- Size Variant: `BF-TSHIRT-001-BLK-M`
- Cap: `BF-HATS-RED-001-OS` (OS = One Size)

### Category Codes
- `TSHIRT` - T-Shirts
- `HATS` - Caps and Hats
- `HOODIE` - Hoodies and Sweatshirts
- `PANTS` - Pants and Bottoms
- `ACC` - Accessories

### Color Codes
- `BLK` - Black
- `WHT` - White
- `RED` - Red
- `NVY` - Navy
- `GRY` - Grey
- `BLU` - Blue
- `GRN` - Green

### Size Codes
Standard: `XS`, `S`, `M`, `L`, `XL`, `2XL`, `3XL`
One Size: `OS`

## Implementation Notes

### Frontend Usage
When a user clicks on a color:
1. Update displayed images to that color's `images` array
2. Update available sizes to that color's `sizes` array
3. Update stock availability per size
4. Update SKU and price if different

### Example Code
```typescript
const [selectedColor, setSelectedColor] = useState(product.colorVariants[0]);
const [selectedSize, setSelectedSize] = useState(null);
const [currentImages, setCurrentImages] = useState(selectedColor.images);

const handleColorChange = (colorVariant) => {
  setSelectedColor(colorVariant);
  setCurrentImages(colorVariant.images);
  setSelectedSize(null); // Reset size selection
};
```

### Database Indexing
Recommended indexes:
- `sku` (unique)
- `category`, `subcategory`
- `colorVariants.sku`
- `colorVariants.sizes.sku`
- `tags`
- `isActive`, `isFeatured`

## Migration from Old Structure

### Old Structure (Current)
```json
{
  "variants": {
    "size": ["S", "M", "L"],
    "color": ["Black", "White"]
  },
  "images": ["single-image.jpg"]
}
```

### New Structure (Template)
```json
{
  "colorVariants": [
    {
      "colorName": "Black",
      "images": ["black-front.jpg", "black-back.jpg"],
      "sizes": [
        {"size": "S", "stock": 10},
        {"size": "M", "stock": 15}
      ]
    }
  ]
}
```

### Migration Script Needed
A migration script should:
1. Convert flat `variants` to nested `colorVariants`
2. Split stock across color/size combinations
3. Assign placeholder images per color
4. Generate proper SKUs for each variant

## Best Practices

1. **Images**: Always provide at least 4 images per color (front, back, detail, lifestyle)
2. **Stock**: Update stock levels in real-time as orders are placed
3. **SKUs**: Keep SKUs unique across all variants
4. **Colors**: Use accurate hex codes for color pickers
5. **Measurements**: Provide detailed size charts for all apparel
6. **SEO**: Optimize titles and descriptions for search engines
7. **Reviews**: Encourage verified purchase reviews

## Future Enhancements

Planned features:
- [ ] Video support per color variant
- [ ] 360° product views
- [ ] Augmented reality try-on
- [ ] Bundle products (buy together discounts)
- [ ] Pre-order support for out-of-stock colors
- [ ] Waitlist for low stock items
- [ ] Color recommendation based on purchase history
