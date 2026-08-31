<?php

namespace Database\Seeders;

use App\Enums\Category;
use App\Models\Auction;
use App\Models\Listing;
use App\Models\Shop;
use App\Models\User;
use App\Services\BidService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Dibs Admin',
            'email' => 'admin@dibs.test',
            'is_admin' => true,
        ]);

        $seller = User::factory()->create([
            'name' => 'Verified Seller',
            'email' => 'seller@dibs.test',
        ]);

        $buyer = User::factory()->create([
            'name' => 'Buyer',
            'email' => 'buyer@dibs.test',
        ]);

        // A live, verified shop owned by the demo seller.
        $shop = Shop::factory()->verified()->for($seller, 'owner')->create([
            'name' => 'Thrift Threads',
            'slug' => 'thrift-threads',
        ]);

        // Fixed-price stock across all three categories.
        Listing::factory()->for($shop)->count(8)->create();

        // A handful of live auctions ending at different times.
        $auctions = Listing::factory()
            ->for($shop)
            ->auction()
            ->ofCategory(Category::Watches)
            ->count(4)
            ->create()
            ->map(fn (Listing $listing) => Auction::factory()->for($listing)->create());

        // Seed some bidding activity on the first two auctions.
        $bids = app(BidService::class);
        foreach ($auctions->take(2) as $auction) {
            $bids->place($auction, $buyer, $auction->starting_bid_cents + 500);
        }

        // A shop awaiting the admin's review.
        Shop::factory()->create([
            'name' => 'Vintage Vault',
            'slug' => 'vintage-vault',
        ]);

        $this->command->info('Seeded admin@dibs.test, seller@dibs.test, buyer@dibs.test (password: "password").');
    }
}
