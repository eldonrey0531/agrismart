export const mockProducts = [
  {
    id: '1',
    title: 'Organic Tomato Seeds',
    description: 'High-quality organic tomato seeds for your garden. These heirloom seeds produce delicious, juicy tomatoes perfect for home gardens.',
    price: 9.99,
    category: 'seeds',
    images: [
      '/images/products/tomato-seeds-1.jpg',
      '/images/products/tomato-seeds-2.jpg'
    ],
    likes: 24,
    status: 'active',
    seller: {
      id: 'seller1',
      name: 'Green Farms',
      email: 'contact@greenfarms.com',
      verified: true,
    },
    location: {
      coordinates: [121.0409, 14.5547],
      address: 'Manila, Philippines',
    }
  },
  {
    id: '2',
    title: 'Premium Garden Tool Set',
    description: 'Complete set of essential gardening tools including shovel, rake, trowel, and pruning shears. Made with durable materials.',
    price: 49.99,
    category: 'tools',
    images: [
      '/images/products/garden-tools-1.jpg',
      '/images/products/garden-tools-2.jpg',
      '/images/products/garden-tools-3.jpg'
    ],
    likes: 15,
    status: 'active',
    seller: {
      id: 'seller2',
      name: 'Farm Supplies Co.',
      email: 'sales@farmsupplies.com',
      verified: true,
    },
    location: {
      coordinates: [121.0409, 14.5547],
      address: 'Quezon City, Philippines',
    }
  },
  {
    id: '3',
    title: 'Natural Fertilizer Pack',
    description: 'Organic fertilizer blend perfect for vegetables and herbs. Enriched with natural minerals and nutrients.',
    price: 24.99,
    category: 'fertilizers',
    images: [
      '/images/products/fertilizer-1.jpg',
      '/images/products/fertilizer-2.jpg'
    ],
    likes: 32,
    status: 'active',
    seller: {
      id: 'seller3',
      name: 'Organic Solutions',
      email: 'help@organicsolutions.com',
      verified: true,
    },
    location: {
      coordinates: [121.0409, 14.5547],
      address: 'Cebu City, Philippines',
    }
  },
  {
    id: '4',
    title: 'Mini Greenhouse Kit',
    description: 'Compact greenhouse perfect for small gardens and balconies. Easy to assemble and maintain.',
    price: 199.99,
    category: 'equipment',
    images: [
      '/images/products/greenhouse-1.jpg',
      '/images/products/greenhouse-2.jpg',
      '/images/products/greenhouse-3.jpg'
    ],
    likes: 45,
    status: 'active',
    seller: {
      id: 'seller4',
      name: 'Garden Tech',
      email: 'support@gardentech.com',
      verified: true,
    },
    location: {
      coordinates: [121.0409, 14.5547],
      address: 'Davao City, Philippines',
    }
  }
];