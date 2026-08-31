<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('starting_bid_cents');
            $table->unsignedInteger('reserve_price_cents')->nullable();
            $table->unsignedInteger('min_increment_cents')->default(100);
            $table->unsignedInteger('current_bid_cents')->nullable();
            $table->foreignId('high_bidder_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index('ends_at');
            $table->index('closed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};
