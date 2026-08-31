<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Shipping destination. Nullable because auction-won orders are
            // created before the winner has supplied an address; buy-now orders
            // require it via validation at checkout.
            $table->string('ship_name')->nullable()->after('amount_cents');
            $table->string('ship_line1')->nullable()->after('ship_name');
            $table->string('ship_line2')->nullable()->after('ship_line1');
            $table->string('ship_city')->nullable()->after('ship_line2');
            $table->string('ship_region')->nullable()->after('ship_city');
            $table->string('ship_postal_code')->nullable()->after('ship_region');
            $table->string('ship_country')->nullable()->after('ship_postal_code');
            $table->string('ship_phone')->nullable()->after('ship_country');

            // Seller-arranged shipment details, recorded when marking as shipped.
            $table->string('shipping_carrier')->nullable()->after('ship_phone');
            $table->string('tracking_number')->nullable()->after('shipping_carrier');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'ship_name',
                'ship_line1',
                'ship_line2',
                'ship_city',
                'ship_region',
                'ship_postal_code',
                'ship_country',
                'ship_phone',
                'shipping_carrier',
                'tracking_number',
            ]);
        });
    }
};
