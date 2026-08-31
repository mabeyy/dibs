<?php

use App\Enums\ListingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('brand')->nullable();
            $table->string('size')->nullable();
            $table->string('condition');
            // Fixed-price listings store their price here (minor units / cents).
            // Auction listings leave this null and price via the auctions table.
            $table->unsignedInteger('price_cents')->nullable();
            $table->string('status')->default(ListingStatus::Draft->value);
            // App-level link to the winning/purchasing order. No DB FK to avoid
            // a circular dependency with the orders table.
            $table->unsignedBigInteger('sold_order_id')->nullable()->index();
            $table->timestamps();

            $table->index(['status', 'category']);
            $table->index(['shop_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
