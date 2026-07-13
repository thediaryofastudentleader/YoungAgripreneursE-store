import type { Product, Category } from '@/types';

export const categories: Category[] = [
  { id: 'all', label: 'All', icon: 'LayoutGrid' },
  { id: 'kitchen-appliances', label: 'Kitchen Appliances', icon: 'CookingPot' },
  { id: 'indoor-lighting', label: 'Indoor Lighting', icon: 'Lightbulb' },
  { id: 'household-cleaners', label: 'Household Cleaners', icon: 'Sparkles' },
  { id: 'mens-tshirts', label: "Men's T-Shirts", icon: 'Shirt' },
  { id: 'womens-tshirts', label: "Women's T-Shirts", icon: 'Shirt' },
  { id: 'makeup', label: 'Makeup Products', icon: 'Palette' },
  { id: 'leggings', label: 'Leggings', icon: 'PersonStanding' },
  { id: 'jewelry', label: 'Jewelry', icon: 'Gem' },
  { id: 'hair-dye', label: 'Hair Dye', icon: 'Droplets' },
  { id: 'hair-styling', label: 'Hair Styling Tools', icon: 'Wind' },
  { id: 'hair-treatment', label: 'Hair & Scalp Treatments', icon: 'HeartPulse' },
  { id: 'bodycare-men', label: 'Body-care for Men', icon: 'FlaskConical' },
  { id: 'textbooks', label: 'Textbooks', icon: 'BookOpen' },
  { id: 'toys-games', label: 'Toys & Games', icon: 'Gamepad2' },
  { id: 'earphones', label: 'Earphones & Headphones', icon: 'Headphones' },
  { id: 'perfume', label: 'Perfume', icon: 'SprayCan' },
  { id: 'stickers', label: 'Phone & Laptop Stickers', icon: 'Sticker' },
  { id: 'manicure', label: 'Manicure & Pedicure Tools', icon: 'Hand' },
  { id: 'hoodies', label: 'Hoodies & Sweatshirts', icon: 'Cloud' },
  { id: 'sunglasses', label: 'Sunglasses', icon: 'Sun' },
  { id: 'back-to-school', label: 'Back to School', icon: 'Backpack' },
  { id: 'celebrations', label: 'Celebrations', icon: 'PartyPopper' },
  { id: 'bicycles', label: 'Bicycles', icon: 'Bike' },
  { id: 'shoes', label: 'Shoes', icon: 'Footprints' },
];

