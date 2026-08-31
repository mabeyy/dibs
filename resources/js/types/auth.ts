export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    is_admin?: boolean;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type NotificationFeedItem = {
    id: string;
    type: string;
    message: string;
    read_at: string | null;
    created_at: string;
    listing_id?: number;
    order_id?: number;
    conversation_id?: number;
};

export type Auth = {
    user: User;
    notifications?: {
        unread: number;
        items: NotificationFeedItem[];
    } | null;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
