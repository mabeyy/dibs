export type ShopStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type Category =
    | 'clothing'
    | 'bags'
    | 'shoes'
    | 'watches'
    | 'accessories'
    | 'jewelry';
export type Subcategory =
    | 't-shirts'
    | 'shirts-blouses'
    | 'polo-shirts'
    | 'dresses'
    | 'skirts'
    | 'pants'
    | 'jeans'
    | 'shorts'
    | 'jackets'
    | 'hoodies-sweaters'
    | 'activewear'
    | 'vintage'
    | 'shoulder-bags'
    | 'handbags'
    | 'crossbody-bags'
    | 'sling-bags'
    | 'tote-bags'
    | 'backpacks'
    | 'wallets'
    | 'pouches'
    | 'sneakers'
    | 'casual-shoes'
    | 'boots'
    | 'sandals'
    | 'heels'
    | 'flats'
    | 'slides'
    | 'analog'
    | 'digital'
    | 'sports'
    | 'luxury'
    | 'caps-hats'
    | 'sunglasses'
    | 'belts'
    | 'scarves'
    | 'ties'
    | 'hair-accessories'
    | 'necklaces'
    | 'earrings'
    | 'bracelets'
    | 'rings'
    | 'brooches';
export type ListingType = 'auction' | 'fixed';
export type ListingStatus = 'draft' | 'active' | 'ended' | 'sold';
export type ItemCondition = 'new_with_tags' | 'like_new' | 'good' | 'fair';
export type OrderStatus = 'pending' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'held' | 'released' | 'refunded';

export type ShopOwner = {
    id: number;
    name: string;
    email: string;
};

export type Shop = {
    id: number;
    owner_id: number;
    name: string;
    slug: string;
    bio: string | null;
    logo_path: string | null;
    status: ShopStatus;
    rejection_reason: string | null;
    rating_avg: number;
    ratings_count: number;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    owner?: ShopOwner;
};

export type ListingImage = {
    id: number;
    path: string;
    url: string;
    sort_order: number;
};

export type Auction = {
    id: number;
    listing_id: number;
    starting_bid_cents: number;
    reserve_price_cents: number | null;
    min_increment_cents: number;
    current_bid_cents: number | null;
    high_bidder_id: number | null;
    winner_id: number | null;
    starts_at: string;
    ends_at: string;
    closed_at: string | null;
    minimum_next_bid_cents?: number;
    bid_count?: number;
};

export type Listing = {
    id: number;
    shop_id: number;
    category: Category;
    subcategory: Subcategory | null;
    category_label: string | null;
    subcategory_label: string | null;
    type: ListingType;
    title: string;
    description: string | null;
    brand: string | null;
    size: string | null;
    condition: ItemCondition;
    price_cents: number | null;
    status: ListingStatus;
    created_at: string;
    updated_at: string;
    is_watched?: boolean;
    shop?: Shop;
    images?: ListingImage[];
    auction?: Auction | null;
};

export type Order = {
    id: number;
    listing_id: number;
    buyer_id: number;
    shop_id: number;
    amount_cents: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    ship_name: string | null;
    ship_line1: string | null;
    ship_line2: string | null;
    ship_city: string | null;
    ship_region: string | null;
    ship_postal_code: string | null;
    ship_country: string | null;
    ship_phone: string | null;
    shipping_carrier: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    received_at: string | null;
    cancelled_at: string | null;
    created_at: string;
    updated_at: string;
    listing?: Listing;
    shop?: Shop;
    buyer?: ShopOwner;
    review?: ShopReview | null;
};

export type ChatMessage = {
    id: number;
    body: string;
    sender_id: number;
    sender_name: string;
    created_at: string;
};

export type ConversationSummary = {
    id: number;
    listing: { id: number; title: string } | null;
    counterpart: { id: number; name: string } | null;
    unread_count: number;
    last_message_at: string | null;
};

export type ConversationDetail = {
    id: number;
    shop: { id: number; name: string; slug: string };
    listing: { id: number; title: string; slug?: string } | null;
    counterpart: { id: number; name: string } | null;
    messages: ChatMessage[];
};

export type AppNotification = {
    id: string;
    type: string;
    message: string;
    read_at: string | null;
    created_at: string;
    listing_id?: number;
    order_id?: number;
    conversation_id?: number;
};

export type ShopReview = {
    id: number;
    shop_id: number;
    buyer_id: number;
    order_id: number;
    rating: number;
    body: string | null;
    created_at: string;
    buyer?: ShopOwner;
};

export type SelectOption = {
    value: string;
    label: string;
};

/** Subcategory options keyed by category value, for dependent selects. */
export type SubcategoryMap = Record<string, SelectOption[]>;