export const products: Product[] = [
  // Kitchen Appliances
  { id: 'ka-1', title: 'Russell Hobbs Kettle', price: 349.99, originalPrice: 449.99, description: '1.7L cordless electric kettle with rapid boil', image: '/images/kettle.jpg', category: 'kitchen-appliances', stock: 15, trending: true, rating: 4.5, reviews: 28 },
  { id: 'ka-2', title: 'Toaster 2-Slice', price: 279.99, originalPrice: 329.99, description: 'Stainless steel 2-slice toaster with browning control', image: '/images/toaster.jpg', category: 'kitchen-appliances', stock: 12, rating: 4.3, reviews: 19 },
  { id: 'ka-3', title: 'Blender 500W', price: 459.99, description: 'Multi-function blender with 1.5L jug', image: '/images/blender.jpg', category: 'kitchen-appliances', stock: 8, new: true, rating: 4.6, reviews: 14 },
  { id: 'ka-4', title: 'Microwave Oven 20L', price: 899.99, originalPrice: 1099.99, description: 'Compact 20L microwave with 5 power levels', image: '/images/microwave.jpg', category: 'kitchen-appliances', stock: 6, special: true, rating: 4.4, reviews: 32 },
  { id: 'ka-5', title: 'Rice Cooker 1.8L', price: 399.99, description: 'Automatic rice cooker with keep-warm function', image: '/images/rice-cooker.jpg', category: 'kitchen-appliances', stock: 10, rating: 4.2, reviews: 21 },

  // Indoor Lighting
  { id: 'il-1', title: 'LED Desk Lamp', price: 189.99, description: 'Adjustable LED desk lamp with 3 brightness levels', image: '/images/desk-lamp.jpg', category: 'indoor-lighting', stock: 20, new: true, rating: 4.3, reviews: 16 },
  { id: 'il-2', title: 'Fairy Lights 10m', price: 79.99, description: 'Warm white LED fairy lights, USB powered', image: '/images/fairy-lights.jpg', category: 'indoor-lighting', stock: 30, trending: true, rating: 4.7, reviews: 45 },
  { id: 'il-3', title: 'Smart Bulb RGB', price: 129.99, description: 'WiFi-enabled colour-changing smart bulb', image: '/images/smart-bulb.jpg', category: 'indoor-lighting', stock: 18, rating: 4.1, reviews: 12 },
  { id: 'il-4', title: 'Bedside Night Light', price: 99.99, description: 'Touch-sensitive night light with dimmer', image: '/images/night-light.jpg', category: 'indoor-lighting', stock: 25, rating: 4.5, reviews: 23 },

  // Household Cleaners
  { id: 'hc-1', title: 'Multi-Surface Cleaner', price: 49.99, description: 'All-purpose surface cleaner 750ml', image: '/images/surface-cleaner.jpg', category: 'household-cleaners', stock: 40, rating: 4.4, reviews: 18 },
  { id: 'hc-2', title: 'Dishwashing Liquid', price: 39.99, description: 'Lemon fresh dish soap 500ml', image: '/images/dish-liquid.jpg', category: 'household-cleaners', stock: 35, trending: true, rating: 4.2, reviews: 22 },
  { id: 'hc-3', title: 'Laundry Detergent', price: 89.99, description: 'Liquid laundry detergent 2L, 32 washes', image: '/images/laundry.jpg', category: 'household-cleaners', stock: 22, rating: 4.6, reviews: 31 },
  { id: 'hc-4', title: 'Disinfectant Spray', price: 59.99, description: 'Antibacterial disinfectant spray 400ml', image: '/images/disinfectant.jpg', category: 'household-cleaners', stock: 28, rating: 4.3, reviews: 15 },

  // Men's T-Shirts
  { id: 'mt-1', title: 'Plain White Tee', price: 119.99, description: '100% cotton classic fit white t-shirt', image: '/images/mens-white-tee.jpg', category: 'mens-tshirts', stock: 25, trending: true, rating: 4.5, reviews: 42 },
  { id: 'mt-2', title: 'Black Graphic Tee', price: 149.99, description: 'Black t-shirt with graphic print', image: '/images/mens-graphic-tee.jpg', category: 'mens-tshirts', stock: 18, new: true, rating: 4.2, reviews: 19 },
  { id: 'mt-3', title: 'Navy V-Neck Tee', price: 129.99, description: 'Navy blue V-neck cotton t-shirt', image: '/images/mens-navy-tee.jpg', category: 'mens-tshirts', stock: 20, rating: 4.3, reviews: 16 },
  { id: 'mt-4', title: 'Grey Marl Tee', price: 109.99, description: 'Heather grey crew neck t-shirt', image: '/images/mens-grey-tee.jpg', category: 'mens-tshirts', stock: 15, rating: 4.1, reviews: 11 },

  // Women's T-Shirts
  { id: 'wt-1', title: 'Cropped White Tee', price: 139.99, description: 'Trendy cropped white t-shirt', image: '/images/womens-crop-tee.jpg', category: 'womens-tshirts', stock: 22, trending: true, rating: 4.4, reviews: 27 },
  { id: 'wt-2', title: 'Oversized Pink Tee', price: 159.99, description: 'Oversized fit pink t-shirt', image: '/images/womens-pink-tee.jpg', category: 'womens-tshirts', stock: 16, new: true, rating: 4.6, reviews: 14 },
  { id: 'wt-3', title: 'Striped Tee', price: 149.99, description: 'Classic black and white striped t-shirt', image: '/images/womens-striped-tee.jpg', category: 'womens-tshirts', stock: 14, rating: 4.2, reviews: 9 },
  { id: 'wt-4', title: 'Black Fitted Tee', price: 129.99, description: 'Slim fit black cotton t-shirt', image: '/images/womens-black-tee.jpg', category: 'womens-tshirts', stock: 19, rating: 4.3, reviews: 13 },

  // Makeup
  { id: 'mu-1', title: 'Matte Lipstick Set', price: 199.99, originalPrice: 249.99, description: 'Set of 6 matte lipsticks in assorted shades', image: '/images/lipstick-set.jpg', category: 'makeup', stock: 12, special: true, rating: 4.7, reviews: 34 },
  { id: 'mu-2', title: 'Foundation SPF 15', price: 179.99, description: 'Liquid foundation with SPF 15, medium coverage', image: '/images/foundation.jpg', category: 'makeup', stock: 15, rating: 4.4, reviews: 21 },
  { id: 'mu-3', title: 'Eyeshadow Palette', price: 229.99, description: '12-colour neutral eyeshadow palette', image: '/images/eyeshadow.jpg', category: 'makeup', stock: 10, trending: true, rating: 4.6, reviews: 28 },
  { id: 'mu-4', title: 'Mascara Waterproof', price: 119.99, description: 'Volumizing waterproof mascara', image: '/images/mascara.jpg', category: 'makeup', stock: 18, rating: 4.3, reviews: 17 },
  { id: 'mu-5', title: 'Makeup Brush Set', price: 249.99, description: '10-piece professional makeup brush set', image: '/images/brush-set.jpg', category: 'makeup', stock: 8, new: true, rating: 4.5, reviews: 12 },

  // Leggings
  { id: 'lg-1', title: 'Black High-Waist Leggings', price: 179.99, description: 'High-waist black leggings, squat-proof', image: '/images/black-leggings.jpg', category: 'leggings', stock: 20, trending: true, rating: 4.5, reviews: 36 },
  { id: 'lg-2', title: 'Grey Active Leggings', price: 199.99, description: 'Grey sports leggings with side pocket', image: '/images/grey-leggings.jpg', category: 'leggings', stock: 15, rating: 4.4, reviews: 19 },
  { id: 'lg-3', title: 'Pattern Print Leggings', price: 169.99, description: 'Colourful pattern printed leggings', image: '/images/pattern-leggings.jpg', category: 'leggings', stock: 12, rating: 4.2, reviews: 14 },

  // Jewelry
  { id: 'jw-1', title: 'Gold Hoop Earrings', price: 89.99, description: '18K gold-plated hoop earrings, 30mm', image: '/images/hoop-earrings.jpg', category: 'jewelry', stock: 18, trending: true, rating: 4.6, reviews: 24 },
  { id: 'jw-2', title: 'Layered Necklace', price: 119.99, description: 'Gold layered chain necklace', image: '/images/layered-necklace.jpg', category: 'jewelry', stock: 14, rating: 4.4, reviews: 16 },
  { id: 'jw-3', title: 'Charm Bracelet', price: 79.99, description: 'Silver charm bracelet with 5 charms', image: '/images/charm-bracelet.jpg', category: 'jewelry', stock: 22, new: true, rating: 4.3, reviews: 11 },
  { id: 'jw-4', title: 'Stud Earring Set', price: 69.99, description: 'Set of 6 pairs of stud earrings', image: '/images/stud-set.jpg', category: 'jewelry', stock: 25, rating: 4.5, reviews: 19 },

  // Hair Dye
  { id: 'hd-1', title: 'Jet Black Hair Dye', price: 59.99, description: 'Permanent hair colour, jet black', image: '/images/black-dye.jpg', category: 'hair-dye', stock: 20, rating: 4.2, reviews: 15 },
  { id: 'hd-2', title: 'Burgundy Red Dye', price: 64.99, description: 'Vibrant burgundy red hair dye', image: '/images/burgundy-dye.jpg', category: 'hair-dye', stock: 15, trending: true, rating: 4.4, reviews: 22 },
  { id: 'hd-3', title: 'Honey Blonde Dye', price: 69.99, description: 'Warm honey blonde hair colour', image: '/images/blonde-dye.jpg', category: 'hair-dye', stock: 12, rating: 4.3, reviews: 13 },

  // Hair Styling Tools
  { id: 'hs-1', title: 'Hair Straightener', price: 349.99, originalPrice: 449.99, description: 'Ceramic plate hair straightener with temp control', image: '/images/straightener.jpg', category: 'hair-styling', stock: 8, special: true, rating: 4.7, reviews: 31 },
  { id: 'hs-2', title: 'Curling Wand', price: 279.99, description: '25mm barrel curling wand', image: '/images/curling-wand.jpg', category: 'hair-styling', stock: 10, rating: 4.5, reviews: 18 },
  { id: 'hs-3', title: 'Hair Dryer 2000W', price: 299.99, description: 'Professional 2000W ionic hair dryer', image: '/images/hair-dryer.jpg', category: 'hair-styling', stock: 12, trending: true, rating: 4.6, reviews: 25 },
  { id: 'hs-4', title: 'Hair Brush Set', price: 129.99, description: '3-piece detangling brush set', image: '/images/brush-set-hair.jpg', category: 'hair-styling', stock: 18, rating: 4.2, reviews: 14 },

  // Hair & Scalp Treatments
  { id: 'ht-1', title: 'Hair Growth Oil', price: 89.99, description: 'Castor oil blend for hair growth 100ml', image: '/images/hair-oil.jpg', category: 'hair-treatment', stock: 16, trending: true, rating: 4.5, reviews: 28 },
  { id: 'ht-2', title: 'Deep Conditioner', price: 79.99, description: 'Moisturising deep conditioner 300ml', image: '/images/conditioner.jpg', category: 'hair-treatment', stock: 20, rating: 4.4, reviews: 19 },
  { id: 'ht-3', title: 'Anti-Dandruff Shampoo', price: 69.99, description: 'Medicated anti-dandruff shampoo 400ml', image: '/images/dandruff-shampoo.jpg', category: 'hair-treatment', stock: 14, rating: 4.3, reviews: 16 },

  // Body-care for Men
  { id: 'bm-1', title: 'Body Wash 3-in-1', price: 59.99, description: 'Face, hair & body wash for men 500ml', image: '/images/body-wash-men.jpg', category: 'bodycare-men', stock: 25, trending: true, rating: 4.4, reviews: 22 },
  { id: 'bm-2', title: 'Beard Care Kit', price: 149.99, description: 'Beard oil, balm & comb set', image: '/images/beard-kit.jpg', category: 'bodycare-men', stock: 12, rating: 4.6, reviews: 15 },
  { id: 'bm-3', title: 'Deodorant Stick Duo', price: 79.99, description: '2-pack antiperspirant deodorant', image: '/images/deodorant.jpg', category: 'bodycare-men', stock: 30, rating: 4.2, reviews: 18 },
  { id: 'bm-4', title: 'Face Moisturiser', price: 89.99, description: 'Daily face moisturiser for men 100ml', image: '/images/face-cream-men.jpg', category: 'bodycare-men', stock: 18, rating: 4.5, reviews: 12 },

  // Textbooks
  { id: 'tb-1', title: 'Management Principles', price: 549.99, description: 'Introduction to Management textbook', image: '/images/management-book.jpg', category: 'textbooks', stock: 8, trending: true, rating: 4.3, reviews: 9 },
  { id: 'tb-2', title: 'Economics 101', price: 499.99, description: 'Principles of Economics, 5th edition', image: '/images/economics-book.jpg', category: 'textbooks', stock: 6, rating: 4.4, reviews: 7 },
  { id: 'tb-3', title: 'Calculus Textbook', price: 629.99, description: 'Advanced Calculus for university', image: '/images/calculus-book.jpg', category: 'textbooks', stock: 5, rating: 4.5, reviews: 6 },
  { id: 'tb-4', title: 'Psychology Textbook', price: 579.99, description: 'Introduction to Psychology, latest edition', image: '/images/psychology-book.jpg', category: 'textbooks', stock: 7, rating: 4.2, reviews: 8 },

  // Toys & Games
  { id: 'tg-1', title: 'UNO Card Game', price: 79.99, description: 'Classic UNO card game for family fun', image: '/images/uno.jpg', category: 'toys-games', stock: 20, trending: true, rating: 4.8, reviews: 42 },
  { id: 'tg-2', title: 'Chess Set', price: 199.99, description: 'Wooden foldable chess set', image: '/images/chess.jpg', category: 'toys-games', stock: 10, rating: 4.6, reviews: 15 },
  { id: 'tg-3', title: 'Jenga Blocks', price: 149.99, description: '54-piece wooden Jenga tower game', image: '/images/jenga.jpg', category: 'toys-games', stock: 14, rating: 4.5, reviews: 21 },
  { id: 'tg-4', title: 'Fidget Cube', price: 49.99, description: '6-sided fidget cube, stress reliever', image: '/images/fidget-cube.jpg', category: 'toys-games', stock: 30, rating: 4.3, reviews: 18 },

  // Earphones & Headphones
  { id: 'ep-1', title: 'Wired Earphones', price: 89.99, description: 'In-ear wired earphones with mic', image: '/images/wired-earphones.jpg', category: 'earphones', stock: 25, rating: 4.2, reviews: 28 },
  { id: 'ep-2', title: 'Wireless Earbuds', price: 299.99, originalPrice: 399.99, description: 'Bluetooth 5.0 true wireless earbuds', image: '/images/wireless-earbuds.jpg', category: 'earphones', stock: 15, special: true, rating: 4.6, reviews: 35 },
  { id: 'ep-3', title: 'Over-Ear Headphones', price: 449.99, description: 'Comfortable over-ear wireless headphones', image: '/images/headphones.jpg', category: 'earphones', stock: 10, trending: true, rating: 4.7, reviews: 24 },
  { id: 'ep-4', title: 'Gaming Headset', price: 379.99, description: 'Gaming headset with LED and mic', image: '/images/gaming-headset.jpg', category: 'earphones', stock: 12, rating: 4.4, reviews: 19 },

  // Perfume
  { id: 'pf-1', title: 'Fresh Aqua EDT', price: 349.99, description: 'Fresh aquatic eau de toilette 100ml', image: '/images/aqua-perfume.jpg', category: 'perfume', stock: 10, trending: true, rating: 4.5, reviews: 16 },
  { id: 'pf-2', title: 'Floral EDP', price: 449.99, description: 'Elegant floral eau de parfum 50ml', image: '/images/floral-perfume.jpg', category: 'perfume', stock: 8, rating: 4.6, reviews: 13 },
  { id: 'pf-3', title: 'Woody Musk EDT', price: 399.99, description: 'Warm woody musk scent 100ml', image: '/images/woody-perfume.jpg', category: 'perfume', stock: 12, new: true, rating: 4.4, reviews: 11 },

  // Phone & Laptop Stickers
  { id: 'st-1', title: 'Vinyl Sticker Pack', price: 49.99, description: '50-pack assorted vinyl stickers', image: '/images/sticker-pack.jpg', category: 'stickers', stock: 30, trending: true, rating: 4.5, reviews: 32 },
  { id: 'st-2', title: 'Aesthetic Sticker Set', price: 39.99, description: '30-pack aesthetic theme stickers', image: '/images/aesthetic-stickers.jpg', category: 'stickers', stock: 25, rating: 4.3, reviews: 19 },
  { id: 'st-3', title: 'Laptop Skin Decal', price: 79.99, description: 'Universal laptop skin decal 15.6"', image: '/images/laptop-skin.jpg', category: 'stickers', stock: 18, rating: 4.4, reviews: 14 },

  // Manicure & Pedicure
  { id: 'mp-1', title: 'Nail Clipper Set', price: 69.99, description: '7-piece stainless steel nail care set', image: '/images/nail-clipper.jpg', category: 'manicure', stock: 20, rating: 4.3, reviews: 16 },
  { id: 'mp-2', title: 'Nail Polish Set', price: 99.99, description: '8-colour nail polish collection', image: '/images/nail-polish.jpg', category: 'manicure', stock: 15, trending: true, rating: 4.5, reviews: 22 },
  { id: 'mp-3', title: 'Electric Nail Drill', price: 199.99, description: 'USB electric nail drill with bits', image: '/images/nail-drill.jpg', category: 'manicure', stock: 8, rating: 4.4, reviews: 12 },

  // Hoodies & Sweatshirts
  { id: 'hs-1', title: 'Black Zip Hoodie', price: 349.99, description: 'Classic black zip-up hoodie, fleece-lined', image: '/images/black-hoodie.jpg', category: 'hoodies', stock: 15, trending: true, rating: 4.6, reviews: 29 },
  { id: 'hs-2', title: 'Grey Crew Sweatshirt', price: 299.99, description: 'Comfortable grey crew neck sweatshirt', image: '/images/grey-sweatshirt.jpg', category: 'hoodies', stock: 12, rating: 4.4, reviews: 17 },
  { id: 'hs-3', title: 'Oversized Hoodie', price: 379.99, description: 'Trendy oversized hoodie, unisex', image: '/images/oversized-hoodie.jpg', category: 'hoodies', stock: 10, new: true, rating: 4.5, reviews: 14 },
  { id: 'hs-4', title: 'Cropped Sweatshirt', price: 279.99, description: 'Cropped fit sweatshirt, pastel colours', image: '/images/cropped-sweat.jpg', category: 'hoodies', stock: 14, rating: 4.3, reviews: 11 },

  // Sunglasses
  { id: 'sg-1', title: 'Classic Aviators', price: 159.99, description: 'UV400 aviator sunglasses, gold frame', image: '/images/aviators.jpg', category: 'sunglasses', stock: 18, trending: true, rating: 4.5, reviews: 24 },
  { id: 'sg-2', title: 'Wayfarer Style', price: 139.99, description: 'Black wayfarer sunglasses', image: '/images/wayfarer.jpg', category: 'sunglasses', stock: 20, rating: 4.4, reviews: 19 },
  { id: 'sg-3', title: 'Round Retro Shades', price: 129.99, description: 'Round retro style sunglasses', image: '/images/round-sunglasses.jpg', category: 'sunglasses', stock: 15, rating: 4.3, reviews: 13 },

  // Back to School
  { id: 'bs-1', title: 'Casio Calculator', price: 249.99, description: 'Casio scientific calculator fx-991ES', image: '/images/casio-calc.jpg', category: 'back-to-school', stock: 12, trending: true, rating: 4.7, reviews: 36 },
  { id: 'bs-2', title: 'A4 Notebook 5-Pack', price: 79.99, description: '5-pack hardcover A4 ruled notebooks', image: '/images/notebook.jpg', category: 'back-to-school', stock: 25, rating: 4.4, reviews: 22 },
  { id: 'bs-3', title: 'Pens Assorted 20-Pack', price: 49.99, description: '20 assorted ballpoint pens, various colours', image: '/images/pens.jpg', category: 'back-to-school', stock: 30, rating: 4.3, reviews: 18 },
  { id: 'bs-4', title: 'Highlighters 6-Pack', price: 39.99, description: 'Fluorescent highlighters, 6 colours', image: '/images/highlighters.jpg', category: 'back-to-school', stock: 28, rating: 4.5, reviews: 15 },
  { id: 'bs-5', title: 'Pencil Case', price: 59.99, description: 'Large capacity canvas pencil case', image: '/images/pencil-case.jpg', category: 'back-to-school', stock: 22, rating: 4.2, reviews: 12 },

  // Celebrations
  { id: 'cb-1', title: 'Birthday Balloons Set', price: 69.99, description: '30-pack assorted birthday balloons', image: '/images/balloons.jpg', category: 'celebrations', stock: 20, trending: true, rating: 4.4, reviews: 19 },
  { id: 'cb-2', title: 'Graduation Sash', price: 89.99, description: 'Class of 2025 graduation sash', image: '/images/grad-sash.jpg', category: 'celebrations', stock: 15, rating: 4.5, reviews: 11 },
  { id: 'cb-3', title: 'Party Banner Kit', price: 49.99, description: 'Happy Birthday banner with decorations', image: '/images/party-banner.jpg', category: 'celebrations', stock: 18, rating: 4.3, reviews: 14 },
  { id: 'cb-4', title: 'Photo Props Set', price: 59.99, description: '20-piece photo booth props set', image: '/images/photo-props.jpg', category: 'celebrations', stock: 25, rating: 4.2, reviews: 9 },

  // Bicycles
  { id: 'bc-1', title: 'Mountain Bike 26"', price: 2499.99, description: '26-inch mountain bike, 21-speed', image: '/images/mountain-bike.jpg', category: 'bicycles', stock: 4, trending: true, rating: 4.6, reviews: 8 },
  { id: 'bc-2', title: 'City Cruiser Bike', price: 1899.99, description: 'Single-speed city cruiser bicycle', image: '/images/city-bike.jpg', category: 'bicycles', stock: 5, rating: 4.4, reviews: 6 },
  { id: 'bc-3', title: 'Bike Helmet', price: 299.99, description: 'Adjustable safety bike helmet', image: '/images/bike-helmet.jpg', category: 'bicycles', stock: 12, rating: 4.5, reviews: 14 },

  // Shoes
  { id: 'sh-1', title: 'White Sneakers', price: 449.99, description: 'Classic white canvas sneakers', image: '/images/white-sneakers.jpg', category: 'shoes', stock: 15, trending: true, rating: 4.5, reviews: 31 },
  { id: 'sh-2', title: 'Running Shoes', price: 699.99, description: 'Lightweight running shoes, breathable mesh', image: '/images/running-shoes.jpg', category: 'shoes', stock: 10, rating: 4.6, reviews: 22 },
  { id: 'sh-3', title: 'Slip-On Vans Style', price: 379.99, description: 'Casual slip-on canvas shoes', image: '/images/slipon-shoes.jpg', category: 'shoes', stock: 14, rating: 4.4, reviews: 17 },
  { id: 'sh-4', title: 'Hiking Boots', price: 899.99, description: 'Waterproof hiking boots, outdoor', image: '/images/hiking-boots.jpg', category: 'shoes', stock: 8, rating: 4.5, reviews: 12 },
];

