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
  { id: 'ka-1', title: 'Mellerware Kettle Cordless Glass Black 1.8L 2200W', price: 350.00, originalPrice: 399.00, description: 'Introducing the BrandMellerware Kettle, designed for efficiency and safety. With a generous 1.8-liter capacity and a sleek black finish, this high borosilicate glass kettle features a powerful 2200W concealed heating element, ensuring quick boiling. The automatic shut-off, boil-dry, and overheat protection features guarantee peace of mind, while the 360º swivel base and LED illumination light add convenience and style to your kitchen experience.', image: '/images/kettle.jpg', category: 'kitchen-appliances', stock: 15, trending: true, rating: 4.5, reviews: 28 },
  { id: 'ka-2', title: 'Toaster 2-Slicess, Stainless Steel, Black and Silver, 650W', price: 289.00, originalPrice: 329.99, description: 'Introducing the Silver Toaster, a compact and efficient kitchen essential for your breakfast preparation. With a 2-slice capacity and 650W power, it offers six adjustable browning levels to perfectly toast your bread or bagels to your liking. The convenient cancel function allows you to stop the toasting process at any time, while the removable crumb tray ensures easy cleaning and maintenance. Enjoy consistent performance and stylish design in one appliance', image: '/images/toaster.jpg', category: 'kitchen-appliances', stock: 12, rating: 4.3, reviews: 19 },
  { id: 'ka-3', title: 'Russell Hobbs 500W Royal Jug Blender', price: 879.00, description: 'the BrandRussell Hobbs Black Blender, featuring a 1.5-liter glass jug with a convenient grinder/mill attachment for versatile blending. With two speeds and a pulse function, you can easily control your blending tasks, while the safety lock mechanism and removable filter cap ensure secure operation. The non-slip feet provide added stability, making this blender not only efficient but also easy to clean and use in any kitchen.', image: '/images/blender.jpg', category: 'kitchen-appliances', stock: 8, new: true, rating: 4.6, reviews: 14 },
  { id: 'ka-4', title: 'Microwave Oven 20L', price: 1349.00, originalPrice: 1499.00, description: 'Compact 20L microwave with 5 power levels', image: '/images/microwave.jpg', category: 'kitchen-appliances', stock: 6, special: true, rating: 4.4, reviews: 32 },
  { id: 'ka-5', title: 'Russell Hobbs RHEP7 Electric Pressure Cooker, Silver/Black, 6 Litre Capacity', price: 2059.00, description: 'the BrandRussell Hobbs Silver/Black Slow Cooker, designed with a generous 6-liter capacity for all your culinary needs. Ideal for preparing stews, soups, meats, and more, it features convenient reheat and keep warm modes, along with user-friendly touch button settings. The 90-minute countdown timer with a digital LED display and nine advanced safety features ensure reliable performance and peace of mind while cooking. Enjoy effortless meals with this stylish and functional kitchen essential', image: '/images/rice-cooker.jpg', category: 'kitchen-appliances', stock: 10, rating: 4.2, reviews: 21 },

  // Indoor Lighting
  { id: 'il-1', title: 'LED Desk/Bedside Lamp', price: 129.00, description: ' the Norden LED Lamp, featuring touch control and a 360-degree gooseneck for versatile lighting. With three adjustable light modes—natural, white, and warm—you can create the perfect atmosphere while reducing eye strain. This compact, portable lamp is USB rechargeable, providing over 4 hours of illumination on a single charge, and consumes just 2.5W of power for an energy-efficient solution. Ideal for any desk or bedside table, it combines modern style with eco-friendly functionality.', image: '/images/desk-lamp.jpg', category: 'indoor-lighting', stock: 20, new: true, rating: 4.3, reviews: 16 },
  { id: 'il-2', title: 'Fairy Lights 10m', price: 79.00, description: '100 LED Purple Christmas Fairy Lights, a 10M extendable string perfect for enhancing your holiday decorations. Featuring eight adjustable lighting modes, including steady and flash, these lights create the ideal ambiance for parties, weddings, and home decor. Designed for both indoor and outdoor use, the IP44 waterproof rating ensures durability, while the energy-efficient LED bulbs offer long-lasting performance. Easily connect multiple strings to cover larger areas, making them a versatile addition to any festive setting.', image: '/images/fairy-lights.jpg', category: 'indoor-lighting', stock: 30, trending: true, rating: 4.7, reviews: 45 },
  { id: 'il-3', title: 'Smart Bulb Multicolor', price: 287.00, description: 'the Tapo L530E Smart Wi-Fi Light Bulb. This energy-efficient multicolor LED bulb offers 16 million shades and adjustable brightness, allowing you to create personalized lighting scenarios for any occasion. Control your lights remotely via the free Tapo app on iOS and Android, or use voice commands with Alexa and Google Assistant for hands-free convenience. With features like programmable settings, an absent mode for security, and no hub required for setup, this smart bulb seamlessly integrates into your smart home.', image: '/images/smart-bulb.jpg', category: 'indoor-lighting', stock: 18, rating: 4.1, reviews: 12 },
  { id: 'il-4', title: 'Bedside Night Light', price: 290.00, description: 'the Small Table Lamp, a compact and minimalist lighting solution perfect for bedrooms, living rooms, dorms, and offices. With a stylish design and warm white linen lampshade, this lamp provides soft, eye-friendly lighting that enhances any space warmth and comfort. Compatible with E27 standard bulbs (max 40W, bulb not included), it supports various bulb types and creates a cozy ambiance for reading or relaxing. Easy to install with a convenient cord switch, this lightweight lamp is ideal for adding a touch of elegance and functionality to your home.', image: '/images/night-light.jpg', category: 'indoor-lighting', stock: 25, rating: 4.5, reviews: 23 },

  // Household Cleaners
  { id: 'hc-1', title: 'Multi-Surface Cleaner Mr Muscle', price: 79.00, description: 'This 750 ml spray effectively cleans and disinfects various surfaces, eliminating harmful bacteria and viruses while leaving a fresh scent. Its easy-to-use trigger spray allows for hassle-free application, and it wipes off effortlessly without damaging surfaces or requiring scrubbing. Trust Mr Muscle for a reliable and efficient cleaning solution for your home.', image: '/images/surface-cleaner.jpg', category: 'household-cleaners', stock: 40, rating: 4.4, reviews: 18 },
  { id: 'hc-2', title: 'Dishwashing Liquid', price: 42.00, description: 'Sunlight Regular Dishwashing Liquid 750 ml', image: '/images/dish-liquid.jpg', category: 'household-cleaners', stock: 35, trending: true, rating: 4.2, reviews: 22 },
  { id: 'hc-3', title: 'Laundry Detergent OMO Auto Washing 3L', price: 190.00, description: 'OMO Stain Removal Auto Washing Liquid Detergent in a 3L bottle. Featuring EcoBoost technology, this liquid penetrates deep into fabrics to tackle tough stains effectively, offering unbeatable stain removal with just one capful. Made with naturally derived cleaning agents. Is tough on stains while being kinder to the planet and is suitable for all machine types. Each bottle cleans up to 40 loads, providing a convenient and efficient laundry solution without leaving any residue.', image: '/images/laundry.jpg', category: 'household-cleaners', stock: 22, rating: 4.6, reviews: 31 },
  { id: 'hc-4', title: 'Disinfectant Cleaner Spray Handy Andy 500 ml', price: 60.00, description: '500 ml Handy Andy Professional Disinfectant Cleaner Spray, 500 ml, is a fresh-scented, biodegradable spray designed for marble surfaces. It cleans and disinfects, removes daily kitchen dirt, and dries quickly for hygienic, safer surfaces.', image: '/images/disinfectant.jpg', category: 'household-cleaners', stock: 28, rating: 4.3, reviews: 15 },

  // Men's T-Shirts
  { id: 'mt-1', title: 'White T-shirt', price: 420.00, description: 'White Daniel Hechter T-shirt in a cotton-blend knit, featuring short sleeves and a clean white finish.', image: '/images/mens-white-tee.jpg', category: 'mens-tshirts', stock: 25, trending: true, rating: 4.5, reviews: 42 },
  { id: 'mt-2', title: 'Black Graphic Tee', price: 319.00, description: 'Black Fuel graphic T-shirt made from carded single jersey, with short sleeves and a classic black finish.', image: '/images/mens-graphic-tee.jpg', category: 'mens-tshirts', stock: 18, new: true, rating: 4.2, reviews: 19 },
  { id: 'mt-3', title: 'White and Navy Airtex Inset T-Shirt', price: 260.00, description: 'White and navy Hemisphere Sport T-shirt made from Airtex fabric, with short sleeves and a breathable, athletic look.', image: '/images/mens-navy-tee.jpg', category: 'mens-tshirts', stock: 20, rating: 4.3, reviews: 16 },
  { id: 'mt-4', title: 'Grey Polo Neck T-shirt', price: 109.99, description: 'the Truworths Man Grey Polo Neck T-shirt, featuring long sleeves and crafted from cotton-rich fleece for comfort and style.', image: '/images/mens-grey-tee.jpg', category: 'mens-tshirts', stock: 15, rating: 4.1, reviews: 11 },

  // Women's T-Shirts
  { id: 'wt-1', title: 'Pink Side Trim Cropped Top', price: 450.00, description: 'Inwear Pink Side Trim Cropped Top—a stylish crop top in vibrant pink, crafted from 100% polyester with side trim detail, short sleeves, and a classic crew neck.', image: '/images/womens-crop-tee.jpg', category: 'womens-tshirts', stock: 22, trending: true, rating: 4.4, reviews: 27 },
  { id: 'wt-2', title: 'Striped Oversized Polo Shirt', price: 190.00, description: 'a retro-inspired piece with brown and pink stripes, a relaxed fit, and classic polo collar. Crafted from breathable cotton single jersey with a half-button placket and 3/4 sleeves.', image: '/images/womens-pink-tee.jpg', category: 'womens-tshirts', stock: 16, new: true, rating: 4.6, reviews: 14 },
  { id: 'wt-3', title: 'Blue and White Striped Sweat Shirt', price: 340.00, description: 'This classic, nautical-inspired pullover features blue and white horizontal stripes, signature embroidery, a comfortable crew neck, and long sleeves.', image: '/images/womens-striped-tee.jpg', category: 'womens-tshirts', stock: 14, rating: 4.2, reviews: 9 },
  { id: 'wt-4', title: 'Beige Suiting Cropped Bomber Jacket', price: 600.00, description: 'a modern classic in a versatile beige polyblend suiting fabric, perfect for adding a casual edge to any look.', image: '/images/womens-black-tee.jpg', category: 'womens-tshirts', stock: 19, rating: 4.3, reviews: 13 },

  // Makeup
  { id: 'mu-1', title: '6 Matte Lipstick with 6 Lipliners Durable Lip Gloss(12PCS)', price: 528.00, originalPrice: 549.00, description: '12-piece Lip Gloss Kit, featuring 6 matte liquid lipsticks with matching lip liners and a moisturizing lip primer. Enjoy long-lasting, waterproof, and non-stick cup color in a range of high-pigment nude shades. The cruelty-free, semi-matte formula is moisturizing, comfortable, and stays flawless for up to 12 hours. Presented in a stylish gift box, this set is perfect for any occasion.', image: '/images/lipstick-set.jpg', category: 'makeup', stock: 12, special: true, rating: 4.7, reviews: 34 },
  { id: 'mu-2', title: 'Black Opal True Colour SPF15 Skin Perfecting Stick Foundation 14 g, Warm Almond', price: 445.00, description: 'Achieve a flawless finish with Black Opal True Colour SPF15 Skin Perfecting Stick Foundation in Warm Almond. This long-wear, full-coverage foundation stick features shade ID technology for a perfect match, is paraben-free, and is infused with vitamins C and E to nourish and brighten. Suitable for combination, dry, and normal skin types, it delivers buildable coverage, hydration, and SPF 15 protection for radiant, protected skin all day.', image: '/images/foundation.jpg', category: 'makeup', stock: 15, rating: 4.4, reviews: 21 },
  { id: 'mu-3', title: 'Eyeshadow Palette 10 g, 10 Pretty In Nude', price: 160.00, description: 'This compact 10g palette features super-soft, easy-to-apply powders that deliver rich, vibrant color payoff. Perfect for defining eyes with both subtle and bold looks, it’s ideal for travel and on-the-go touch-ups.', image: '/images/eyeshadow.jpg', category: 'makeup', stock: 10, trending: true, rating: 4.6, reviews: 28 },
  { id: 'mu-4', title: 'Maybelline New York Lash Sensational Sky High Mascara, Volumising & Lengthening Mascara', price: 275.00, description: '7.2 ml, Washable Flake-Free Formula Infused with Bamboo Extract & Fibres, Shade: 01, Black | With Bamboo Extract, Eyelash Lengthening, Flake-Free Formula, Washable Mascara, Full Volume', image: '/images/mascara.jpg', category: 'makeup', stock: 18, rating: 4.3, reviews: 17 },
  { id: 'mu-5', title: 'Makeup Brush Set', price: 229.00, description: '15-piece Premium Professional Makeup Brush Set. Featuring soft, silky nylon bristles and 2 triangle puffs, this versatile set covers all your contouring, blending, coloring, and highlighting needs. The brushes are fine, dense, and suitable for sensitive skin, ensuring flawless application and long-lasting use. Perfect for makeup beginners and enthusiasts, and makes an ideal gift for any occasion.', image: '/images/brush-set.jpg', category: 'makeup', stock: 8, new: true, rating: 4.5, reviews: 12 },

  // Leggings
  { id: 'lg-1', title: '2-Pack Brown & Black Cabled Leggings', price: 450.00, description: 'comfort and style with the Ginger Mary 2-Pack Brown & Black Cabled Leggings. These seamless, mid-waist leggings come in a versatile pack of two for everyday wear.', image: '/images/black-leggings.jpg', category: 'leggings', stock: 20, trending: true, rating: 4.5, reviews: 36 },
  { id: 'lg-2', title: 'Grey & Black High-Rise Leggings 2-Pack', price: 450.00, description: 'the OUTBACK RED Sport Grey & Black High-Rise Leggings 2-Pack. These seamless leggings feature a soft feel, wide waistband, and streamlined silhouette in versatile grey and black.', image: '/images/grey-leggings.jpg', category: 'leggings', stock: 15, rating: 4.4, reviews: 19 },
  { id: 'lg-3', title: 'Navy Printed Pyjama Se', price: 169.99, description: 'classic button-down set features an all-over "Lazy Days" print, soft poly knit fabric, and pink piping for a comfortable, stylish lounge look.', image: '/images/pattern-leggings.jpg', category: 'leggings', stock: 12, rating: 4.2, reviews: 14 },

  // Jewelry
  { id: 'jw-1', title: '10Pcs 14K Gold Plated French Earrings Hooks 10x16mm', price: 739.00, description: 'Enhance your jewelry creations with this 10-piece set of 14K gold-plated French earring hooks. Each 10x16mm hypoallergenic sterling silver hook features a secure loop and replaceable leverback design, ideal for dangle and hoop earrings. Perfect for DIY jewelry making and sensitive ears.', image: '/images/hoop-earrings.jpg', category: 'jewelry', stock: 18, trending: true, rating: 4.6, reviews: 24 },
  { id: 'jw-2', title: 'Necklaces for Women, 14K-Gold-Plated Layering Hexagon Letter ', price: 700.00, description: 'Necklace set. Featuring two 14K gold-plated brass paperclip chains (18"+2" and 14"+2" extensions), this layered design includes a hexagon charm engraved with your initial and a heart. Perfect for women and teen girls, it arrives in an elegant gift box—ideal for gifting or everyday wear. Nickel-free, no gemstone, and suitable for ages 6+.', image: '/images/layered-necklace.jpg', category: 'jewelry', stock: 14, rating: 4.4, reviews: 16 },
  { id: 'jw-3', title: 'Italian Charms Bracelet Set 9 modular 9mm charms', price: 930.00, description: 'a classic starter bracelet, 9 modular 9mm charms, and a handy tool for easy assembly. Made from durable stainless steel in silver and gold tones, the charms feature retractable snaps for effortless customization. Compatible with major Italian charm brands and perfect for gifting or DIY moments with loved ones.', image: '/images/charm-bracelet.jpg', category: 'jewelry', stock: 22, new: true, rating: 4.3, reviews: 11 },
  { id: 'jw-4', title: 'Stud Earring Set', price: 69.99, description: 'Set of 6 pairs of stud earrings', image: '/images/stud-set.jpg', category: 'jewelry', stock: 25, rating: 4.5, reviews: 19 },
  // Hair Dye
  { id: 'hd-1', title: 'Jet Black Hair Dye', price: 199.00, description: 'Permanent hair colour, jet black', image: '/images/black-dye.jpg', category: 'hair-dye', stock: 20, rating: 4.2, reviews: 15 },
  { id: 'hd-2', title: 'Burgundy Red Dye', price: 124.00, description: 'Vibrant burgundy red hair dye', image: '/images/burgundy-dye.jpg', category: 'hair-dye', stock: 15, trending: true, rating: 4.4, reviews: 22 },
  { id: 'hd-3', title: 'Honey Blonde Dye', price: 199.00, description: 'Warm honey blonde hair colour', image: '/images/blonde-dye.jpg', category: 'hair-dye', stock: 12, rating: 4.3, reviews: 13 },

  // Hair Styling Tools
  { id: 'hs-1', title: 'Hair Straightener', price: 249.00, originalPrice: 269.00, description: 'Ceramic plate hair straightener with temp control', image: '/images/straightener.jpg', category: 'hair-styling', stock: 8, special: true, rating: 4.7, reviews: 31 },
  { id: 'hs-2', title: 'Curling Wand', price: 330.00, description: '25mm barrel curling wand', image: '/images/curling-wand.jpg', category: 'hair-styling', stock: 10, rating: 4.5, reviews: 18 },
  { id: 'hs-3', title: 'Hair Dryer 2000W', price: 580.00, description: 'Professional 2000W ionic hair dryer', image: '/images/hair-dryer.jpg', category: 'hair-styling', stock: 12, trending: true, rating: 4.6, reviews: 25 },
  { id: 'hs-4', title: 'Hair Brush Set', price: 239.00, description: '3-piece detangling brush set', image: '/images/brush-set-hair.jpg', category: 'hair-styling', stock: 18, rating: 4.2, reviews: 14 },

  // Hair & Scalp Treatments
  { id: 'ht-1', title: 'Hair Growth Oil', price: 90.00, description: 'Castor oil blend for hair growth 100ml', image: '/images/hair-oil.jpg', category: 'hair-treatment', stock: 16, trending: true, rating: 4.5, reviews: 28 },
  { id: 'ht-2', title: 'Deep Conditioner', price: 209.00, description: 'Moisturising deep conditioner 300ml', image: '/images/conditioner.jpg', category: 'hair-treatment', stock: 20, rating: 4.4, reviews: 19 },
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
