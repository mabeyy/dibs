<?php

namespace App\Policies;

use App\Enums\ListingStatus;
use App\Models\Listing;
use App\Models\User;

class ListingPolicy
{
    /**
     * The owner of the listing's shop may manage it.
     */
    public function update(User $user, Listing $listing): bool
    {
        return $this->owns($user, $listing);
    }

    public function delete(User $user, Listing $listing): bool
    {
        return $this->owns($user, $listing) && $listing->status !== ListingStatus::Sold;
    }

    /**
     * Publishing requires ownership and a verified shop.
     */
    public function publish(User $user, Listing $listing): bool
    {
        return $this->owns($user, $listing) && $listing->shop->isVerified();
    }

    private function owns(User $user, Listing $listing): bool
    {
        return $user->id === $listing->shop->owner_id;
    }
}