export const iconMap: Record<string, string> = {
  'LayoutGrid': 'LayoutGrid',
  'CookingPot': 'CookingPot',
  'Lightbulb': 'Lightbulb',
  'Sparkles': 'Sparkles',
  'Shirt': 'Shirt',
  'Palette': 'Palette',
  'PersonStanding': 'PersonStanding',
  'Gem': 'Gem',
  'Droplets': 'Droplets',
  'Wind': 'Wind',
  'HeartPulse': 'HeartPulse',
  'FlaskConical': 'FlaskConical',
  'BookOpen': 'BookOpen',
  'Gamepad2': 'Gamepad2',
  'Headphones': 'Headphones',
  'SprayCan': 'SprayCan',
  'Sticker': 'Sticker',
  'Hand': 'Hand',
  'Cloud': 'Cloud',
  'Sun': 'Sun',
  'Backpack': 'Backpack',
  'PartyPopper': 'PartyPopper',
  'Bike': 'Bike',
  'Footprints': 'Footprints',
};

export const BANK_DETAILS = {
  bank: 'Capitec',
  accountName: 'MR Ragedi NG',
  accountNumber: '2081845985',
  branchCode: '470010',
  payshapNumber: '0631917709',
};

export const DELIVERY_DAYS_MIN = 1;
export const DELIVERY_DAYS_MAX = 8;
export const FREE_DELIVERY_THRESHOLD = 150;
export const LOWER_CAMPUS_FEE = 20;
export const UPPER_CAMPUS_FEE = 25;

