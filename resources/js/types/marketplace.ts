export type ShopStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type Category = 'clothing' | 'watches' | 'bags';
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
