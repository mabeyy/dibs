<?php

namespace App\Console\Commands;

use App\Services\AuctionService;
use Illuminate\Console\Command;

class CloseExpiredAuctions extends Command
{
    protected $signature = 'auctions:close-expired';

    protected $description = 'Settle auctions whose time is up: award winners, create orders, notify participants.';

    public function handle(AuctionService $auctions): int
    {
        $closed = $auctions->closeExpired();

        $this->info("Closed {$closed} auction(s).");

        return self::SUCCESS;
    }
}