export function getDeliveryFee(subtotal: number, location: 'lower' | 'upper'): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return location === 'upper' ? UPPER_CAMPUS_FEE : LOWER_CAMPUS_FEE;
}

export function getDeliveryLabel(location: 'lower' | 'upper'): string {
  return location === 'upper' ? 'Upper Campus' : 'Lower Campus';
}

export function generateOrderId(): string {
  return `YAF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isSequential = /^(12345678|abcdefgh|password|qwertyui)$/i.test(password);
  return hasNumber && hasLetter && hasSpecial && !isSequential;
}

export function generateRecoveryCode(): string {
  const digits = Math.floor(100 + Math.random() * 900).toString();
  const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                  String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return digits + letters;
}

export const STATUS_STEPS = [
  { id: 'order_received', label: 'Order Received', description: 'We have received your order and are preparing it.' },
  { id: 'shipped', label: 'Order Shipped', description: 'Your order has been shipped from our warehouse.' },
  { id: 'arrived_storage', label: 'At Storage Facility', description: 'Your order has arrived at Grahamstown storage facility.' },
  { id: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order will be delivered today.' },
  { id: 'ready_for_pickup', label: 'Ready for Collection', description: 'Young Agripreneurs Store has your order ready.' },
  { id: 'driver_nearby', label: 'Driver Nearby', description: 'Driver is around campus, please come and get your order.' },
  { id: 'delivered', label: 'Delivered', description: 'Order delivered successfully!' },
];