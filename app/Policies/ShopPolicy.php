<?php

namespace App\Policies;

use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    /**
     * A user may open at most one shop.
     */
    public function create(User $user): bool
    {
        return $user->shop()->doesntExist();
    }

    /**
     * Only the owner may manage their shop.
     */
    public function update(User $user, Shop $shop): bool
    {
        return $user->id === $shop->owner_id;
    }

    /**
     * A verified shop owner may publish listings.
     */
    public function publishListings(User $user, Shop $shop): bool
    {
        return $user->id === $shop->owner_id && $shop->isVerified();
    }
}
